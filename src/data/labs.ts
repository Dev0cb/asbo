// Content for the interactive labs on the Tools page (#/outils/...).
// Adapted from the "Cyber-Enquêteur Academy" modules (phishing detector,
// password cracking, "vos données parlent", account security) and rewritten
// for everyday Senegalese life: Wave, Orange Money, WhatsApp, SENELEC…
import type { Lang } from '../i18n';
import type { FindingKey, TimeUnit } from '../lib/password';
import { SCENARIO_COUNT, type Channel } from './phishing';

/* ============================ Footprint ("Vos données parlent") ============================ */

export interface FootprintQuestion {
  id: 'city' | 'year' | 'name' | 'passion';
  q: string;
  hint: string;
  options: string[];
}

export const FOOTPRINT_QUESTIONS: Record<Lang, FootprintQuestion[]> = {
  fr: [
    { id: 'city', q: 'Dans quelle ville avez-vous grandi ?', hint: 'Visible dans la section « À propos » de Facebook ou sur LinkedIn.', options: ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Touba', 'Kaolack'] },
    { id: 'year', q: 'Une année importante pour vous (naissance, bac, mariage) ?', hint: 'Les posts « joyeux anniversaire » la révèlent chaque année.', options: ['1990', '1995', '1998', '2002', '2005', '2010'] },
    { id: 'name', q: 'Le prénom de votre aîné(e) ou d\'un proche très cher ?', hint: 'Photos de baptême, tags, commentaires de la famille…', options: ['Awa', 'Moussa', 'Fatou', 'Cheikh', 'Aminata', 'Ibrahima'] },
    { id: 'passion', q: 'Votre passion ou votre équipe favorite ?', hint: 'Photos de profil, groupes, pages suivies.', options: ['Lions', 'Lutte', 'Musique', 'Football', 'Cuisine', 'Voyages'] },
  ],
  en: [
    { id: 'city', q: 'Which city did you grow up in?', hint: 'Visible in the Facebook "About" section or on LinkedIn.', options: ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Touba', 'Kaolack'] },
    { id: 'year', q: 'A year that matters to you (birth, graduation, wedding)?', hint: '"Happy birthday" posts reveal it every year.', options: ['1990', '1995', '1998', '2002', '2005', '2010'] },
    { id: 'name', q: 'The first name of your eldest child or someone very dear?', hint: 'Naming-ceremony photos, tags, family comments…', options: ['Awa', 'Moussa', 'Fatou', 'Cheikh', 'Aminata', 'Ibrahima'] },
    { id: 'passion', q: 'Your passion or favourite team?', hint: 'Profile pictures, groups, pages you follow.', options: ['Lions', 'Wrestling', 'Music', 'Football', 'Cooking', 'Travel'] },
  ],
};

export type FootprintAnswers = Record<FootprintQuestion['id'], string>;

const ascii = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]/g, '');

/** Passwords an attacker would try first, built only from the answers. */
export function guessablePasswords(a: FootprintAnswers): string[] {
  const city = ascii(a.city);
  const name = ascii(a.name);
  const passion = ascii(a.passion);
  const year = a.year;
  return [
    `${name}${year}`,
    `${city}${year}!`,
    `${passion}221`,
    `${name}_${city}`,
    `${passion}${year.slice(2)}`,
    `${name.toLowerCase()}${year}@`,
  ];
}

export function footprintScam(a: FootprintAnswers, lang: Lang): string {
  const slug = ascii(a.city).toLowerCase();
  return lang === 'fr'
    ? `Salam ! Les supporters « ${a.passion} » de ${a.city} organisent un grand tirage pour les membres nés en ${a.year} 🎁. ${a.name} t'a inscrit(e) ! Confirme ta place ici : bit.ly/tirage-${slug}`
    : `Salam! The "${a.passion}" fans of ${a.city} are holding a big draw for members born in ${a.year} 🎁. ${a.name} signed you up! Confirm your spot here: bit.ly/draw-${slug}`;
}

/* ============================== Passphrase words ============================== */

// 250 simple, easy-to-type words (FR + Wolof). Five random words from this
// list plus a number ≈ 46 bits even if the attacker knows the list.
export const PASSPHRASE_WORDS = [
  'baobab', 'teranga', 'thieb', 'yassa', 'mafe', 'bissap', 'attaya', 'pirogue', 'lutte', 'sabar',
  'djembe', 'kora', 'goree', 'lac-rose', 'niokolo', 'casamance', 'sine', 'saloum', 'fleuve', 'dune',
  'mangue', 'arachide', 'mil', 'riz', 'poisson', 'lion', 'gazelle', 'pelican', 'tortue', 'dauphin',
  'soleil', 'lune', 'etoile', 'nuage', 'pluie', 'vent', 'orage', 'sable', 'ocean', 'vague',
  'montagne', 'riviere', 'foret', 'jardin', 'marche', 'village', 'quartier', 'maison', 'fenetre', 'porte',
  'cahier', 'crayon', 'livre', 'tableau', 'ecole', 'velo', 'moto', 'taxi', 'car-rapide', 'train',
  'avion', 'bateau', 'chemin', 'pont', 'route', 'place', 'stade', 'musique', 'guitare', 'tambour',
  'danse', 'chanson', 'poeme', 'conte', 'griot', 'sagesse', 'courage', 'patience', 'respect', 'jom',
  'ndank', 'jamm', 'xarit', 'ndaw', 'mag', 'suba', 'guddi', 'tey', 'ganaw', 'kanam',
  'orange', 'citron', 'banane', 'papaye', 'coco', 'goyave', 'tamarin', 'gingembre', 'menthe', 'cafe',
  'the', 'lait', 'pain', 'beignet', 'fataya', 'thiakry', 'lakh', 'ngalakh', 'couscous', 'mbaxal',
  'rouge', 'vert', 'jaune', 'bleu', 'violet', 'blanc', 'noir', 'gris', 'dore', 'argent',
  'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche', 'matin', 'midi', 'soir',
  'chat', 'chien', 'cheval', 'chevre', 'mouton', 'poule', 'coq', 'ane', 'chameau', 'hibou',
  'lampe', 'bougie', 'miroir', 'tapis', 'natte', 'calebasse', 'panier', 'bol', 'cuillere', 'marmite',
  'nord', 'sud', 'est', 'ouest', 'colline', 'plaine', 'savane', 'desert', 'oasis', 'ile',
  'ami', 'voisin', 'cousin', 'frere', 'soeur', 'oncle', 'tante', 'grand', 'petit', 'sage',
  'rapide', 'calme', 'joyeux', 'brave', 'fier', 'doux', 'fort', 'leger', 'clair', 'vif',
  'parapluie', 'chapeau', 'boubou', 'sandale', 'ceinture', 'bracelet', 'collier', 'perle', 'tissu', 'wax',
  'telephone', 'radio', 'journal', 'lettre', 'timbre', 'carte', 'boussole', 'horloge', 'cle', 'cadenas',
  'football', 'basket', 'course', 'nage', 'saut', 'balle', 'filet', 'but', 'arbitre', 'coupe',
  'piment', 'oignon', 'tomate', 'carotte', 'manioc', 'igname', 'gombo', 'aubergine', 'chou', 'haricot',
  'aigle', 'corbeau', 'moineau', 'perroquet', 'flamant', 'heron', 'crabe', 'crevette', 'thiof', 'yaboy',
  'lumiere', 'ombre', 'feu', 'glace', 'brume', 'aube', 'crepuscule', 'eclair', 'arc-en-ciel', 'tonnerre',
  'zebre', 'girafe', 'elephant', 'hyene', 'singe', 'phacochere', 'antilope', 'buffle', 'crocodile', 'hippo',
];

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
    passphrase: 'Phrase de passe de plusieurs mots : longue ET facile à retenir. Excellent.',
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
    passphrase: 'Multi-word passphrase: long AND easy to remember. Excellent.',
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
      genText: 'Plusieurs mots au hasard reliés par des tirets : long, solide, et facile à retenir. Générée sur votre appareil.',
      genBtn: 'Générer une phrase de passe',
      genTry: 'Tester celle-ci',
      tips: [
        'Un mot de passe différent pour chaque compte important (e-mail, Wave, banque, Facebook).',
        'Activez la double vérification : même volé, le mot de passe ne suffit plus.',
        'Un gestionnaire de mots de passe (Bitwarden, Google, Apple) retient tout pour vous.',
      ],
      findingText: PW_FINDINGS.fr,
      units: TIME_UNITS.fr,
    },
    fp: {
      intro: 'Ces questions ressemblent aux « quiz amusants » qui circulent sur Facebook (« Ton nom de star = ta ville + ton année de naissance »). Répondez, et voyez ce qu\'un pirate en ferait.',
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
      genText: 'Several random words joined by dashes: long, strong, and easy to remember. Generated on your device.',
      genBtn: 'Generate a passphrase',
      genTry: 'Test this one',
      tips: [
        'A different password for every important account (email, Wave, bank, Facebook).',
        'Turn on two-step verification: even if stolen, the password is no longer enough.',
        'A password manager (Bitwarden, Google, Apple) remembers everything for you.',
      ],
      findingText: PW_FINDINGS.en,
      units: TIME_UNITS.en,
    },
    fp: {
      intro: 'These questions look like the "fun quizzes" going around on Facebook ("Your star name = your city + birth year"). Answer, and see what an attacker would do with it.',
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
