// ASBO scam engine — 100% deterministic and local: no AI, no API, nothing
// leaves the device. Pipeline: normalise → text rules + URL analysis →
// weighted score (per-family caps) → combination rules → verdict + advice.
import { normalizeText, originalExcerpt } from './normalize';
import { BRANDS, extractUrls, type UrlFlag, type UrlReport } from './url';
import { CODE_NOTICE_RE, FAMILY_CAPS, NEGATION_BEFORE_RE, PHONE_RE, TEXT_RULES, type Family, type RuleId } from './rules';

export type SignalId =
  | RuleId
  | 'brandClaim'
  | 'brandLink'
  | 'linkPresent'
  | 'shortener'
  | 'ipLink'
  | 'punycode'
  | 'suspiciousTld'
  | 'phishyWords'
  | 'apk'
  | 'obfuscated'
  | 'phonePayment'
  | 'codeNotice';

export type ComboId =
  | 'codeAndLink'
  | 'codeAndFakeSite'
  | 'codeAndBrand'
  | 'threatAndLink'
  | 'feeForGain'
  | 'refundTrap'
  | 'familyMoney'
  | 'codeTheft';

export type Verdict = 'low' | 'moderate' | 'high' | 'critical';

export type AdviceId = 'noLink' | 'noCode' | 'noPay' | 'officialApp' | 'callBack' | 'refund' | 'job' | 'noApk' | 'alreadyDone' | 'report' | 'noProof';

export interface Signal {
  id: SignalId;
  family: Family;
  weight: number;
  /** Excerpt of the (normalised) message that triggered the rule. */
  evidence?: string;
}

export interface Analysis {
  /** 0–100, for display. */
  score: number;
  /** Uncapped sum, useful when calibrating the weights. */
  rawScore: number;
  verdict: Verdict;
  signals: Signal[];
  combos: ComboId[];
  urls: UrlReport[];
  /** Brands the message claims to come from. */
  brands: string[];
  advice: AdviceId[];
}

export const MAX_MESSAGE_LENGTH = 5000;

const URL_FLAG_SIGNALS: Partial<Record<UrlFlag, { id: SignalId; weight: number }>> = {
  shortener: { id: 'shortener', weight: 8 },
  ip: { id: 'ipLink', weight: 25 },
  brandMismatch: { id: 'brandLink', weight: 30 },
  typosquat: { id: 'brandLink', weight: 30 },
  punycode: { id: 'punycode', weight: 20 },
  suspiciousTld: { id: 'suspiciousTld', weight: 10 },
  phishyWords: { id: 'phishyWords', weight: 10 },
  apk: { id: 'apk', weight: 25 },
};

// Combination rules: some pairs are far more dangerous than their sum.
const COMBO_FLOORS: Record<ComboId, number> = {
  codeAndFakeSite: 95,
  codeAndLink: 85,
  codeTheft: 85,
  codeAndBrand: 75,
  feeForGain: 75,
  refundTrap: 75,
  familyMoney: 70,
  threatAndLink: 0, // bonus only
};
const THREAT_LINK_BONUS = 10;

function matchRule(plain: string, patterns: RegExp[], family: Family): string | null {
  for (const re of patterns) {
    const m = new RegExp(re.source, re.flags.replace('g', '')).exec(plain);
    if (!m) continue;
    // "Ne communiquez jamais votre code" is advice, not a request.
    if (family === 'sensitive' && NEGATION_BEFORE_RE.test(plain.slice(Math.max(0, m.index - 20), m.index))) continue;
    return m[0];
  }
  return null;
}

function scoreSignals(signals: Signal[]): number {
  const perFamily = new Map<Family, number>();
  for (const s of signals) perFamily.set(s.family, (perFamily.get(s.family) ?? 0) + s.weight);
  let total = 0;
  for (const [family, sum] of perFamily) total += Math.min(sum, FAMILY_CAPS[family]);
  return total;
}

function detectCombos(has: (id: SignalId) => boolean, urls: UrlReport[]): ComboId[] {
  const sensitive = has('askCode') || has('askPassword') || has('askCard');
  const anyLink = urls.length > 0;
  const combos: ComboId[] = [];
  if (sensitive && has('brandLink')) combos.push('codeAndFakeSite');
  else if (sensitive && anyLink) combos.push('codeAndLink');
  if (has('codeByMistake') && (has('askCode') || has('sendBack'))) combos.push('codeTheft');
  if (sensitive && has('brandClaim') && !combos.includes('codeAndFakeSite')) combos.push('codeAndBrand');
  if (has('suspendThreat') && anyLink) combos.push('threatAndLink');
  if (has('upfrontFee') && (has('prize') || has('freeMoney') || has('investment') || has('jobOffer'))) combos.push('feeForGain');
  if (has('jobOffer') && has('sendMoney') && !combos.includes('feeForGain')) combos.push('feeForGain');
  if (has('wrongTransfer') && (has('sendBack') || has('sendMoney') || has('askCode'))) combos.push('refundTrap');
  if (has('familyEmergency') && (has('sendMoney') || has('upfrontFee'))) combos.push('familyMoney');
  return combos;
}

function adviceFor(has: (id: SignalId) => boolean, urls: UrlReport[], verdict: Verdict): AdviceId[] {
  const advice: AdviceId[] = [];
  if (verdict === 'low') return ['noProof', 'officialApp'];
  if (urls.length > 0) advice.push('noLink');
  if (has('apk')) advice.push('noApk');
  if (has('askCode') || has('askPassword') || has('askCard') || has('codeByMistake') || has('askIdDocument')) advice.push('noCode');
  if (has('upfrontFee') || has('sendMoney') || has('investment')) advice.push('noPay');
  if (has('wrongTransfer')) advice.push('refund');
  if (has('familyEmergency')) advice.push('callBack');
  if (has('jobOffer')) advice.push('job');
  advice.push('officialApp', 'alreadyDone', 'report');
  return advice;
}

function verdictFor(score: number): Verdict {
  if (score >= 70) return 'critical';
  if (score >= 40) return 'high';
  if (score >= 20) return 'moderate';
  return 'low';
}

export function analyzeMessage(raw: string): Analysis {
  const { clean, plain, obfuscated } = normalizeText(raw.slice(0, MAX_MESSAGE_LENGTH));
  const signals: Signal[] = [];
  const add = (s: Signal) => {
    if (!signals.some((x) => x.id === s.id)) signals.push(s);
  };

  for (const rule of TEXT_RULES) {
    const m = matchRule(plain, rule.patterns, rule.family);
    if (m) add({ id: rule.id, family: rule.family, weight: rule.weight, evidence: originalExcerpt(clean, m) });
  }

  const brands = BRANDS.filter((b) => b.mention.test(plain)).map((b) => b.id);
  if (brands.length > 0) add({ id: 'brandClaim', family: 'impersonation', weight: 5, evidence: brands.join(', ') });

  const urls = extractUrls(clean);
  if (urls.length > 0) add({ id: 'linkPresent', family: 'link', weight: 5, evidence: urls.map((u) => u.host).join(', ') });
  for (const u of urls) {
    for (const flag of u.flags) {
      const sig = URL_FLAG_SIGNALS[flag];
      if (sig) add({ id: sig.id, family: 'link', weight: sig.weight, evidence: u.host });
    }
  }

  const has = (id: SignalId) => signals.some((s) => s.id === id);
  const phones = clean.match(PHONE_RE) ?? [];
  if (phones.length > 0 && (has('sendMoney') || has('upfrontFee') || has('wrongTransfer') || has('sendBack'))) {
    add({ id: 'phonePayment', family: 'payment', weight: 10, evidence: phones[0] });
  }
  if (obfuscated) add({ id: 'obfuscated', family: 'other', weight: 10 });
  const letters = clean.replace(/[^A-Za-zÀ-ÿ]/g, '');
  if ((letters.length > 20 && letters.replace(/[^A-ZÀ-Ý]/g, '').length / letters.length > 0.6) || /!{3,}/.test(clean)) {
    add({ id: 'shouting', family: 'other', weight: 5 });
  }

  const sensitiveAsked = has('askCode') || has('askPassword') || has('askCard') || has('codeByMistake');
  // A plain "your code is 1234, never share it" with no link is how real services write.
  const codeNotice = !sensitiveAsked && urls.length === 0 && CODE_NOTICE_RE.test(plain);
  if (codeNotice) add({ id: 'codeNotice', family: 'other', weight: -15 });

  const combos = detectCombos(has, urls);
  const rawScore = Math.max(0, scoreSignals(signals) + (combos.includes('threatAndLink') ? THREAT_LINK_BONUS : 0));
  const floor = Math.max(0, ...combos.map((c) => COMBO_FLOORS[c]));
  const score = Math.min(100, Math.max(rawScore, floor));
  const verdict = verdictFor(score);

  return { score, rawScore, verdict, signals, combos, urls, brands, advice: adviceFor(has, urls, verdict) };
}
