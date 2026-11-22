// Content for the interactive labs on the Tools page (#/outils/...).
// Adapted from the "Cyber-Enquêteur Academy" modules (phishing detector,
// password cracking, "vos données parlent", account security) and rewritten
// for everyday Senegalese life: Wave, Orange Money, WhatsApp, SENELEC…
import type { Lang } from '../i18n';
import type { FindingKey, TimeUnit } from '../lib/password';

/* ============================== Phishing trainer ============================== */

export type Channel = 'sms' | 'whatsapp' | 'email';

export interface PhishingScenario {
  channel: Channel;
  from: string;
  subject?: string;
  body: string;
  isScam: boolean;
  clues: string[];
  explanation: string;
}

export const PHISHING: Record<Lang, PhishingScenario[]> = {
  fr: [
    {
      channel: 'sms',
      from: 'WAVE-INFO',
      body: 'Wave : votre compte est suspendu suite à une activité suspecte. Confirmez votre identité sous 24h sur wave-sn-securite.com/verif sinon votre solde sera bloqué.',
      isScam: true,
      clues: [
        'Le lien « wave-sn-securite.com » n\'est pas le site officiel de Wave (wave.com).',
        'Urgence et menace : « sous 24h », « solde bloqué ».',
        'Wave ne vous demande jamais de vous identifier via un lien reçu par SMS.',
      ],
      explanation: 'C\'est un hameçonnage classique. Le nom d\'expéditeur d\'un SMS se falsifie facilement. Ouvrez toujours l\'application Wave vous-même pour vérifier votre compte.',
    },
    {
      channel: 'sms',
      from: 'OrangeMoney',
      body: 'Vous avez reçu 15 000 FCFA du 77 XXX XX 12. Nouveau solde : 23 450 FCFA. Réf : MP2611.1834.B47201.',
      isScam: false,
      clues: [
        'Aucun lien, aucune demande d\'action, aucun code demandé.',
        'Simple information, format habituel des notifications Orange Money.',
        'Réflexe : confirmez quand même le solde dans l\'application (#144#) avant tout.',
      ],
      explanation: 'Ce message est légitime. Mais attention à l\'arnaque qui suit souvent : un faux SMS de ce type, puis un appel « je me suis trompé, renvoie-moi l\'argent ». Vérifiez toujours votre vrai solde.',
    },
    {
      channel: 'whatsapp',
      from: '+221 78 XXX XX 41 (inconnu)',
      body: 'Maman c\'est moi, mon téléphone est tombé dans l\'eau, voici mon nouveau numéro. J\'ai un souci urgent, envoie-moi 50 000 F par Wave stp, je t\'explique ce soir 🙏',
      isScam: true,
      clues: [
        'Numéro inconnu qui prétend être un proche.',
        'Demande d\'argent urgente, sans pouvoir appeler.',
        '« Je t\'explique plus tard » : empêche toute vérification.',
      ],
      explanation: 'C\'est l\'arnaque au faux proche. Appelez l\'ancien numéro de la personne ou posez une question que seul votre vrai proche connaît.',
    },
    {
      channel: 'email',
      from: 'no-reply@accounts.google.com',
      subject: 'Alerte de sécurité',
      body: 'Nouvelle connexion sur Windows. Nous avons détecté une nouvelle connexion à votre compte Google. Si c\'était vous, vous n\'avez rien à faire. Sinon, nous vous aiderons à sécuriser votre compte.\n\nVérifier l\'activité',
      isScam: false,
      clues: [
        'Adresse officielle @accounts.google.com.',
        'Pas de menace, pas d\'urgence, pas de mot de passe demandé.',
        'Bon réflexe : vérifiez dans l\'application Gmail, pas via le bouton.',
      ],
      explanation: 'Cet e-mail est légitime : Google envoie ce type d\'alerte. Pour vérifier, allez vous-même dans « Compte Google › Sécurité » plutôt que de cliquer.',
    },
    {
      channel: 'email',
      from: 'senelec-facturation@gmail.com',
      subject: 'URGENT : coupure de courant ce soir',
      body: 'Cher client, votre facture est impayée. Sans régularisation aujourd\'hui, votre compteur sera coupé à 18h.\n\nTéléchargez votre facture et payez ici :\n📎 Facture_Senelec.apk',
      isScam: true,
      clues: [
        'Une entreprise n\'écrit pas depuis une adresse @gmail.com.',
        'Menace de coupure le jour même.',
        'Pièce jointe .apk : c\'est une application Android, pas une facture. Elle peut prendre le contrôle du téléphone.',
      ],
      explanation: 'Arnaque dangereuse : le fichier .apk installe un logiciel espion. Une facture est un PDF. Payez uniquement via les canaux officiels (Woyofal, application SENELEC, agences).',
    },
    {
      channel: 'whatsapp',
      from: 'Cheikh (contact enregistré)',
      body: 'Salut ! Je t\'ai envoyé un code par SMS par erreur, je l\'attendais pour mon compte. Tu peux me le renvoyer vite stp ? 6 chiffres',
      isScam: true,
      clues: [
        'Le code SMS que vous avez reçu sert à connecter VOTRE WhatsApp sur un autre téléphone.',
        'Le compte de votre ami a probablement déjà été piraté.',
        'Personne n\'envoie « par erreur » un code de vérification à votre numéro.',
      ],
      explanation: 'C\'est la technique n°1 de vol de comptes WhatsApp au Sénégal. Ne partagez jamais un code reçu par SMS, même avec un proche. Activez la « Validation en deux étapes » dans WhatsApp.',
    },
    {
      channel: 'sms',
      from: 'Banque',
      body: 'Paiement de 12 500 FCFA par carte ****4821 chez AUCHAN SACRE-COEUR le 21/11 à 18:42. Si vous n\'êtes pas à l\'origine de cette opération, appelez le numéro au dos de votre carte.',
      isScam: false,
      clues: [
        'Aucun lien à cliquer, aucun code demandé.',
        'Vous renvoie vers le numéro au dos de VOTRE carte, pas vers un numéro dans le message.',
        'Information précise et vérifiable dans votre relevé.',
      ],
      explanation: 'Notification légitime. Le bon réflexe en cas de doute est justement celui proposé : appeler le numéro imprimé sur votre carte.',
    },
    {
      channel: 'whatsapp',
      from: 'Promo Anniversaire 🎉',
      body: 'Félicitations ! Votre numéro a gagné 1 000 000 FCFA au tirage anniversaire de votre opérateur. Pour recevoir votre gain, envoyez 5 000 F de frais de dossier au 76 XXX XX 09.',
      isScam: true,
      clues: [
        'Vous n\'avez participé à aucun jeu.',
        'Il faut payer pour recevoir un gain : c\'est toujours une arnaque.',
        'Paiement vers un numéro personnel, pas vers l\'opérateur.',
      ],
      explanation: 'Arnaque aux « frais de dossier ». Un vrai gain ne demande jamais de payer d\'abord. Bloquez et signalez le numéro.',
    },
  ],
  en: [
    {
      channel: 'sms',
      from: 'WAVE-INFO',
      body: 'Wave: your account has been suspended due to suspicious activity. Confirm your identity within 24h at wave-sn-securite.com/verif or your balance will be frozen.',
      isScam: true,
      clues: [
        'The link "wave-sn-securite.com" is not Wave\'s official site (wave.com).',
        'Urgency and threats: "within 24h", "balance frozen".',
        'Wave never asks you to identify yourself through a link received by SMS.',
      ],
      explanation: 'Classic phishing. An SMS sender name is easy to fake. Always open the Wave app yourself to check your account.',
    },
    {
      channel: 'sms',
      from: 'OrangeMoney',
      body: 'You received 15,000 FCFA from 77 XXX XX 12. New balance: 23,450 FCFA. Ref: MP2611.1834.B47201.',
      isScam: false,
      clues: [
        'No link, no action requested, no code asked for.',
        'Plain information in the usual Orange Money notification format.',
        'Reflex: still confirm the balance in the app (#144#) before anything else.',
      ],
      explanation: 'This message is legitimate. But beware the scam that often follows: a fake SMS like this, then a call "I sent it by mistake, send it back". Always check your real balance.',
    },
    {
      channel: 'whatsapp',
      from: '+221 78 XXX XX 41 (unknown)',
      body: 'Mum it\'s me, my phone fell in water, this is my new number. I have an urgent problem, please send me 50,000 F by Wave, I\'ll explain tonight 🙏',
      isScam: true,
      clues: [
        'Unknown number claiming to be a relative.',
        'Urgent money request, with no way to call.',
        '"I\'ll explain later": prevents any verification.',
      ],
      explanation: 'This is the fake-relative scam. Call the person\'s old number or ask a question only your real relative would know.',
    },
    {
      channel: 'email',
      from: 'no-reply@accounts.google.com',
      subject: 'Security alert',
      body: 'New sign-in on Windows. We noticed a new sign-in to your Google Account. If this was you, you don\'t need to do anything. If not, we\'ll help you secure your account.\n\nCheck activity',
      isScam: false,
      clues: [
        'Official address @accounts.google.com.',
        'No threat, no urgency, no password requested.',
        'Good reflex: check in the Gmail app, not through the button.',
      ],
      explanation: 'This email is legitimate: Google sends this kind of alert. To check, go to "Google Account › Security" yourself rather than clicking.',
    },
    {
      channel: 'email',
      from: 'senelec-facturation@gmail.com',
      subject: 'URGENT: power cut tonight',
      body: 'Dear customer, your bill is unpaid. Without payment today, your meter will be cut at 6pm.\n\nDownload your bill and pay here:\n📎 Facture_Senelec.apk',
      isScam: true,
      clues: [
        'A company does not write from a @gmail.com address.',
        'Threat of a same-day power cut.',
        '.apk attachment: that is an Android app, not a bill. It can take over the phone.',
      ],
      explanation: 'Dangerous scam: the .apk file installs spyware. A bill is a PDF. Only pay through official channels (Woyofal, the SENELEC app, agencies).',
    },
    {
      channel: 'whatsapp',
      from: 'Cheikh (saved contact)',
      body: 'Hi! I sent a code to you by SMS by mistake, I was waiting for it for my account. Can you send it back quickly please? 6 digits',
      isScam: true,
      clues: [
        'The SMS code you received is for logging YOUR WhatsApp into another phone.',
        'Your friend\'s account has probably already been hacked.',
        'Nobody sends a verification code to your number "by mistake".',
      ],
      explanation: 'This is the #1 WhatsApp account-theft technique in Senegal. Never share a code received by SMS, even with someone close. Turn on WhatsApp "Two-step verification".',
    },
    {
      channel: 'sms',
      from: 'Bank',
      body: 'Card payment of 12,500 FCFA with card ****4821 at AUCHAN SACRE-COEUR on 21/11 at 18:42. If you did not make this transaction, call the number on the back of your card.',
      isScam: false,
      clues: [
        'No link to click, no code requested.',
        'Points you to the number on the back of YOUR card, not to a number in the message.',
        'Precise information you can check on your statement.',
      ],
      explanation: 'Legitimate notification. The right reflex when in doubt is exactly the one suggested: call the number printed on your card.',
    },
    {
      channel: 'whatsapp',
      from: 'Anniversary Promo 🎉',
      body: 'Congratulations! Your number won 1,000,000 FCFA in your operator\'s anniversary draw. To receive your prize, send 5,000 F processing fees to 76 XXX XX 09.',
      isScam: true,
      clues: [
        'You did not enter any contest.',
        'Paying to receive a prize: always a scam.',
        'Payment to a personal number, not to the operator.',
      ],
      explanation: '"Processing fee" scam. A real prize never asks you to pay first. Block and report the number.',
    },
  ],
};

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
    channel: { sms: 'SMS', whatsapp: 'WhatsApp', email: 'E-mail' } as Record<Channel, string>,
    phish: {
      intro: 'Huit messages réels ou frauduleux, tirés de situations courantes au Sénégal. À vous de juger : arnaque ou message légitime ?',
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
    channel: { sms: 'SMS', whatsapp: 'WhatsApp', email: 'Email' } as Record<Channel, string>,
    phish: {
      intro: 'Eight real or fraudulent messages, based on common situations in Senegal. You decide: scam or legitimate?',
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
