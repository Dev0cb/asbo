// Country profiles. ASBO targets Senegal first: the Senegalese profile cites
// Act No. 2008-12 and the CDP. Everyone else uses the generic "OTHER" profile:
// the tools work the same, with general wording and NO foreign law, authority
// or article named — we only cite what we can verify.
import { createContext, useContext } from 'react';
import type { Lang } from '../i18n';

export type CountryCode = 'SN' | 'OTHER';

export interface Authority {
  name: string;
  /** Full name, as cited in letters. */
  law: string;
  /** Short name, for titles. */
  lawShort: string;
}

/** Article of the law for each right. */
export interface RightsArticles {
  access: string;
  rectification: string;
  erasure: string;
  objection: string;
  marketing: string;
}

export interface CountryProfile {
  code: CountryCode;
  name: Record<Lang, string>;
  /** International dialling code without "+", or null when unknown. */
  dial: string | null;
  /** Main mobile money / payment services, as named in ASBO's guides. */
  money: Record<Lang, string[]>;
  idDoc: Record<Lang, string>;
  /** Language of administrative letters ("ui" = the interface language). */
  letterLang: Lang | 'ui';
  authority?: Authority;
  articles?: RightsArticles;
}

export const COUNTRIES: CountryProfile[] = [
  {
    code: 'SN',
    name: { fr: 'Sénégal', en: 'Senegal' },
    dial: '221',
    money: { fr: ['Wave', 'Orange Money', 'Free Money'], en: ['Wave', 'Orange Money', 'Free Money'] },
    idDoc: { fr: 'CNI', en: 'national ID card' },
    letterLang: 'fr',
    authority: {
      name: 'Commission de Protection des Données Personnelles (CDP)',
      law: 'la loi n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel',
      lawShort: 'Loi n° 2008-12 du 25 janvier 2008',
    },
    articles: { access: 'article 62', rectification: 'article 69', erasure: 'article 69', objection: 'article 68', marketing: 'article 68' },
  },
  {
    code: 'OTHER',
    name: { fr: 'Autre pays', en: 'Other country' },
    dial: null,
    money: { fr: ['mobile money', 'votre banque'], en: ['mobile money', 'your bank'] },
    idDoc: { fr: 'pièce d\'identité', en: 'ID document' },
    letterLang: 'ui',
  },
];

export const DEFAULT_COUNTRY: CountryCode = 'SN';
const STORAGE_KEY = 'asbo-country';

export function countryProfile(code: CountryCode): CountryProfile {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[COUNTRIES.length - 1];
}

const isCountry = (v: string | null): v is CountryCode => !!v && COUNTRIES.some((c) => c.code === v);

/**
 * Saved choice, otherwise Senegal. No guessing from the browser locale: many
 * phones in Senegal are set to "fr-FR", and ASBO targets Senegal first.
 */
export function initialCountry(): CountryCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isCountry(saved)) return saved;
  } catch {
    // Storage blocked (private mode): use the default.
  }
  return DEFAULT_COUNTRY;
}

export function saveCountry(code: CountryCode): void {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Not critical: the choice simply won't be remembered.
  }
}

/** "Wave, Orange Money ou Free Money" */
export function moneyList(p: CountryProfile, lang: Lang): string {
  const items = p.money[lang];
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${lang === 'fr' ? 'ou' : 'or'} ${items[items.length - 1]}`;
}

/** Replaces {money}, {money1}, {id}, {country} and {dial} in a copy string. */
export function fillCountry(text: string, p: CountryProfile, lang: Lang): string {
  return text
    .replace(/\{money\}/g, moneyList(p, lang))
    .replace(/\{money1\}/g, p.money[lang][0])
    .replace(/\{id\}/g, p.idDoc[lang])
    .replace(/\{country\}/g, p.name[lang])
    .replace(/\{dial\}/g, p.dial ? `+${p.dial}` : '+…');
}

export interface CountryContextValue {
  country: CountryProfile;
  setCountry: (code: CountryCode) => void;
}

export const CountryContext = createContext<CountryContextValue>({
  country: countryProfile(DEFAULT_COUNTRY),
  setCountry: () => undefined,
});

export const useCountry = (): CountryContextValue => useContext(CountryContext);
