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
    'Je vous remercie de bien vouloir donner suite à ma demande dans les meilleurs délais. À défaut de réponse satisfaisante, je me réserve la possibilité d\'adresser une réclamation à l\'autorité de protection des données personnelles.',
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
  },
};
