// Text normaliser for the scam engine: defeats the usual tricks used to
// slip past keyword filters (invisible characters, look-alike letters,
// "O T P" spacing, accents) before any rule runs.

export interface NormalizedText {
  /** NFKC text with invisible characters removed (keeps case, for URLs). */
  clean: string;
  /** Lowercase, accent-free, look-alikes mapped, spaced letters joined. */
  plain: string;
  /** True when the message used invisible or disguised characters. */
  obfuscated: boolean;
}

// Zero-width spaces/joiners, word joiner, BOM, soft hyphen, bidi controls.
const INVISIBLE_RE = /[​-‏⁠-⁤﻿­‪-‮]/g;

// Cyrillic/Greek letters that look like Latin ones ("Wаve" with a Cyrillic а).
const HOMOGLYPHS: Record<string, string> = {
  а: 'a', е: 'e', о: 'o', р: 'p', с: 'c', х: 'x', у: 'y', і: 'i', ј: 'j', ѕ: 's', һ: 'h', к: 'k', м: 'm', т: 't', в: 'b', н: 'h',
  α: 'a', ο: 'o', ρ: 'p', ι: 'i', κ: 'k', ν: 'v', τ: 't', υ: 'u', χ: 'x', ε: 'e',
};
const HOMOGLYPH_RE = new RegExp(`[${Object.keys(HOMOGLYPHS).join('')}]`, 'g');

// Three or more single letters separated by spaces/dots: "o t p", "c.o.d.e".
const SPACED_LETTERS_RE = /\b(?:[a-z][\s.\-_*]){2,}[a-z]\b/g;

const HIDDEN_WORDS = '(otp|pin|code|cvv|wave|orange|compte|password|motdepasse)';
const HIDDEN_WORDS_RE = new RegExp(HIDDEN_WORDS);
const HIDDEN_WORDS_GLOBAL_RE = new RegExp(HIDDEN_WORDS, 'g');

export function normalizeText(raw: string): NormalizedText {
  const nfkc = raw.normalize('NFKC');
  const clean = nfkc.replace(INVISIBLE_RE, '');
  let obfuscated = clean.length !== nfkc.length;

  let plain = clean.toLowerCase();
  if (plain.match(HOMOGLYPH_RE)) obfuscated = true;
  plain = plain.replace(HOMOGLYPH_RE, (c) => HOMOGLYPHS[c] ?? c);
  plain = plain.normalize('NFD').replace(/[̀-ͯ]/g, '');
  // Typographic apostrophes → ASCII so patterns can use a plain "'".
  plain = plain.replace(/[‘’ʼ]/g, "'");

  plain = plain.replace(SPACED_LETTERS_RE, (m) => {
    const joined = m.replace(/[\s.\-_*]/g, '');
    // Only join (and flag) when it spells words scammers hide ("c o d e o t p").
    if (!HIDDEN_WORDS_RE.test(joined)) return m;
    obfuscated = true;
    return joined.replace(HIDDEN_WORDS_GLOBAL_RE, ' $1 ').replace(/\s+/g, ' ').trim();
  });

  return { clean, plain, obfuscated };
}

/**
 * Finds `needle` (taken from `plain`) back in the original text and returns
 * it with its real case and accents, widened to whole words.
 */
export function originalExcerpt(clean: string, needle: string, maxLength = 90): string {
  // Fold char by char, remembering where each folded char came from.
  let folded = '';
  const origin: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    let f = clean[i].toLowerCase();
    f = (HOMOGLYPHS[f] ?? f).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[‘’ʼ]/g, "'");
    for (const ch of f) {
      folded += ch;
      origin.push(i);
    }
  }
  const at = folded.indexOf(needle.trim());
  if (at < 0) return needle.trim().slice(0, maxLength);
  let start = origin[at];
  let end = origin[at + needle.trim().length - 1] + 1;
  while (start > 0 && /\S/.test(clean[start - 1])) start--;
  while (end < clean.length && /\S/.test(clean[end])) end++;
  const text = clean.slice(start, end).replace(/\s+/g, ' ');
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}
