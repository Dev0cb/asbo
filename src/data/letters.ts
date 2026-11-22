// ASBO letter generator — original letters (written for ASBO, not copied from
// any third party) to exercise data-protection rights under Senegal's
// Act No. 2008-12 of 25 January 2008:
//   art. 62 = right of access · art. 68 = right to object
//   art. 69 = right to rectification and deletion
// Letters are generated in French: it is the language of administrative
// correspondence in Senegal. Personal details stay in component state only.
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
  article: string;
  /** Whether the "details" field is needed for this letter. */
  needsDetails: boolean;
  label: Record<Lang, string>;
  hint: Record<Lang, string>;
  detailsLabel: Record<Lang, string>;
}

export const LETTER_KINDS: Record<LetterKind, KindMeta> = {
  acces: {
    article: 'article 62',
    needsDetails: false,
    label: { fr: 'Accès à mes données', en: 'Access my data' },
    hint: { fr: 'Savoir quelles données une organisation détient sur vous et en obtenir une copie.', en: 'Find out what data an organisation holds about you and get a copy.' },
    detailsLabel: { fr: 'Précisions (facultatif)', en: 'Details (optional)' },
  },
  rectification: {
    article: 'article 69',
    needsDetails: true,
    label: { fr: 'Corriger mes données', en: 'Correct my data' },
    hint: { fr: 'Faire corriger une information inexacte ou incomplète (nom, adresse, date…).', en: 'Have inaccurate or incomplete information corrected (name, address, date…).' },
    detailsLabel: { fr: 'Données à corriger et valeur exacte', en: 'Data to correct and the correct value' },
  },
  suppression: {
    article: 'article 69',
    needsDetails: false,
    label: { fr: 'Supprimer mes données', en: 'Delete my data' },
    hint: { fr: 'Demander l\'effacement de données qui n\'ont pas lieu d\'être conservées.', en: 'Request erasure of data that should not be kept.' },
    detailsLabel: { fr: 'Données concernées (facultatif)', en: 'Data concerned (optional)' },
  },
  opposition: {
    article: 'article 68',
    needsDetails: true,
    label: { fr: 'M\'opposer à un usage', en: 'Object to a use' },
    hint: { fr: 'Refuser, pour un motif légitime, qu\'une organisation utilise vos données.', en: 'Refuse, on legitimate grounds, that an organisation uses your data.' },
    detailsLabel: { fr: 'Usage contesté et motif', en: 'Disputed use and reason' },
  },
  prospection: {
    article: 'article 68',
    needsDetails: false,
    label: { fr: 'Stopper la publicité', en: 'Stop advertising' },
    hint: { fr: 'Ne plus recevoir de SMS, appels ou e-mails publicitaires.', en: 'Stop receiving advertising SMS, calls or emails.' },
    detailsLabel: { fr: 'Canal concerné (facultatif)', en: 'Channel concerned (optional)' },
  },
};

const LAW = 'la loi n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel';

const SUBJECTS: Record<LetterKind, string> = {
  acces: 'Demande d\'accès à mes données personnelles',
  rectification: 'Demande de rectification de mes données personnelles',
  suppression: 'Demande de suppression de mes données personnelles',
  opposition: 'Opposition au traitement de mes données personnelles',
  prospection: 'Opposition à la prospection commerciale',
};

function body(kind: LetterKind, f: LetterFields): string[] {
  const ref = f.reference.trim() ? ` (référence client ou numéro concerné : ${f.reference.trim()})` : '';
  const details = f.details.trim();
  const article = LETTER_KINDS[kind].article;
  switch (kind) {
    case 'acces':
      return [
        `Conformément à l'${article} de ${LAW}, je vous demande de m'indiquer si des données à caractère personnel me concernant font l'objet d'un traitement de votre part${ref}.`,
        'Le cas échéant, je vous prie de me communiquer, sous une forme accessible, une copie de l\'ensemble de ces données, ainsi que les informations relatives aux finalités du traitement, aux catégories de données traitées, à leur origine et aux destinataires auxquels elles ont été communiquées.',
        ...(details ? [`Précisions : ${details}`] : []),
      ];
    case 'rectification':
      return [
        `Conformément à l'${article} de ${LAW}, je vous demande de rectifier les données personnelles me concernant que vous détenez${ref}, celles-ci étant inexactes ou incomplètes.`,
        `Données à corriger : ${details || '[précisez les données et leur valeur exacte]'}.`,
        'Je vous remercie de me confirmer par écrit que cette rectification a été effectuée.',
      ];
    case 'suppression':
      return [
        `Conformément à l'${article} de ${LAW}, je vous demande de supprimer l'ensemble des données personnelles me concernant que vous détenez${ref}.`,
        ...(details ? [`Données concernées : ${details}.`] : []),
        'Je vous remercie de me confirmer par écrit que cette suppression a été effectuée, y compris auprès des tiers à qui ces données auraient été communiquées.',
      ];
    case 'opposition':
      return [
        `Conformément à l'${article} de ${LAW}, je m'oppose, pour des motifs légitimes, au traitement de mes données personnelles${ref}.`,
        `Usage contesté et motif : ${details || '[précisez l\'usage contesté et votre motif]'}.`,
        'Je vous demande en conséquence de cesser ce traitement et de me confirmer par écrit la suite donnée à ma demande.',
      ];
    case 'prospection':
      return [
        `Conformément à l'${article} de ${LAW}, je m'oppose à l'utilisation de mes données personnelles à des fins de prospection commerciale${ref}.`,
        `Je vous demande de cesser immédiatement de m'adresser des messages publicitaires${details ? ` (${details})` : ' par SMS, appel téléphonique ou courrier électronique'} et de retirer mes coordonnées de vos fichiers de prospection.`,
        'Je vous remercie de me confirmer par écrit la prise en compte de ma demande.',
      ];
  }
}

function today(): string {
  return new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Builds the full letter as plain text, with placeholders for empty fields. */
export function buildLetter(kind: LetterKind, f: LetterFields): string {
  const name = f.fullName.trim() || '[Prénom et nom]';
  const sender = [name, f.address.trim(), f.contact.trim()].filter(Boolean);
  const recipient = [f.orgName.trim() || '[Nom de l\'organisation]', f.orgAddress.trim()].filter(Boolean);
  const city = f.city.trim() || '[Ville]';

  return [
    ...sender,
    '',
    ...recipient,
    'À l\'attention du responsable du traitement des données personnelles',
    '',
    `${city}, le ${today()}`,
    '',
    `Objet : ${SUBJECTS[kind]}`,
    '',
    'Madame, Monsieur,',
    '',
    ...body(kind, f).flatMap((p) => [p, '']),
    'Je vous remercie de bien vouloir donner suite à ma demande dans les meilleurs délais. À défaut de réponse satisfaisante, je me réserve la possibilité de saisir la Commission de Protection des Données Personnelles (CDP).',
    '',
    'Je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.',
    '',
    name,
    '',
    'Pièce jointe : copie d\'une pièce d\'identité',
  ].join('\n');
}

export const LETTER_STR = {
  fr: {
    eyebrow: 'Outil · Générateur de lettre',
    title: 'Rédigez votre lettre en une minute',
    intro: 'Choisissez votre demande, complétez les champs : ASBO rédige une lettre conforme à la loi, prête à imprimer ou à envoyer par e-mail. Rien de ce que vous tapez n\'est envoyé ni enregistré.',
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
    preview: 'Aperçu de votre lettre',
    copy: 'Copier le texte',
    copied: 'Copié',
    print: 'Imprimer / PDF',
    share: 'Partager',
    langNote: '',
    lawNote: 'Cette lettre s\'appuie sur la loi sénégalaise et vise la CDP. Si l\'organisation est établie dans un autre pays, citez la loi et l\'autorité de ce pays (voir « Une autorité par pays » ci-dessus).',
  },
  en: {
    eyebrow: 'Tool · Letter generator',
    title: 'Draft your letter in one minute',
    intro: 'Choose your request and fill in the fields: ASBO drafts a letter that complies with the law, ready to print or email. Nothing you type is sent or saved.',
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
    preview: 'Your letter',
    copy: 'Copy text',
    copied: 'Copied',
    print: 'Print / PDF',
    share: 'Share',
    langNote: 'Letters are written in French, the language of administrative correspondence in Senegal.',
    lawNote: 'This letter relies on Senegalese law and refers to the CDP. If the organisation is established in another country, cite that country\'s law and authority (see "One authority per country" above).',
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
