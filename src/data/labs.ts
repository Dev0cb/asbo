// Content for the interactive labs on the Tools page (#/outils/...).
// Adapted from the "Cyber-Enquêteur Academy" modules (phishing detector,
// password cracking, "vos données parlent", account security) and rewritten
// for everyday Senegalese life: Wave, Orange Money, WhatsApp, SENELEC…
import type { Lang } from '../i18n';
import type { FindingKey, TimeUnit } from '../lib/password';
import { SCENARIO_COUNT, type Channel } from './phishing';

/* ============================ Footprint ("Vos données parlent") ============================ */

export type FootprintFieldId = 'city' | 'year' | 'name' | 'passion';

export interface FootprintField {
  id: FootprintFieldId;
  label: string;
  hint: string;
  placeholder: string;
  /** Numeric year field, validated between MIN_YEAR and the current year. */
  isYear?: boolean;
}

export const FOOTPRINT_MIN_YEAR = 1930;
export const FOOTPRINT_MAX_LENGTH = 40;

/** Free-text fields: anyone, from any country, types their own answers. */
export const FOOTPRINT_FIELDS: Record<Lang, FootprintField[]> = {
  fr: [
    { id: 'city', label: 'La ville où vous avez grandi', hint: 'Souvent visible dans la section « À propos » de Facebook ou sur LinkedIn.', placeholder: 'Ex : Dakar, Abidjan, Lyon…' },
    { id: 'year', label: 'Une année importante pour vous (naissance, bac, mariage)', hint: 'Les messages « joyeux anniversaire » la révèlent chaque année.', placeholder: 'Ex : 1998', isYear: true },
    { id: 'name', label: 'Le prénom d\'un proche très cher (enfant, parent, conjoint)', hint: 'Photos de famille, identifications, commentaires…', placeholder: 'Ex : Awa, Kofi, Marie…' },
    { id: 'passion', label: 'Votre passion ou votre équipe favorite', hint: 'Photo de profil, groupes, pages suivies.', placeholder: 'Ex : football, musique, cuisine…' },
  ],
  en: [
    { id: 'city', label: 'The city where you grew up', hint: 'Often visible in the Facebook "About" section or on LinkedIn.', placeholder: 'E.g. Dakar, Accra, London…' },
    { id: 'year', label: 'A year that matters to you (birth, graduation, wedding)', hint: '"Happy birthday" posts reveal it every year.', placeholder: 'E.g. 1998', isYear: true },
    { id: 'name', label: 'The first name of someone very dear (child, parent, partner)', hint: 'Family photos, tags, comments…', placeholder: 'E.g. Awa, Kofi, Mary…' },
    { id: 'passion', label: 'Your passion or favourite team', hint: 'Profile picture, groups, pages you follow.', placeholder: 'E.g. football, music, cooking…' },
  ],
};

export type FootprintAnswers = Record<FootprintFieldId, string>;
export type FootprintErrors = Partial<Record<FootprintFieldId, 'required' | 'year' | 'tooLong'>>;

/** Checks the form; returns an empty object when everything is valid. */
export function validateFootprint(a: Partial<FootprintAnswers>, now = new Date()): FootprintErrors {
  const errors: FootprintErrors = {};
  for (const id of ['city', 'year', 'name', 'passion'] as FootprintFieldId[]) {
    const v = (a[id] ?? '').trim();
    if (!v) errors[id] = 'required';
    else if (v.length > FOOTPRINT_MAX_LENGTH) errors[id] = 'tooLong';
  }
  const year = (a.year ?? '').trim();
  if (year && !errors.year) {
    const n = Number(year);
    if (!/^\d{4}$/.test(year) || n < FOOTPRINT_MIN_YEAR || n > now.getFullYear()) errors.year = 'year';
  }
  return errors;
}

/** Latin letters/digits only ("Thiès" → "Thies"); keeps the raw word for other scripts. */
const ascii = (s: string) => {
  const latin = s.trim().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]/g, '');
  return latin || s.trim().replace(/\s+/g, '');
};
const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Passwords an attacker would try first, built only from the answers. */
export function guessablePasswords(a: FootprintAnswers): string[] {
  const city = capitalise(ascii(a.city));
  const name = capitalise(ascii(a.name));
  const passion = capitalise(ascii(a.passion));
  const year = a.year.trim();
  return Array.from(
    new Set([
      `${name}${year}`,
      `${city}${year}!`,
      `${passion}${year.slice(2)}`,
      `${name}_${city}`,
      `${passion}123`,
      `${name.toLowerCase()}${year}@`,
    ]),
  );
}

/** A tailor-made trap message built from the answers and the user's country. */
export function footprintScam(a: FootprintAnswers, lang: Lang, money: string): string {
  const slug = ascii(a.city).toLowerCase().slice(0, 12) || 'promo';
  const city = a.city.trim();
  const name = a.name.trim();
  const passion = a.passion.trim();
  const year = a.year.trim();
  return lang === 'fr'
    ? `Salut ! Les fans de « ${passion} » de ${city} organisent un grand tirage pour les membres nés en ${year}. ${name} t'a inscrit(e) ! Pour recevoir ton gain par ${money}, confirme ta place ici : bit.ly/tirage-${slug}`
    : `Hi! The "${passion}" fans of ${city} are holding a big draw for members born in ${year}. ${name} signed you up! To receive your prize by ${money}, confirm your spot here: bit.ly/draw-${slug}`;
}

/* ================================ UI strings ================================ */

const PW_FINDINGS: Record<Lang, Record<FindingKey, string>> = {
  fr: {
    common: 'Mot de passe (ou mot) parmi les plus utilisés : testé en premier par les pirates.',
    wordDigits: 'Un mot suivi de chiffres (« Prenom2024 ») : c\'est le schéma que les pirates testent juste après.',
    onlyDigits: 'Uniquement des chiffres : très rapide à deviner.',
    sequence: 'Contient une suite évidente (1234, abcd, azerty…).',
    repeat: 'Contient des caractères répétés (aaa, 111…).',
    year: 'Contient une année : souvent une date de naissance, facile à trouver en ligne.',
    short: 'Moins de 12 caractères : la longueur est le facteur n°1.',
    noUpper: 'Aucune majuscule.',
    noDigit: 'Aucun chiffre.',
    noSymbol: 'Aucun symbole (! ? # @ …).',
    passphrase: 'Phrase de passe : facile à retenir. Sa force vient du nombre de mots tirés au hasard, pas du nombre de lettres.',
    dictionaryWords: 'Un pirate attaque une phrase de passe mot par mot, avec des dictionnaires (y compris la liste publique d\'ASBO). Le calcul ci-dessus en tient compte.',
    fewWords: 'Moins de 6 mots : ajoutez-en un ou deux, tirés au hasard. Avec la liste d\'ASBO, chaque mot de plus multiplie le travail du pirate par environ 2 000.',
    digitsAtEnd: 'Chiffres collés à la fin : c\'est le premier endroit où les pirates en ajoutent. Placez-les entre deux mots.',
    personalWords: 'Contient des mots très courants (villes, prénoms, Wave…) : ce sont les premiers testés.',
  },
  en: {
    common: 'One of the most used passwords (or words): attackers try it first.',
    wordDigits: 'A word followed by digits ("Name2024"): the very next pattern attackers try.',
    onlyDigits: 'Digits only: very quick to guess.',
    sequence: 'Contains an obvious sequence (1234, abcd, qwerty…).',
    repeat: 'Contains repeated characters (aaa, 111…).',
    year: 'Contains a year: often a birth date, easy to find online.',
    short: 'Under 12 characters: length is the #1 factor.',
    noUpper: 'No uppercase letter.',
    noDigit: 'No digit.',
    noSymbol: 'No symbol (! ? # @ …).',
    passphrase: 'Passphrase: easy to remember. Its strength comes from how many words were drawn at random, not from the number of letters.',
    dictionaryWords: 'Attackers crack passphrases word by word, with dictionaries (including ASBO\'s public list). The estimate above accounts for this.',
    fewWords: 'Fewer than 6 words: add one or two, picked at random. With ASBO\'s list, each extra word multiplies the attacker\'s work by about 2,000.',
    digitsAtEnd: 'Digits stuck at the end: the first place attackers add them. Put them between two words.',
    personalWords: 'Contains very common words (cities, first names, Wave…): attackers try these first.',
  },
};

const TIME_UNITS: Record<Lang, Record<TimeUnit, string>> = {
  fr: { instant: 'Instantané', seconds: 'secondes', minutes: 'minutes', hours: 'heures', days: 'jours', months: 'mois', years: 'ans', centuries: 'Des siècles' },
  en: { instant: 'Instant', seconds: 'seconds', minutes: 'minutes', hours: 'hours', days: 'days', months: 'months', years: 'years', centuries: 'Centuries' },
};

export const LAB_STR = {
  fr: {
    channel: { sms: 'SMS', whatsapp: 'WhatsApp', email: 'E-mail', messenger: 'Messenger', facebook: 'Facebook' } as Record<Channel, string>,
    phish: {
      intro: `${SCENARIO_COUNT} messages reçus sur un vrai téléphone : SMS, WhatsApp, e-mails, Facebook et Messenger. Ils reprennent les situations les plus fréquentes au Sénégal. Arnaque ou message légitime ? Observez bien l'expéditeur, les liens et les pièces jointes.`,
      progress: 'Message',
      of: 'sur',
      from: 'De',
      subject: 'Objet',
      scam: 'C\'est une arnaque',
      legit: 'C\'est légitime',
      right: 'Bien vu !',
      wrong: 'Raté…',
      wasScam: 'C\'était une arnaque.',
      wasLegit: 'C\'était un message légitime.',
      clues: 'Les indices',
      cluesHint: 'Les numéros correspondent aux zones entourées sur le téléphone.',
      question: 'Ce message est-il une arnaque ?',
      next: 'Message suivant',
      finish: 'Voir mon résultat',
      result: 'Votre score',
      resultHigh: 'Excellent œil ! Vous repérez les pièges les plus courants.',
      resultMid: 'Pas mal ! Relisez les indices des messages ratés : ce sont ceux que les arnaqueurs réutilisent.',
      resultLow: 'Les arnaqueurs sont doués, c\'est normal de se faire avoir. Lisez le guide « Hameçonnage » puis réessayez.',
      restart: 'Recommencer',
      readGuide: 'Lire le guide Hameçonnage',
    },
    pw: {
      intro: 'Tapez un mot de passe pour voir combien de temps un pirate mettrait à le deviner. Tout reste sur votre appareil : rien n\'est envoyé ni enregistré.',
      label: 'Mot de passe à tester',
      placeholder: 'Ex : Senegal2024!',
      show: 'Afficher',
      hide: 'Masquer',
      time: 'Temps pour le deviner',
      levels: ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'],
      basis: 'Estimation pour un pirate équipé testant 10 milliards de combinaisons par seconde.',
      advice: 'Conseil : n\'y tapez pas votre vrai mot de passe. Testez plutôt un mot de passe qui lui ressemble.',
      findings: 'Analyse',
      genTitle: 'Besoin d\'idée ? Une phrase de passe',
      genText: '6 mots tirés au hasard dans une liste de plus de 2 000 mots, et un nombre placé au hasard. Générée sur votre appareil, avec le générateur aléatoire sécurisé du navigateur.',
      bits: (bits: number, words: number) => `≈ ${bits} bits d'imprévisibilité${words ? ` · ${words} mot${words > 1 ? 's' : ''} reconnu${words > 1 ? 's' : ''}` : ''}`,
      genBtn: 'Générer une phrase de passe',
      genTry: 'Tester celle-ci',
      tips: [
        'Un mot de passe différent pour chaque compte important (e-mail, Wave, banque, Facebook).',
        'Activez la double vérification : même volé, le mot de passe ne suffit plus.',
        'Un gestionnaire de mots de passe (Bitwarden, Google, Apple) retient tout pour vous.',
        'Laissez le hasard choisir les mots : des mots choisis « de tête » sont bien plus faciles à deviner.',
        'Un mot de passe déjà écrit dans une conversation, une IA ou une capture d\'écran doit être considéré comme compromis : changez-le.',
      ],
      findingText: PW_FINDINGS.fr,
      units: TIME_UNITS.fr,
    },
    fp: {
      intro: 'Ces questions ressemblent aux « quiz amusants » qui circulent sur les réseaux (« Ton nom de star = ta ville + ton année de naissance »). Remplissez le formulaire avec vos vraies réponses ou des réponses proches, et voyez ce qu\'un pirate en ferait.',
      privacy: 'Vos réponses restent sur votre appareil : rien n\'est envoyé ni enregistré.',
      submit: 'Voir ce qu\'un pirate en ferait',
      errors: {
        required: 'Ce champ est requis.',
        year: 'Indiquez une année à 4 chiffres, entre 1930 et aujourd\'hui.',
        tooLong: 'Réponse trop longue (40 caractères maximum).',
      },
      step: 'Indice',
      analysing: 'Un pirate assemble vos réponses…',
      log: [
        'Recherche de votre profil public…',
        'Croisement avec les photos et les commentaires…',
        'Création d\'une liste de mots de passe sur mesure…',
        'Rédaction d\'un message piège personnalisé…',
      ],
      title: 'Vos réponses sont des armes',
      subtitle: 'Avec seulement 4 informations publiques, voici ce qu\'un pirate peut tenter :',
      tabPw: 'Mots de passe devinables',
      tabQ: 'Questions secrètes',
      tabScam: 'Message piège',
      pwText: 'Les premiers mots de passe testés contre vos comptes. Vous reconnaissez votre schéma ?',
      qText: 'Beaucoup de services vous laissent récupérer votre compte en répondant à une « question secrète ». Le pirate connaît déjà les réponses :',
      qList: ['Dans quelle ville avez-vous grandi ?', 'Quel est le prénom de votre aîné(e) ?', 'Quelle est votre équipe préférée ?'],
      scamText: 'Un message sur mesure est beaucoup plus convaincant qu\'une arnaque générique :',
      todoTitle: 'Comment vous protéger',
      todo: [
        'Ne construisez jamais un mot de passe à partir de prénoms, villes, dates ou passions.',
        'Aux questions secrètes, donnez une fausse réponse que vous notez dans un gestionnaire de mots de passe.',
        'Passez votre date de naissance, votre ville et votre famille en « Moi uniquement » sur Facebook.',
        'Ne répondez pas aux quiz « Ton nom de star = … » : ce sont souvent des collectes de données.',
      ],
      restart: 'Recommencer',
    },
    quizNext: 'Question suivante',
    quizSeeResult: 'Voir mon score',
    quizBest: 'Meilleure réponse',
    quizGood: 'Bonne réponse !',
    quizPartial: 'Presque…',
    quizBad: 'Mauvaise réponse',
  },
  en: {
    channel: { sms: 'SMS', whatsapp: 'WhatsApp', email: 'Email', messenger: 'Messenger', facebook: 'Facebook' } as Record<Channel, string>,
    phish: {
      intro: `${SCENARIO_COUNT} messages received on a real phone: SMS, WhatsApp, emails, Facebook and Messenger. They mirror the most common situations in Senegal. Scam or legitimate? Look closely at the sender, the links and the attachments.`,
      progress: 'Message',
      of: 'of',
      from: 'From',
      subject: 'Subject',
      scam: 'It\'s a scam',
      legit: 'It\'s legitimate',
      right: 'Well spotted!',
      wrong: 'Missed…',
      wasScam: 'It was a scam.',
      wasLegit: 'It was a legitimate message.',
      clues: 'The clues',
      cluesHint: 'The numbers match the areas circled on the phone.',
      question: 'Is this message a scam?',
      next: 'Next message',
      finish: 'See my result',
      result: 'Your score',
      resultHigh: 'Sharp eye! You spot the most common traps.',
      resultMid: 'Not bad! Re-read the clues of the ones you missed: scammers reuse them.',
      resultLow: 'Scammers are good at this, it is normal to get caught. Read the "Phishing" guide and try again.',
      restart: 'Restart',
      readGuide: 'Read the Phishing guide',
    },
    pw: {
      intro: 'Type a password to see how long an attacker would need to guess it. Everything stays on your device: nothing is sent or saved.',
      label: 'Password to test',
      placeholder: 'E.g. Senegal2024!',
      show: 'Show',
      hide: 'Hide',
      time: 'Time to guess it',
      levels: ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'],
      basis: 'Estimate for an equipped attacker testing 10 billion combinations per second.',
      advice: 'Tip: don\'t type your real password here. Test a similar one instead.',
      findings: 'Analysis',
      genTitle: 'Need an idea? A passphrase',
      genText: '6 words drawn at random from a list of over 2,000, plus a number at a random spot. Generated on your device with the browser\'s secure random generator.',
      bits: (bits: number, words: number) => `≈ ${bits} bits of unpredictability${words ? ` · ${words} word${words > 1 ? 's' : ''} recognised` : ''}`,
      genBtn: 'Generate a passphrase',
      genTry: 'Test this one',
      tips: [
        'A different password for every important account (email, Wave, bank, Facebook).',
        'Turn on two-step verification: even if stolen, the password is no longer enough.',
        'A password manager (Bitwarden, Google, Apple) remembers everything for you.',
        'Let chance pick the words: words you choose "off the top of your head" are much easier to guess.',
        'A password already typed into a chat, an AI or a screenshot should be treated as compromised: change it.',
      ],
      findingText: PW_FINDINGS.en,
      units: TIME_UNITS.en,
    },
    fp: {
      intro: 'These questions look like the "fun quizzes" going around on social media ("Your star name = your city + birth year"). Fill in the form with your real answers or similar ones, and see what an attacker would do with them.',
      privacy: 'Your answers stay on your device: nothing is sent or saved.',
      submit: 'See what an attacker would do',
      errors: {
        required: 'This field is required.',
        year: 'Enter a 4-digit year, between 1930 and today.',
        tooLong: 'Answer too long (40 characters maximum).',
      },
      step: 'Clue',
      analysing: 'An attacker is piecing your answers together…',
      log: [
        'Searching for your public profile…',
        'Cross-checking photos and comments…',
        'Building a tailored password list…',
        'Writing a personalised trap message…',
      ],
      title: 'Your answers are weapons',
      subtitle: 'With just 4 public facts, here is what an attacker can try:',
      tabPw: 'Guessable passwords',
      tabQ: 'Security questions',
      tabScam: 'Trap message',
      pwText: 'The first passwords tried against your accounts. Do you recognise your pattern?',
      qText: 'Many services let you recover your account by answering a "security question". The attacker already knows the answers:',
      qList: ['Which city did you grow up in?', 'What is your eldest child\'s first name?', 'What is your favourite team?'],
      scamText: 'A tailored message is far more convincing than a generic scam:',
      todoTitle: 'How to protect yourself',
      todo: [
        'Never build a password from first names, cities, dates or hobbies.',
        'For security questions, give a fake answer and save it in a password manager.',
        'Set your birth date, city and family to "Only me" on Facebook.',
        'Don\'t answer "Your star name = …" quizzes: they are often data harvesting.',
      ],
      restart: 'Restart',
    },
    quizNext: 'Next question',
    quizSeeResult: 'See my score',
    quizBest: 'Best answer',
    quizGood: 'Correct!',
    quizPartial: 'Almost…',
    quizBad: 'Wrong answer',
  },
};

/** Explanations for each quiz question (same order as QUIZ in i18n.ts). */
export const QUIZ_WHY: Record<Lang, string[]> = {
  fr: [
    'Wave, Orange Money ou une banque ne vous demanderont JAMAIS votre code PIN. Bloquer est bien, mais vérifier via le numéro officiel permet aussi de signaler l\'arnaque.',
    'La longueur compte plus que tout. Une phrase transformée est longue, unique et facile à retenir. Dates et prénoms se trouvent en quelques minutes sur vos réseaux sociaux.',
    'Sur un Wi-Fi public, d\'autres personnes connectées peuvent tenter d\'intercepter ou de détourner votre connexion. Vos données mobiles passent par le réseau chiffré de l\'opérateur.',
    'L\'arnaque au faux proche joue sur l\'émotion et l\'urgence. Un simple appel au numéro habituel suffit à la démasquer.',
    'La double vérification ajoute une étape (un code ou une confirmation) que le pirate n\'a pas : même s\'il vole votre mot de passe, il reste bloqué.',
    'Les faux conseillers créent la panique pour vous faire agir vite. Raccrochez et rappelez vous-même le numéro officiel : le vrai service saura s\'il y a un problème.',
    'Ces chaînes ne viennent jamais de WhatsApp ou Facebook. Elles servent à diffuser des liens piégés ou à saturer les réseaux. Signaler aide à les arrêter.',
    'Un compte public expose l\'enfant à des inconnus. Le compte privé limite les risques, et le dialogue l\'aide à reconnaître seul les situations dangereuses.',
    '« Localiser mon appareil » permet de verrouiller ou d\'effacer le téléphone à distance. Changer vos mots de passe empêche l\'accès à vos comptes restés connectés.',
    'Ce code sert à confirmer que c\'est bien VOUS qui vous connectez. Le donner, c\'est donner la clé de votre compte. Aucun service légitime ne vous le redemande.',
  ],
  en: [
    'Wave, Orange Money or a bank will NEVER ask for your PIN. Blocking is good, but checking via the official number also lets you report the scam.',
    'Length matters most. A transformed phrase is long, unique and easy to remember. Dates and first names can be found in minutes on your social media.',
    'On public Wi-Fi, other connected people may try to intercept or redirect your connection. Your mobile data goes through the operator\'s encrypted network.',
    'The fake-relative scam plays on emotion and urgency. A simple call to the usual number is enough to expose it.',
    'Two-step verification adds a step (a code or confirmation) the attacker doesn\'t have: even if they steal your password, they stay locked out.',
    'Fake advisers create panic so you act fast. Hang up and call the official number yourself: the real service will know if there is a problem.',
    'These chains never come from WhatsApp or Facebook. They spread trapped links or flood networks. Reporting helps stop them.',
    'A public account exposes the child to strangers. A private account limits risk, and talking helps them recognise dangerous situations on their own.',
    '"Find My Device" lets you lock or wipe the phone remotely. Changing your passwords blocks access to accounts that stayed signed in.',
    'That code confirms it is really YOU signing in. Giving it away hands over the key to your account. No legitimate service asks for it again.',
  ],
};
