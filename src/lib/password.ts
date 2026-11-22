// Client-side password strength estimator. Nothing typed here ever leaves the
// device (no network, no storage, no analytics payload).
//
// Model: estimate the number of guesses an attacker needs, taking the
// cheapest of (a) brute force over the character pool and (b) smarter
// pattern attacks (common passwords, dictionary word + digits, sequences).
// Crack time assumes an offline attack at 10 billion guesses per second.

export type Level = 0 | 1 | 2 | 3 | 4;

export type FindingKey =
  | 'common'
  | 'wordDigits'
  | 'onlyDigits'
  | 'sequence'
  | 'repeat'
  | 'year'
  | 'short'
  | 'noUpper'
  | 'noDigit'
  | 'noSymbol'
  | 'passphrase';

export interface PasswordReport {
  guesses: number;
  seconds: number;
  level: Level;
  findings: FindingKey[];
}

export const GUESSES_PER_SECOND = 1e10;

// Most-used passwords + words people in Senegal commonly build them from.
const COMMON = new Set([
  '123456', '1234567', '12345678', '123456789', '1234567890', '000000', '111111',
  '123123', '654321', '777777', '221221', 'password', 'motdepasse', 'azerty',
  'azertyuiop', 'qwerty', 'admin', 'bonjour', 'soleil', 'iloveyou', 'jetaime',
  'senegal', 'dakar', 'thies', 'touba', 'teranga', 'galsen', 'wave', 'orange',
  'free', 'yas', 'sonatel', 'lions', 'jaraaf', 'bismillah', 'alhamdoulillah',
  'inchallah', 'mashallah', 'passer', 'passe', 'secret', 'amour', 'princesse',
  'moussa', 'mamadou', 'modou', 'ibrahima', 'cheikh', 'abdou', 'ousmane',
  'serigne', 'fatou', 'aminata', 'awa', 'aissatou', 'mariama', 'khady', 'ndeye',
  'astou', 'coumba', 'binta', 'mame', 'baye', 'maman', 'papa', 'football',
]);

const SEQUENCES = ['0123456789', 'abcdefghijklmnopqrstuvwxyz', 'azertyuiop', 'qwertyuiop', 'qsdfghjklm'];

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's' };

function deLeet(s: string): string {
  return s.toLowerCase().replace(/[013457@$]/g, (c) => LEET[c] ?? c);
}

function poolSize(pw: string): number {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
  return pool;
}

function hasSequence(pw: string): boolean {
  const lower = pw.toLowerCase();
  for (let i = 0; i + 4 <= lower.length; i++) {
    const chunk = lower.slice(i, i + 4);
    const rev = [...chunk].reverse().join('');
    if (SEQUENCES.some((seq) => seq.includes(chunk) || seq.includes(rev))) return true;
  }
  return false;
}

export function levelFor(seconds: number): Level {
  if (seconds < 1) return 0;
  if (seconds < 86_400) return 1; // < 1 day
  if (seconds < 31_536_000 * 10) return 2; // < 10 years
  if (seconds < 31_536_000 * 10_000) return 3; // < 10,000 years
  return 4;
}

/** Guesses for "word + digits + symbols" given how big the word list is. */
function wordAttackGuesses(match: RegExpExecArray, dictionarySize: number): number {
  const digits = match[2].length;
  const symbols = match[3].length;
  const capitalised = /[A-Z]/.test(match[1]) ? 4 : 1;
  return dictionarySize * Math.pow(10, digits) * Math.pow(33, symbols) * capitalised;
}

export function analyzePassword(pw: string): PasswordReport {
  const findings: FindingKey[] = [];
  if (!pw) return { guesses: 0, seconds: 0, level: 0, findings };

  const bruteForce = Math.pow(poolSize(pw), pw.length);
  let guesses = bruteForce;

  // Word + optional digits/symbols suffix, e.g. "Senegal2024!", "Awa221".
  const wordMatch = /^([a-zA-Z@$013457]+?)(\d{0,6})([^A-Za-z0-9]{0,2})$/.exec(pw);
  const base = wordMatch ? deLeet(wordMatch[1]).replace(/[^a-z]/g, '') : '';

  if (COMMON.has(pw.toLowerCase()) || COMMON.has(deLeet(pw))) {
    findings.push('common');
    guesses = Math.min(guesses, 1e3);
  } else if (wordMatch && COMMON.has(base)) {
    findings.push('common', 'wordDigits');
    guesses = Math.min(guesses, wordAttackGuesses(wordMatch, 1e3));
  } else if (wordMatch && /[a-zA-Z]{3}/.test(wordMatch[1])) {
    // Unknown word + digits: attackers use dictionaries of ~1M words/names.
    findings.push('wordDigits');
    guesses = Math.min(guesses, wordAttackGuesses(wordMatch, 1e6));
  }

  // Several common words glued together, e.g. "Dakar_Thies_1998".
  const tokens = pw.split(/[^a-zA-Z]+/).filter(Boolean);
  if (tokens.length >= 2 && tokens.every((tk) => COMMON.has(deLeet(tk)))) {
    if (!findings.includes('common')) findings.push('common');
    const digits = (pw.match(/\d/g) ?? []).length;
    const symbols = (pw.match(/[^A-Za-z0-9]/g) ?? []).length;
    guesses = Math.min(guesses, Math.pow(1e3, tokens.length) * Math.pow(10, digits) * Math.pow(33, symbols) * 4);
  }

  if (/^\d+$/.test(pw)) {
    findings.push('onlyDigits');
    guesses = Math.min(guesses, Math.pow(10, pw.length));
  }
  if (hasSequence(pw)) {
    findings.push('sequence');
    guesses = Math.min(guesses, Math.max(1e4, bruteForce / 1e6));
  }
  if (/(.)\1{2,}/.test(pw)) {
    findings.push('repeat');
    guesses = Math.min(guesses, Math.max(1e4, bruteForce / 1e4));
  }
  if (/(19[4-9]\d|20[0-3]\d)/.test(pw)) findings.push('year');

  const words = pw.trim().split(/[\s\-_.]+/).filter((w) => w.length >= 3);
  const isPassphrase = words.length >= 4 && pw.length >= 20;
  if (isPassphrase) findings.push('passphrase');

  if (pw.length < 12 && !isPassphrase) findings.push('short');
  if (!isPassphrase) {
    if (!/[A-Z]/.test(pw)) findings.push('noUpper');
    if (!/[0-9]/.test(pw)) findings.push('noDigit');
    if (!/[^A-Za-z0-9]/.test(pw)) findings.push('noSymbol');
  }

  const seconds = guesses / GUESSES_PER_SECOND;
  return { guesses, seconds, level: levelFor(seconds), findings };
}

/** Pick `count` random words using the CSPRNG (never Math.random). */
export function generatePassphrase(words: readonly string[], count = 4): string {
  const picks = new Uint32Array(count + 1);
  crypto.getRandomValues(picks);
  const chosen = Array.from(picks.slice(0, count), (n) => words[n % words.length]);
  const number = String(picks[count] % 100).padStart(2, '0');
  return `${chosen.join('-')}-${number}`;
}

export type TimeUnit = 'instant' | 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years' | 'centuries';

const UNIT_SECONDS: [TimeUnit, number][] = [
  ['seconds', 1],
  ['minutes', 60],
  ['hours', 3600],
  ['days', 86_400],
  ['months', 2_592_000],
  ['years', 31_536_000],
  ['centuries', 3_153_600_000],
];

/** Human-friendly bucket for a duration, e.g. { value: 3, unit: 'hours' }. */
export function humanTime(seconds: number): { value: number; unit: TimeUnit } {
  if (seconds < 1) return { value: 0, unit: 'instant' };
  for (let i = 0; i < UNIT_SECONDS.length - 1; i++) {
    const [unit, size] = UNIT_SECONDS[i];
    if (seconds < UNIT_SECONDS[i + 1][1]) return { value: Math.max(1, Math.floor(seconds / size)), unit };
  }
  // Beyond a century the exact number is meaningless; report "centuries".
  return { value: 0, unit: 'centuries' };
}
