import { describe, expect, it } from 'vitest';
import { accessFromAnswers, buildReport, exposureIndex } from './model';
import { scanText } from './textScan';

describe('exposure model', () => {
  it('is 0 when nothing is exposed', () => {
    expect(exposureIndex({})).toBe(0);
    expect(buildReport({}).level).toBe('low');
  });

  it('is 100 when everything is public', () => {
    const all = accessFromAnswers({
      birthDate: 'high', phone: 'high', address: 'high', idDocument: 'high', family: 'high', children: 'high',
      quizzes: 'high', employer: 'high', email: 'high', secretsPublished: 'high', samePseudo: 'high',
      photoLocation: 'high', travelLive: 'high', routine: 'high', noMfa: 'high', passwordReuse: 'high', realSecretAnswers: 'high',
    });
    expect(buildReport(all).index).toBe(100);
    expect(buildReport(all).level).toBe('critical');
  });

  it('correlates information into scenarios', () => {
    const r = buildReport(accessFromAnswers({ family: 'high', phone: 'high', employer: 'high' }));
    const ids = r.scenarios.map((s) => s.id);
    expect(ids).toContain('fakeRelative');
    expect(ids).toContain('spearPhishing');
    expect(ids).not.toContain('accountTakeover');
  });

  it('does not correlate private ("friends only" counts, "nobody" does not)', () => {
    expect(buildReport(accessFromAnswers({ family: 'mid', phone: 'mid' })).scenarios.map((s) => s.id)).toContain('fakeRelative');
    expect(buildReport(accessFromAnswers({ family: 'none', phone: 'high' })).scenarios).toHaveLength(0);
  });

  it('ranks quick wins by the drop they bring (what-if analysis)', () => {
    const r = buildReport(accessFromAnswers({ passwordReuse: 'high', noMfa: 'high', routine: 'mid' }));
    expect(r.quickWins[0].gain).toBeGreaterThanOrEqual(r.quickWins[r.quickWins.length - 1].gain);
    expect(['passwordReuse', 'noMfa']).toContain(r.quickWins[0].id);
  });
});

describe('text scan', () => {
  it('finds personal information in a bio', () => {
    const r = scanText(
      "Née le 12 mars 1998 🎂 Je travaille chez Sonatel. Maman de 2. Quartier Mermoz. Contact : 77 123 45 67 / awa.diop@example.com. En route pour Paris jusqu'au 20 !",
    );
    const ids = r.findings.map((f) => f.id);
    expect(ids).toEqual(expect.arrayContaining(['birthDate', 'employer', 'place', 'phone', 'email', 'travel']));
    expect(r.access).toMatchObject({ birthDate: 1, employer: 1, phone: 1, email: 1, travelLive: 1, address: 1 });
  });

  it('finds phone numbers from other countries', () => {
    for (const phone of ['+225 07 07 12 34 56', '0803 123 4567', '+254 712 345 678', '06 12 34 56 78']) {
      expect(scanText(`Appelez-moi au ${phone}`).findings.map((f) => f.id)).toContain('phone');
    }
  });

  it('masks secrets and never shows them in full', () => {
    const key = 'ghp_' + 'a'.repeat(36);
    const r = scanText(`token = ${key}`);
    const secret = r.findings.find((f) => f.id === 'secret');
    expect(secret).toBeDefined();
    expect(secret!.examples.join(' ')).not.toContain(key);
  });

  it('only flags card numbers that pass the Luhn check', () => {
    expect(scanText('carte 4539 1488 0343 6467').findings.map((f) => f.id)).toContain('card');
    expect(scanText('commande 1234 5678 9012 3456').findings.map((f) => f.id)).not.toContain('card');
  });

  it('returns nothing for a neutral text', () => {
    expect(scanText('J’aime le thiéboudienne et la lutte.').findings).toHaveLength(0);
  });
});
