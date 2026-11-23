// Client-side password strength estimator. Nothing typed here ever leaves the
// device (no network, no storage, no analytics payload).
//
// Model: estimate the number of guesses an attacker needs, taking the
// cheapest of several attacks: (a) brute force over the character pool,
// (b) common passwords / word + digits, (c) a word-by-word attack that treats
// each word as ONE symbol from a dictionary (this is how passphrases are
// really attacked: length in letters does not matter, the number of randomly
// chosen words does), plus sequences and repeats.
// Crack time assumes an offline attack at 10 billion guesses per second.
import { PASSPHRASE_SET, PASSPHRASE_WORDS, stripAccents } from './passphrase';

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
  | 'passphrase'
  | 'dictionaryWords'
  | 'fewWords'
  | 'digitsAtEnd'
  | 'personalWords';

export interface PasswordReport {
  guesses: number;
  seconds: number;
  /** log2(guesses): "bits" of real unpredictability. */
  bits: number;
  level: Level;
  findings: FindingKey[];
  /** Words recognised by the word-by-word attack (0 if none). */
  words: number;
}

export const GUESSES_PER_SECOND = 1e10;

/** Words of a passphrase worth recommending (≈ 66 bits with the ASBO list). */
export const RECOMMENDED_WORDS = 6;

// Size of the lists an attacker would use, per kind of word.
const COMMON_LIST_SIZE = 1e3;
/** French/English dictionary + first names: generous for hand-picked words. */
const DICTIONARY_SIZE = 1e5;
const SYMBOLS = 33;
/** Plausible years (1930–2039) instead of 10,000 four-digit numbers. */
const YEAR_CHOICES = 110;

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
  // Elsewhere in Africa, the diaspora and worldwide.
  'abidjan', 'bamako', 'ouaga', 'ouagadougou', 'cotonou', 'lome', 'niamey', 'conakry', 'douala', 'yaounde',
  'lagos', 'abuja', 'accra', 'kumasi', 'nairobi', 'mombasa', 'casablanca', 'rabat', 'paris', 'bruxelles', 'montreal',
  'mtn', 'mpesa', 'momo', 'moov', 'airtel', 'opay', 'jesus', 'jesuschrist', 'blessed', 'godisgood', 'allah',
  'mohamed', 'mohammed', 'ahmed', 'aboubacar', 'adama', 'issa', 'oumar', 'kofi', 'kwame', 'ama', 'chinedu', 'emeka',
  'fatoumata', 'mariam', 'aicha', 'grace', 'blessing', 'precious', 'jean', 'marie', 'pierre', 'sophie', 'nicolas',
  'password1', 'qwerty123', 'azerty123', 'abc123', 'iloveyou1', 'welcome', 'letmein', 'sunshine', 'princess',
  'dragon', 'monkey', 'master', 'loveme', 'chelsea', 'arsenal', 'barcelona', 'realmadrid', 'liverpool',
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
  if (/[^A-Za-z0-9]/.test(pw)) pool += SYMBOLS;
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
  return dictionarySize * Math.pow(10, digits) * Math.pow(SYMBOLS, symbols) * capitalised;
}

/** Looks like a real word: has a vowel, no run of 4+ consonants. */
function isWordLike(word: string): boolean {
  return /^[a-z]{3,14}$/.test(word) && /[aeiouy]/.test(word) && !/[^aeiouy]{4}/.test(word);
}

type WordKind = 'common' | 'list' | 'dictionary';

function wordKind(word: string): WordKind | null {
  if (COMMON.has(word)) return 'common';
  if (PASSPHRASE_SET.has(word)) return 'list';
  if (isWordLike(word)) return 'dictionary';
  return null;
}

const WORD_CHOICES: Record<WordKind, number> = {
  common: COMMON_LIST_SIZE,
  list: PASSPHRASE_WORDS.length,
  dictionary: DICTIONARY_SIZE,
};

/** Capitalisation variants an attacker tries for a word. */
function caseChoices(token: string): number {
  if (token === token.toLowerCase()) return 1;
  const rest = token.slice(1);
  if (rest === rest.toLowerCase() || token === token.toUpperCase()) return 2; // "Word" / "WORD"
  return Math.pow(2, token.length); // random caps: every letter is a choice
}

interface WordAttack {
  guesses: number;
  words: number;
  kinds: WordKind[];
  digitsAtEnd: boolean;
}

/**
 * Word-by-word attack: each recognised word is one pick from a list, each
 * other chunk is brute-forced. Only meaningful when words were recognised.
 */
function wordByWordAttack(pw: string): WordAttack | null {
  const tokens = pw.match(/\p{L}+|\d+|[^\p{L}\d]+/gu) ?? [];
  const kinds: WordKind[] = [];
  const seenSeparators = new Set<string>();
  let guesses = 1;

  for (const token of tokens) {
    if (/^\p{L}+$/u.test(token)) {
      const word = stripAccents(token).toLowerCase();
      const kind = wordKind(word);
      if (kind) {
        kinds.push(kind);
        guesses *= WORD_CHOICES[kind] * caseChoices(token);
      } else {
        guesses *= Math.pow(token === token.toLowerCase() ? 26 : 52, token.length);
      }
    } else if (/^\d+$/.test(token)) {
      guesses *= /^(19[3-9]\d|20[0-3]\d)$/.test(token) ? YEAR_CHOICES : Math.pow(10, token.length);
    } else if (!seenSeparators.has(token)) {
      // Repeating the same separator costs the attacker nothing more.
      seenSeparators.add(token);
      guesses *= Math.pow(SYMBOLS, token.length);
    }
  }

  if (kinds.length === 0) return null;
  const digitsAtEnd = tokens.length >= 2 && /^\d{1,4}$/.test(tokens[tokens.length - 1]) && /\p{L}/u.test(pw);
  return { guesses, words: kinds.length, kinds, digitsAtEnd };
}

export function analyzePassword(pw: string): PasswordReport {
  const findings: FindingKey[] = [];
  const add = (f: FindingKey) => {
    if (!findings.includes(f)) findings.push(f);
  };
  if (!pw) return { guesses: 0, seconds: 0, bits: 0, level: 0, findings, words: 0 };

  const bruteForce = Math.pow(poolSize(pw), pw.length);
  let guesses = bruteForce;

  // Word + optional digits/symbols suffix, e.g. "Senegal2024!", "Awa221", "S3n3gal".
  const wordMatch = /^([a-zA-Z@$013457]+?)(\d{0,6})([^A-Za-z0-9]{0,2})$/.exec(pw);
  const base = wordMatch ? deLeet(wordMatch[1]).replace(/[^a-z]/g, '') : '';

  if (COMMON.has(pw.toLowerCase()) || COMMON.has(deLeet(pw))) {
    add('common');
    guesses = Math.min(guesses, COMMON_LIST_SIZE);
  } else if (wordMatch && COMMON.has(base)) {
    add('common');
    add('wordDigits');
    guesses = Math.min(guesses, wordAttackGuesses(wordMatch, COMMON_LIST_SIZE));
  } else if (wordMatch && /[a-zA-Z]{3}/.test(wordMatch[1]) && wordMatch[2]) {
    // Unknown word + digits: attackers use dictionaries of ~1M words/names.
    add('wordDigits');
    guesses = Math.min(guesses, wordAttackGuesses(wordMatch, 1e6));
  }

  const attack = wordByWordAttack(pw);
  if (attack) guesses = Math.min(guesses, attack.guesses);

  if (/^\d+$/.test(pw)) {
    add('onlyDigits');
    guesses = Math.min(guesses, Math.pow(10, pw.length));
  }
  if (hasSequence(pw)) {
    add('sequence');
    guesses = Math.min(guesses, Math.max(1e4, bruteForce / 1e6));
  }
  if (/(.)\1{2,}/.test(pw)) {
    add('repeat');
    guesses = Math.min(guesses, Math.max(1e4, bruteForce / 1e4));
  }
  if (/(19[3-9]\d|20[0-3]\d)/.test(pw)) add('year');

  const isPassphrase = !!attack && attack.words >= 3 && pw.length >= 16;
  if (isPassphrase) {
    add('passphrase');
    add('dictionaryWords');
    if (attack.words < RECOMMENDED_WORDS) add('fewWords');
    if (attack.kinds.includes('common')) add('personalWords');
  } else if (attack && attack.kinds.includes('common') && attack.words >= 2) {
    add('common');
  }
  if (attack?.digitsAtEnd && (isPassphrase || findings.includes('wordDigits'))) add('digitsAtEnd');

  if (pw.length < 12 && !isPassphrase) add('short');
  if (!isPassphrase) {
    if (!/[A-Z]/.test(pw)) add('noUpper');
    if (!/[0-9]/.test(pw)) add('noDigit');
    if (!/[^A-Za-z0-9]/.test(pw)) add('noSymbol');
  }

  const seconds = guesses / GUESSES_PER_SECOND;
  return {
    guesses,
    seconds,
    bits: Math.log2(Math.max(1, guesses)),
    level: levelFor(seconds),
    findings,
    words: attack?.words ?? 0,
  };
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
