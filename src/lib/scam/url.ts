// URL extraction + offline analysis. No lookup is ever made: every flag is
// an indicator computed from the address itself, never proof.

export type UrlFlag =
  | 'shortener'
  | 'ip'
  | 'brandMismatch'
  | 'typosquat'
  | 'punycode'
  | 'suspiciousTld'
  | 'phishyWords'
  | 'manySubdomains'
  | 'apk'
  | 'official';

export interface UrlReport {
  url: string;
  host: string;
  flags: UrlFlag[];
  /** Brand imitated by the address, when one is detected. */
  brand?: string;
}

export interface Brand {
  id: string;
  /** How the brand is named in a message. */
  mention: RegExp;
  /** Words that betray the brand inside a domain name. */
  tokens: string[];
  /** Official domains (subdomains included). */
  official: string[];
}

// Only official domains we are sure of. A brand without a verified domain
// keeps "tokens: []": the message can say it claims to be that brand, but
// the engine never calls one of its links "fake" or "official".
export const BRANDS: Brand[] = [
  { id: 'Wave', mention: /\bwave\b/, tokens: ['wave'], official: ['wave.com'] },
  {
    id: 'Orange / Orange Money',
    mention: /\borange\b|\bom\b|orange money|sonatel|\bmax ?it\b/,
    tokens: ['orange', 'orangemoney', 'sonatel'],
    official: ['orange.sn', 'sonatel.sn', 'orange.com'],
  },
  { id: 'Free Money / Yas', mention: /free money|\byas\b|\bmixx\b/, tokens: [], official: [] },
  { id: 'WhatsApp', mention: /whatsapp/, tokens: ['whatsapp', 'whatsap'], official: ['whatsapp.com', 'whatsapp.net', 'wa.me'] },
  { id: 'Facebook', mention: /facebook|\bmeta\b/, tokens: ['facebook'], official: ['facebook.com', 'fb.com', 'fb.me', 'meta.com'] },
  { id: 'SENELEC', mention: /senelec|woyofal/, tokens: ['senelec'], official: ['senelec.sn'] },
  { id: 'Livraison (DHL, FedEx, La Poste)', mention: /la poste|\bdhl\b|fedex|\bcolis\b|parcel/, tokens: ['dhl', 'fedex'], official: ['dhl.com', 'fedex.com'] },
  { id: 'Administration sénégalaise', mention: /gouvernement|ministere|\bimpots\b|\bdgid\b|\bdouanes?\b|government/, tokens: ['gouv'], official: ['gouv.sn'] },
  { id: 'Banque', mention: /\bbanque\b|\bbank\b|\bcbao\b|ecobank|\bsgbs\b|\buba\b/, tokens: ['ecobank'], official: ['ecobank.com'] },
  { id: 'PayPal', mention: /paypal/, tokens: ['paypal'], official: ['paypal.com', 'paypal.me'] },
];

const SHORTENERS = [
  'bit.ly', 'tinyurl.com', 't.co', 'ow.ly', 'goo.gl', 'cutt.ly', 'rebrand.ly', 'is.gd', 'buff.ly',
  'shorturl.at', 'rb.gy', 't.ly', 's.id', 'tiny.cc', 'v.gd', 'bitly.com', 'tr.ee', 'linktr.ee', 'shorte.st',
];

const SUSPICIOUS_TLDS = [
  'xyz', 'top', 'icu', 'click', 'link', 'live', 'online', 'site', 'club', 'shop', 'vip', 'win', 'bid',
  'tk', 'ml', 'ga', 'cf', 'gq', 'rest', 'cyou', 'sbs', 'cfd', 'buzz', 'monster', 'quest', 'support',
];

// TLDs accepted for addresses written without "http" or "www" ("wave-bonus.xyz/claim").
const BARE_TLDS = [...SUSPICIOUS_TLDS, 'com', 'net', 'org', 'info', 'biz', 'sn', 'fr', 'io', 'co', 'me', 'app', 'store', 'ly', 'gd', 'cc', 'at', 'ee', 'id', 'ru', 'cn'];

const URL_RE = new RegExp(
  String.raw`\bhttps?:\/\/[^\s<>"')\]]+|\bwww\.[^\s<>"')\]]+|\b(?:[a-z0-9-]+\.)+(?:${BARE_TLDS.join('|')})\b(?:\/[^\s<>"')\]]*)?`,
  'gi',
);

const PHISHY_WORDS = /login|signin|verif|secure|securi|claim|bonus|update|confirm|kyc|account|compte|cadeau|gift|promo|reward|recompense|gagn|deblocage|unlock|wallet/;

const LEET: Record<string, string> = { '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a' };
const deLeet = (s: string) => s.replace(/[013457@]/g, (c) => LEET[c] ?? c);

/** Edit distance, capped: we only care whether it is ≤ 1. */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

function hostOf(url: string): string {
  const noScheme = url.replace(/^[a-z]+:\/\//i, '');
  const host = noScheme.split(/[/?#]/)[0].split('@').pop() ?? '';
  return host.replace(/:\d+$/, '').replace(/\.$/, '').toLowerCase();
}

const isOfficial = (host: string, domains: string[]) => domains.some((d) => host === d || host.endsWith(`.${d}`));

function brandFlags(host: string): { flag: UrlFlag; brand: string } | { flag: 'official'; brand: string } | null {
  const labels = host.split(/[.-]/).filter(Boolean);
  for (const brand of BRANDS) {
    if (isOfficial(host, brand.official)) return { flag: 'official', brand: brand.id };
  }
  for (const brand of BRANDS) {
    for (const label of labels) {
      if (brand.tokens.some((t) => label === t || (label.length > t.length + 2 && label.includes(t)))) {
        return { flag: 'brandMismatch', brand: brand.id };
      }
      const unLeet = deLeet(label);
      // Leetspeak ("wav3") for short names; one-letter typos only for 5+ letters,
      // so ordinary words ("save", "mood") are not taken for "wave" or "moov".
      if (brand.tokens.some((t) => t.length >= 4 && label !== t && (unLeet === t || (t.length >= 5 && withinOneEdit(unLeet, t))))) {
        return { flag: 'typosquat', brand: brand.id };
      }
    }
  }
  return null;
}

export function analyzeUrl(url: string): UrlReport {
  const host = hostOf(url);
  const flags: UrlFlag[] = [];
  let brand: string | undefined;

  if (SHORTENERS.includes(host)) flags.push('shortener');
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith('[')) flags.push('ip');
  if (host.includes('xn--') || /[^\x00-\x7f]/.test(host)) flags.push('punycode');
  const tld = host.split('.').pop() ?? '';
  if (SUSPICIOUS_TLDS.includes(tld)) flags.push('suspiciousTld');
  if (host.split('.').length > 4) flags.push('manySubdomains');
  if (/\.apk(\b|$)/i.test(url)) flags.push('apk');

  const b = brandFlags(host);
  if (b) {
    flags.push(b.flag);
    brand = b.brand;
  }
  if (b?.flag !== 'official' && PHISHY_WORDS.test(url.toLowerCase())) flags.push('phishyWords');

  return { url, host, flags, brand };
}

export function extractUrls(text: string): UrlReport[] {
  const seen = new Set<string>();
  const reports: UrlReport[] = [];
  for (const match of text.match(URL_RE) ?? []) {
    const url = match.replace(/[.,;:!?]+$/, '');
    if (seen.has(url)) continue;
    seen.add(url);
    reports.push(analyzeUrl(url));
  }
  return reports;
}
