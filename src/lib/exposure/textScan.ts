// Mode 2 of "Vos données parlent": the user pastes their OWN bio, post or CV
// and we show what it reveals. Runs locally; secrets are masked in the
// output and are never tested, used or sent anywhere.
import type { Access, ItemId } from './model';

export type DetectorId =
  | 'email'
  | 'phone'
  | 'birthDate'
  | 'age'
  | 'place'
  | 'employer'
  | 'school'
  | 'family'
  | 'travel'
  | 'card'
  | 'iban'
  | 'secret'
  | 'otp'
  | 'handle';

export type ScanSeverity = 'low' | 'medium' | 'high' | 'critical';

interface Detector {
  id: DetectorId;
  severity: ScanSeverity;
  /** Self-audit item this finding feeds into the correlation engine. */
  item?: ItemId;
  pattern: RegExp;
  /** Mask the value in the report (secrets, card and ID numbers). */
  mask?: boolean;
  /** Extra check on the raw match (e.g. Luhn for card numbers). */
  accept?: (match: string) => boolean;
}

export interface ScanFinding {
  id: DetectorId;
  severity: ScanSeverity;
  /** What was found, masked when sensitive. Max 3 examples. */
  examples: string[];
}

export interface ScanReport {
  findings: ScanFinding[];
  /** Access map for the correlation engine: found = public. */
  access: Access;
}

export const MAX_SCAN_LENGTH = 10_000;
const MAX_EXAMPLES = 3;

function luhn(digits: string): boolean {
  const d = digits.replace(/\D/g, '');
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

// Generic address words (FR/EN) + well-known neighbourhoods as examples.
const PLACES =
  'quartier|cite|villa|rue|avenue|boulevard|immeuble|residence|lotissement|street|road|estate|neighbourhood|neighborhood|parcelles assainies|sicap|hlm|medina|liberte \\d|ouest foire|mermoz|almadies|ngor|yoff|ouakam|pikine|guediawaye|rufisque|keur massar|grand yoff|point e|fann|plateau|sacre[- ]coeur|mbao|thiaroye|cocody|yopougon|plateau|treichville|lekki|ikeja|surulere|east legon|osu|westlands|kibera|hamdallaye|ouaga 2000';

const DETECTORS: Detector[] = [
  // Order matters: specific numbers before generic phone numbers.
  {
    id: 'secret',
    severity: 'critical',
    item: 'secretsPublished',
    mask: true,
    pattern:
      /AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{36,}|AIza[0-9A-Za-z_-]{35}|xox[abprs]-[0-9A-Za-z-]{10,}|sk_live_[0-9a-zA-Z]{20,}|\bsk-[A-Za-z0-9_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|eyJ[\w-]{10,}\.[\w-]{10,}\.[\w-]{10,}|(?:password|passwd|pwd|mot de passe|mdp|code pin|pin)\s*[:=]\s*\S{3,}/gi,
  },
  { id: 'card', severity: 'critical', mask: true, pattern: /\b(?:\d[ -]?){13,19}\b/g, accept: luhn },
  { id: 'iban', severity: 'high', mask: true, pattern: /\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){3,7}\b/g },
  { id: 'otp', severity: 'high', mask: true, pattern: /\b(?:code|otp)\b[^\n]{0,20}?\b\d{4,8}\b/gi },
  { id: 'email', severity: 'medium', item: 'email', pattern: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g },
  {
    id: 'phone',
    severity: 'high',
    item: 'phone',
    // International (+225…, 00234…), Senegalese mobiles, local numbers starting with 0.
    pattern: /(?:\+|00)\d{1,3}[\s.-]?\d(?:[\s.-]?\d){6,11}\b|\b(?:7[05678]|3[03])[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}\b|\b0\d(?:[\s.-]?\d){7,9}\b/g,
  },
  {
    id: 'birthDate',
    severity: 'high',
    item: 'birthDate',
    pattern:
      /\b\d{1,2}[/.-]\d{1,2}[/.-](?:19|20)\d{2}\b|\bne(?:e)? (?:le )?\d{1,2}(?:er)? [a-z]+(?: (?:19|20)\d{2})?|\bborn (?:on )?\d{1,2} [a-z]+|\bnee? en (?:19|20)\d{2}|\bborn in (?:19|20)\d{2}/gi,
  },
  { id: 'age', severity: 'low', item: 'birthDate', pattern: /\bj'ai \d{2} ans\b|\b\d{2} ans aujourd'hui\b|\bi(?:'m| am) \d{2}(?: years old)?\b/gi },
  { id: 'place', severity: 'medium', item: 'address', pattern: new RegExp(`\\b(?:${PLACES})\\b[^,.\\n]{0,25}`, 'gi') },
  {
    id: 'employer',
    severity: 'medium',
    item: 'employer',
    pattern: /\b(?:je travaille (?:chez|a|au|pour)|travaille chez|employee? (?:chez|a)|stagiaire chez|works? (?:at|for)|working at|i work (?:at|for))\s+[^,.\n]{2,40}/gi,
  },
  {
    id: 'school',
    severity: 'medium',
    item: 'routine',
    pattern: /\b(?:etudiante?|eleve|lycee|college|universite|ucad|ugb|ecole|school|university|student at|studying at)\b[^,.\n]{0,40}/gi,
  },
  {
    id: 'family',
    severity: 'medium',
    item: 'family',
    pattern: /\b(?:mon fils|ma fille|mes enfants|mon mari|ma femme|mon epou(?:x|se)|ma mere|mon pere|ma soeur|mon frere|my (?:son|daughter|kids|children|husband|wife|mother|father))\b[^,.\n]{0,25}/gi,
  },
  {
    id: 'travel',
    severity: 'high',
    item: 'travelLive',
    pattern: /\b(?:en route pour|en voyage|je pars (?:a|en|au|pour|demain)|je serai absente?|absente? jusqu|vacances (?:a|en|au)|on vacation|travell?ing to|away until|out of office)\b[^.\n]{0,40}/gi,
  },
  { id: 'handle', severity: 'low', item: 'samePseudo', pattern: /(?:^|\s)@[A-Za-z0-9_.]{3,30}\b/g },
];

const stripAccents = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** "ghp_abc…" → "ghp_…(40)" — enough to recognise it, not to reuse it. */
function maskValue(v: string): string {
  const t = v.trim();
  return t.length <= 6 ? '•••' : `${t.slice(0, 4)}…(${t.length})`;
}

export function scanText(raw: string): ScanReport {
  // Accent-free copy so French patterns can be written without accents.
  let text = stripAccents(raw.slice(0, MAX_SCAN_LENGTH));
  const findings: ScanFinding[] = [];
  const access: Access = {};

  for (const d of DETECTORS) {
    const matches = (text.match(d.pattern) ?? []).map((m) => m.trim()).filter((m) => !d.accept || d.accept(m));
    if (matches.length === 0) continue;
    // Blank out what was matched so a card number is not also read as a phone number.
    for (const m of matches) text = text.split(m).join(' '.repeat(m.length));
    const examples = Array.from(new Set(matches)).slice(0, MAX_EXAMPLES).map((m) => (d.mask ? maskValue(m) : m));
    findings.push({ id: d.id, severity: d.severity, examples });
    if (d.item) access[d.item] = 1;
  }
  return { findings, access };
}
