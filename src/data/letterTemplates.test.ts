import { describe, expect, it } from 'vitest';
import { buildLetter, letterLanguage } from './letterTemplates';
import { EMPTY_FIELDS } from './letters';
import { countryProfile, initialCountry } from '../lib/country';

const DATE = new Date(2026, 10, 23);

describe('letters', () => {
  it('Senegal: French letter citing Act 2008-12 article 62 and the CDP', () => {
    const l = buildLetter('acces', EMPTY_FIELDS, countryProfile('SN'), 'en', DATE);
    expect(letterLanguage(countryProfile('SN'), 'en')).toBe('fr');
    expect(l).toContain("Conformément à l'article 62 de la loi n° 2008-12");
    expect(l).toContain('(Commission de Protection des Données Personnelles (CDP))');
    expect(l).toContain('le 23 novembre 2026');
  });

  it('Senegal: right-to-object letters cite article 68', () => {
    expect(buildLetter('prospection', EMPTY_FIELDS, countryProfile('SN'), 'fr', DATE)).toContain("l'article 68 de la loi n° 2008-12");
  });

  it('other countries: generic letter, no foreign law, authority or article named', () => {
    const fr = buildLetter('acces', EMPTY_FIELDS, countryProfile('OTHER'), 'fr', DATE);
    expect(fr).toContain('Conformément à la législation applicable');
    expect(fr).toContain("l'autorité de protection des données compétente");
    expect(fr).not.toMatch(/article \d|2008-12|CDP/);
    const en = buildLetter('acces', EMPTY_FIELDS, countryProfile('OTHER'), 'en', DATE);
    expect(en).toContain('Under the applicable personal data protection law');
    expect(en).not.toMatch(/Article \d|2008-12|CDP/);
  });
});

describe('default country', () => {
  it('is Senegal when nothing was chosen', () => {
    expect(initialCountry()).toBe('SN');
  });
});
