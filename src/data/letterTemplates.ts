// Letter templates for data-protection requests. Senegal: French letter
// citing the exact article of Act No. 2008-12 and the CDP. Other countries:
// a generic letter ("the applicable law"), in the interface language — no
// foreign law or authority is named, since we cannot verify them all.
import type { Lang } from '../i18n';
import type { CountryProfile, RightsArticles } from '../lib/country';
import type { LetterFields, LetterKind } from './letters';

/** Which right each letter exercises (to look up the article). */
export const RIGHT_OF: Record<LetterKind, keyof RightsArticles> = {
  acces: 'access',
  rectification: 'rectification',
  suppression: 'erasure',
  opposition: 'objection',
  prospection: 'marketing',
};

/** Letters follow the country's administrative language, or the UI language. */
export function letterLanguage(country: CountryProfile, uiLang: Lang): Lang {
  return country.letterLang === 'ui' ? uiLang : country.letterLang;
}

/* ------------------------------ French ------------------------------ */

const GENERIC_LAW_FR = 'la législation applicable en matière de protection des données à caractère personnel';

/** French contractions: "de le" → "du", "à le" → "au". */
const deLaw = (law: string) => (law.startsWith('le ') ? `du ${law.slice(3)}` : `de ${law}`);
const aLaw = (law: string) => (law.startsWith('le ') ? `au ${law.slice(3)}` : `à ${law}`);

function basisFr(kind: LetterKind, c: CountryProfile): string {
  const law = c.authority?.law ?? GENERIC_LAW_FR;
  const article = c.articles?.[RIGHT_OF[kind]];
  return article ? `Conformément à l'${article} ${deLaw(law)}` : `Conformément ${aLaw(law)}`;
}

const SUBJECTS_FR: Record<LetterKind, string> = {
  acces: 'Demande d\'accès à mes données personnelles',
  rectification: 'Demande de rectification de mes données personnelles',
  suppression: 'Demande de suppression de mes données personnelles',
  opposition: 'Opposition au traitement de mes données personnelles',
  prospection: 'Opposition à la prospection commerciale',
};

function bodyFr(kind: LetterKind, f: LetterFields, c: CountryProfile): string[] {
  const ref = f.reference.trim() ? ` (référence client ou numéro concerné : ${f.reference.trim()})` : '';
  const details = f.details.trim();
  const basis = basisFr(kind, c);
  switch (kind) {
    case 'acces':
      return [
        `${basis}, je vous demande de m'indiquer si des données à caractère personnel me concernant font l'objet d'un traitement de votre part${ref}.`,
        'Le cas échéant, je vous prie de me communiquer, sous une forme accessible, une copie de l\'ensemble de ces données, ainsi que les informations relatives aux finalités du traitement, aux catégories de données traitées, à leur origine et aux destinataires auxquels elles ont été communiquées.',
        ...(details ? [`Précisions : ${details}`] : []),
      ];
    case 'rectification':
      return [
        `${basis}, je vous demande de rectifier les données personnelles me concernant que vous détenez${ref}, celles-ci étant inexactes ou incomplètes.`,
        `Données à corriger : ${details || '[précisez les données et leur valeur exacte]'}.`,
        'Je vous remercie de me confirmer par écrit que cette rectification a été effectuée.',
      ];
    case 'suppression':
      return [
        `${basis}, je vous demande de supprimer l'ensemble des données personnelles me concernant que vous détenez${ref}.`,
        ...(details ? [`Données concernées : ${details}.`] : []),
        'Je vous remercie de me confirmer par écrit que cette suppression a été effectuée, y compris auprès des tiers à qui ces données auraient été communiquées.',
      ];
    case 'opposition':
      return [
        `${basis}, je m'oppose, pour des motifs légitimes, au traitement de mes données personnelles${ref}.`,
        `Usage contesté et motif : ${details || '[précisez l\'usage contesté et votre motif]'}.`,
        'Je vous demande en conséquence de cesser ce traitement et de me confirmer par écrit la suite donnée à ma demande.',
      ];
    case 'prospection':
      return [
        `${basis}, je m'oppose à l'utilisation de mes données personnelles à des fins de prospection commerciale${ref}.`,
        `Je vous demande de cesser immédiatement de m'adresser des messages publicitaires${details ? ` (${details})` : ' par SMS, appel téléphonique ou courrier électronique'} et de retirer mes coordonnées de vos fichiers de prospection.`,
        'Je vous remercie de me confirmer par écrit la prise en compte de ma demande.',
      ];
  }
}

function letterFr(kind: LetterKind, f: LetterFields, c: CountryProfile, date: Date): string {
  const name = f.fullName.trim() || '[Prénom et nom]';
  const sender = [name, f.address.trim(), f.contact.trim()].filter(Boolean);
  const recipient = [f.orgName.trim() || '[Nom de l\'organisation]', f.orgAddress.trim()].filter(Boolean);
  const city = f.city.trim() || '[Ville]';
  const authority = c.authority
    ? `l'autorité de protection des données (${c.authority.name})`
    : 'l\'autorité de protection des données compétente';
  const day = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return [
    ...sender,
    '',
    ...recipient,
    'À l\'attention du responsable du traitement des données personnelles',
    '',
    `${city}, le ${day}`,
    '',
    `Objet : ${SUBJECTS_FR[kind]}`,
    '',
    'Madame, Monsieur,',
    '',
    ...bodyFr(kind, f, c).flatMap((p) => [p, '']),
    `Je vous remercie de bien vouloir donner suite à ma demande dans les meilleurs délais. À défaut de réponse satisfaisante, je me réserve la possibilité de saisir ${authority}.`,
    '',
    'Je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.',
    '',
    name,
    '',
    'Pièce jointe : copie d\'une pièce d\'identité',
  ].join('\n');
}

/* ------------------------------ English ------------------------------ */

const GENERIC_LAW_EN = 'the applicable personal data protection law';

/** English letters are only produced for the generic profile. */
function basisEn(): string {
  return `Under ${GENERIC_LAW_EN}`;
}

const SUBJECTS_EN: Record<LetterKind, string> = {
  acces: 'Request for access to my personal data',
  rectification: 'Request for rectification of my personal data',
  suppression: 'Request for erasure of my personal data',
  opposition: 'Objection to the processing of my personal data',
  prospection: 'Objection to direct marketing',
};

function bodyEn(kind: LetterKind, f: LetterFields): string[] {
  const ref = f.reference.trim() ? ` (customer reference or number concerned: ${f.reference.trim()})` : '';
  const details = f.details.trim();
  const basis = basisEn();
  switch (kind) {
    case 'acces':
      return [
        `${basis}, I ask you to confirm whether you process any personal data concerning me${ref}.`,
        'If so, please send me, in an accessible form, a copy of all such data, together with information on the purposes of the processing, the categories of data concerned, their source and the recipients to whom they have been disclosed.',
        ...(details ? [`Details: ${details}`] : []),
      ];
    case 'rectification':
      return [
        `${basis}, I ask you to correct the personal data you hold about me${ref}, as it is inaccurate or incomplete.`,
        `Data to correct: ${details || '[specify the data and its correct value]'}.`,
        'Please confirm in writing once this correction has been made.',
      ];
    case 'suppression':
      return [
        `${basis}, I ask you to erase all personal data you hold about me${ref}.`,
        ...(details ? [`Data concerned: ${details}.`] : []),
        'Please confirm in writing once this erasure has been carried out, including with any third parties to whom the data was disclosed.',
      ];
    case 'opposition':
      return [
        `${basis}, I object, on legitimate grounds, to the processing of my personal data${ref}.`,
        `Disputed use and reason: ${details || '[specify the disputed use and your reason]'}.`,
        'I therefore ask you to stop this processing and to confirm in writing how you have acted on my request.',
      ];
    case 'prospection':
      return [
        `${basis}, I object to the use of my personal data for direct marketing purposes${ref}.`,
        `Please stop sending me advertising messages immediately${details ? ` (${details})` : ' by SMS, phone call or email'} and remove my contact details from your marketing lists.`,
        'Please confirm in writing that my request has been taken into account.',
      ];
  }
}

function letterEn(kind: LetterKind, f: LetterFields, date: Date): string {
  const name = f.fullName.trim() || '[First and last name]';
  const sender = [name, f.address.trim(), f.contact.trim()].filter(Boolean);
  const recipient = [f.orgName.trim() || '[Organisation name]', f.orgAddress.trim()].filter(Boolean);
  const city = f.city.trim() || '[City]';
  const authority = 'the competent data protection authority';
  const day = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return [
    ...sender,
    '',
    ...recipient,
    'For the attention of the Data Protection Officer',
    '',
    `${city}, ${day}`,
    '',
    `Subject: ${SUBJECTS_EN[kind]}`,
    '',
    'Dear Sir or Madam,',
    '',
    ...bodyEn(kind, f).flatMap((p) => [p, '']),
    `I would be grateful if you could respond to my request as soon as possible. If I do not receive a satisfactory answer, I reserve the right to refer the matter to ${authority}.`,
    '',
    'Yours faithfully,',
    '',
    name,
    '',
    'Enclosure: copy of an identity document',
  ].join('\n');
}

/** Builds the full letter as plain text, with placeholders for empty fields. */
export function buildLetter(kind: LetterKind, f: LetterFields, country: CountryProfile, uiLang: Lang, date = new Date()): string {
  return letterLanguage(country, uiLang) === 'en' ? letterEn(kind, f, date) : letterFr(kind, f, country, date);
}
