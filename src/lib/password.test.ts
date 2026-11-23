import { describe, expect, it } from 'vitest';
import { analyzePassword } from './password';
import { generatePassphrase, PASSPHRASE_SET, PASSPHRASE_WORDS, secureRandomInt } from './passphrase';

describe('analyzePassword', () => {
  it('rates a 5-word passphrase by its words, not its 44 letters', () => {
    const r = analyzePassword('girafe-quartier-tableau-aubergine-igname-62');
    // 5 words from a public ~2,200-word list + one separator + 2 digits ≈ 68 bits,
    // far below the ~270 bits a character brute force would suggest.
    expect(r.words).toBe(5);
    expect(r.bits).toBeGreaterThan(60);
    expect(r.bits).toBeLessThan(75);
    expect(r.level).toBe(3);
    expect(r.findings).toEqual(expect.arrayContaining(['passphrase', 'dictionaryWords', 'fewWords', 'digitsAtEnd']));
  });

  it('gives the top level to a 6-word generated passphrase', () => {
    const r = analyzePassword(generatePassphrase());
    expect(r.words).toBe(6);
    expect(r.level).toBe(4);
    expect(r.findings).not.toContain('fewWords');
  });

  it('flags passphrases built from very common words', () => {
    const r = analyzePassword('dakar-touba-senegal-teranga');
    expect(r.findings).toContain('personalWords');
    expect(r.level).toBeLessThanOrEqual(1);
  });

  it('does not reward random capitals over more words', () => {
    const lower = analyzePassword('girafe-quartier-tableau-aubergine-igname-62');
    const caps = analyzePassword('Girafe-quartier-tableau-aubergine-igname-62');
    // Capitalising the first letter only doubles the work.
    expect(caps.bits - lower.bits).toBeCloseTo(1, 5);
  });

  it('keeps classic weak passwords weak', () => {
    expect(analyzePassword('Senegal2024!').level).toBe(0);
    expect(analyzePassword('azerty').findings).toContain('common');
    expect(analyzePassword('12345678').level).toBe(0);
    expect(analyzePassword('S3n3gal').findings).toContain('common');
  });

  it('keeps a long random password strong', () => {
    expect(analyzePassword('xK9#mQ2$vL7!pZ4&').level).toBe(4);
  });
});

describe('generatePassphrase', () => {
  it('uses only list words plus one 2-digit number', () => {
    const parts = generatePassphrase().split('-');
    expect(parts).toHaveLength(7);
    expect(parts.filter((p) => /^\d{2}$/.test(p))).toHaveLength(1);
    expect(parts.filter((p) => PASSPHRASE_SET.has(p))).toHaveLength(6);
  });

  it('has a large, accent-free, dash-free word list', () => {
    expect(PASSPHRASE_WORDS.length).toBeGreaterThan(2000);
    expect(PASSPHRASE_WORDS.every((w) => /^[a-z]+$/.test(w))).toBe(true);
  });

  it('draws integers uniformly in range', () => {
    for (let i = 0; i < 1000; i++) {
      const n = secureRandomInt(7);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(7);
    }
    expect(() => secureRandomInt(0)).toThrow(RangeError);
  });
});
