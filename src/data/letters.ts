// ASBO letter generator — original letters (written for ASBO, not copied from
// any third party) to exercise data-protection rights. The law, articles,
// authority and letter language come from the selected country profile
// (lib/country.ts); templates live in letterTemplates.ts.
// Personal details stay in component state only.
import type { Lang } from '../i18n';

export type LetterKind = 'acces' | 'rectification' | 'suppression' | 'opposition' | 'prospection';

export interface LetterFields {
  fullName: string;
  address: string;
  contact: string;
  orgName: string;
  orgAddress: string;
  reference: string;
  details: string;
  city: string;
}

export const EMPTY_FIELDS: LetterFields = {
  fullName: '',
  address: '',
  contact: '',
  orgName: '',
  orgAddress: '',
  reference: '',
  details: '',
  city: '',
};

interface KindMeta {
  /** Whether the "details" field is needed for this letter. */
  needsDetails: boolean;
  label: Record<Lang, string>;
  hint: Record<Lang, string>;
  detailsLabel: Record<Lang, string>;
}

export const LETTER_KINDS: Record<LetterKind, KindMeta> = {
  acces: {
    needsDetails: false,
    label: { fr: 'Accès à mes données', en: 'Access my data' },
    hint: { fr: 'Savoir quelles données une organisation détient sur vous et en obtenir une copie.', en: 'Find out what data an organisation holds about you and get a copy.' },
    detailsLabel: { fr: 'Précisions (facultatif)', en: 'Details (optional)' },
  },
  rectification: {
    needsDetails: true,
    label: { fr: 'Corriger mes données', en: 'Correct my data' },
    hint: { fr: 'Faire corriger une information inexacte ou incomplète (nom, adresse, date…).', en: 'Have inaccurate or incomplete information corrected (name, address, date…).' },
    detailsLabel: { fr: 'Données à corriger et valeur exacte', en: 'Data to correct and the correct value' },
  },
  suppression: {
    needsDetails: false,
    label: { fr: 'Supprimer mes données', en: 'Delete my data' },
    hint: { fr: 'Demander l\'effacement de données qui n\'ont pas lieu d\'être conservées.', en: 'Request erasure of data that should not be kept.' },
    detailsLabel: { fr: 'Données concernées (facultatif)', en: 'Data concerned (optional)' },
  },
  opposition: {
    needsDetails: true,
    label: { fr: 'M\'opposer à un usage', en: 'Object to a use' },
    hint: { fr: 'Refuser, pour un motif légitime, qu\'une organisation utilise vos données.', en: 'Refuse, on legitimate grounds, that an organisation uses your data.' },
    detailsLabel: { fr: 'Usage contesté et motif', en: 'Disputed use and reason' },
  },
  prospection: {
    needsDetails: false,
    label: { fr: 'Stopper la publicité', en: 'Stop advertising' },
    hint: { fr: 'Ne plus recevoir de SMS, appels ou e-mails publicitaires.', en: 'Stop receiving advertising SMS, calls or emails.' },
    detailsLabel: { fr: 'Canal concerné (facultatif)', en: 'Channel concerned (optional)' },
  },
};

export { buildLetter, letterLanguage, RIGHT_OF } from './letterTemplates';

export const LETTER_STR = {
  fr: {
    eyebrow: 'Outil · Générateur de lettre',
    title: 'Rédigez votre lettre en une minute',
    intro: 'Choisissez votre demande, complétez les champs : ASBO rédige une lettre conforme à la loi, prête à imprimer ou à envoyer par e-mail. Rien de ce que vous tapez n\'est envoyé ni enregistré.',
    orgCountry: 'Pays de l\'organisation',
    orgCountryHint: 'Au Sénégal, la lettre cite la loi n° 2008-12 et la CDP. Ailleurs, elle utilise une formulation générale.',
    kind: 'Votre demande',
    you: 'Vous',
    org: 'L\'organisation',
    fullName: 'Prénom et nom',
    address: 'Adresse (facultatif)',
    contact: 'Téléphone ou e-mail (facultatif)',
    orgName: 'Nom de l\'organisation',
    orgPlaceholder: 'Ex : opérateur, banque, école, application…',
    orgAddress: 'Adresse de l\'organisation (facultatif)',
    reference: 'Référence client ou numéro concerné (facultatif)',
    city: 'Ville',
    cityPlaceholder: 'Ex : Dakar, Abidjan, Paris…',
    preview: 'Aperçu de votre lettre',
    copy: 'Copier le texte',
    copied: 'Copié',
    print: 'Imprimer / PDF',
    share: 'Partager',
    langNote: (_letterLang: Lang) => '',
    lawNote: (_country: string, law: string | null) =>
      law
        ? `Cette lettre s'appuie sur la loi sénégalaise (${law}) et vise la CDP. Si l'organisation est établie dans un autre pays, choisissez « Autre pays » ci-dessus.`
        : 'Hors du Sénégal, la lettre cite « la législation applicable » et « l\'autorité compétente ». Vérifiez la loi et l\'autorité de votre pays (voir le tableau indicatif « Une autorité par pays ») et précisez-les avant l\'envoi.',
  },
  en: {
    eyebrow: 'Tool · Letter generator',
    title: 'Draft your letter in one minute',
    intro: 'Choose your request and fill in the fields: ASBO drafts a letter that complies with the law, ready to print or email. Nothing you type is sent or saved.',
    orgCountry: 'Country of the organisation',
    orgCountryHint: 'In Senegal, the letter cites Act No. 2008-12 and the CDP. Elsewhere, it uses general wording.',
    kind: 'Your request',
    you: 'You',
    org: 'The organisation',
    fullName: 'First and last name',
    address: 'Address (optional)',
    contact: 'Phone or email (optional)',
    orgName: 'Organisation name',
    orgPlaceholder: 'E.g. operator, bank, school, app…',
    orgAddress: 'Organisation address (optional)',
    reference: 'Customer reference or number concerned (optional)',
    city: 'City',
    cityPlaceholder: 'E.g. Dakar, Lagos, Montreal…',
    preview: 'Your letter',
    copy: 'Copy text',
    copied: 'Copied',
    print: 'Print / PDF',
    share: 'Share',
    langNote: (letterLang: Lang) => (letterLang === 'fr' ? 'Letters for Senegal are written in French, the language of administrative correspondence in Senegal.' : ''),
    lawNote: (_country: string, law: string | null) =>
      law
        ? `This letter relies on Senegalese law (${law}) and refers to the CDP. If the organisation is established in another country, choose "Other country" above.`
        : 'Outside Senegal, the letter cites "the applicable law" and "the competent authority". Check your country\'s law and authority (see the indicative "One authority per country" table) and name them before sending.',
  },
};

/* ===================== Data protection authorities ===================== */
// Indicative list: each country has its own law and supervisory authority.
// Check the texts in force before relying on them for a specific case.

export interface Authority {
  country: Record<Lang, string>;
  authority: string;
  law: string;
}

export const AUTHORITIES: Authority[] = [
  { country: { fr: 'Sénégal', en: 'Senegal' }, authority: 'CDP — Commission de Protection des Données Personnelles', law: 'Loi n° 2008-12 du 25 janvier 2008' },
  { country: { fr: 'Côte d\'Ivoire', en: 'Côte d\'Ivoire' }, authority: 'ARTCI', law: 'Loi n° 2013-450 du 19 juin 2013' },
  { country: { fr: 'Mali', en: 'Mali' }, authority: 'APDP', law: 'Loi n° 2013-015 du 21 mai 2013' },
  { country: { fr: 'Burkina Faso', en: 'Burkina Faso' }, authority: 'CIL — Commission de l\'Informatique et des Libertés', law: 'Loi n° 001-2021/AN du 30 mars 2021' },
  { country: { fr: 'Bénin', en: 'Benin' }, authority: 'APDP', law: 'Loi n° 2017-20 portant Code du numérique' },
  { country: { fr: 'Togo', en: 'Togo' }, authority: 'IPDCP', law: 'Loi n° 2019-014 du 29 octobre 2019' },
  { country: { fr: 'Maroc', en: 'Morocco' }, authority: 'CNDP', law: 'Loi n° 09-08 du 18 février 2009' },
  { country: { fr: 'Ghana', en: 'Ghana' }, authority: 'Data Protection Commission', law: 'Data Protection Act, 2012 (Act 843)' },
  { country: { fr: 'Nigeria', en: 'Nigeria' }, authority: 'NDPC — Nigeria Data Protection Commission', law: 'Nigeria Data Protection Act 2023' },
  { country: { fr: 'Kenya', en: 'Kenya' }, authority: 'ODPC — Office of the Data Protection Commissioner', law: 'Data Protection Act 2019' },
];

export const AUTHORITY_STR = {
  fr: {
    eyebrow: 'À savoir',
    title: 'Une autorité par pays',
    p1: 'Une « autorité de protection des données » est l\'organisme public indépendant chargé, dans un pays donné, de faire respecter la loi sur les données personnelles : elle informe, contrôle les organisations, reçoit les réclamations et peut prononcer des sanctions.',
    p2: 'Il n\'en existe pas une seule pour toute l\'Afrique : chaque pays a sa propre loi, avec ses propres articles, et sa propre autorité. Le texte applicable dépend en général du pays où l\'organisation est établie et de celui où vous résidez.',
    p3: 'Au niveau régional, l\'Acte additionnel de la CEDEAO (2010) et la Convention de l\'Union africaine dite de Malabo (2014) fixent des principes communs, que chaque pays applique à travers sa loi nationale.',
    colCountry: 'Pays',
    colAuthority: 'Autorité',
    colLaw: 'Loi principale',
    disclaimer: 'Liste indicative et non exhaustive. Les textes évoluent : vérifiez la loi en vigueur avant toute démarche.',
  },
  en: {
    eyebrow: 'Good to know',
    title: 'One authority per country',
    p1: 'A "data protection authority" is the independent public body that enforces personal data law in a given country: it informs, audits organisations, handles complaints and can impose sanctions.',
    p2: 'There is no single one for all of Africa: each country has its own law, with its own articles, and its own authority. The applicable law generally depends on the country where the organisation is established and the one where you live.',
    p3: 'At regional level, the ECOWAS Supplementary Act (2010) and the African Union Malabo Convention (2014) set common principles, which each country applies through its national law.',
    colCountry: 'Country',
    colAuthority: 'Authority',
    colLaw: 'Main law',
    disclaimer: 'Indicative, non-exhaustive list. Laws change: check the law in force before taking action.',
  },
};
