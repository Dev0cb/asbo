// FR/EN copy for the "Vos données parlent" self-audit and text scan.
// Each item says what an attacker could do with it — plausible uses, never
// an operational attack procedure.
import type { Lang } from '../i18n';
import type { ItemId, Level, ModuleId, ScenarioId } from '../lib/exposure/model';
import type { DetectorId } from '../lib/exposure/textScan';

interface ItemText {
  q: string;
  why: string;
  fix: string;
}

export const MODULE_TEXT: Record<Lang, Record<ModuleId, string>> = {
  fr: {
    identity: 'Identité',
    social: 'Réseaux sociaux et famille',
    professional: 'Vie professionnelle',
    technical: 'Comptes et traces techniques',
    metadata: 'Photos et métadonnées',
    habits: 'Habitudes et déplacements',
    accounts: 'Sécurité des comptes',
  },
  en: {
    identity: 'Identity',
    social: 'Social media and family',
    professional: 'Work life',
    technical: 'Accounts and technical traces',
    metadata: 'Photos and metadata',
    habits: 'Habits and travel',
    accounts: 'Account security',
  },
};

export const ITEM_TEXT: Record<Lang, Record<ItemId, ItemText>> = {
  fr: {
    birthDate: { q: 'Votre date de naissance complète (jour et année) est-elle visible sur vos réseaux ?', why: 'Elle sert de vérification d\'identité dans beaucoup de services et rend un message piège crédible.', fix: 'Passez-la en « Moi uniquement » dans les paramètres de confidentialité de vos réseaux.' },
    phone: { q: 'Votre numéro de téléphone est-il visible (profil, statut, groupes WhatsApp ouverts, annonces) ?', why: 'C\'est la clé de votre compte {money1}, de WhatsApp et de vos codes par SMS, et une cible fréquente des arnaques.', fix: 'Masquez-le sur vos profils et évitez de le publier dans des groupes ou des annonces.' },
    address: { q: 'Votre quartier ou votre adresse est-il visible (profil, photos devant chez vous, « check-in ») ?', why: 'Il permet de vous localiser et de rendre une fausse livraison ou un faux agent très crédibles.', fix: 'Retirez la ville actuelle de vos profils et évitez les photos où l\'on reconnaît votre maison.' },
    idDocument: { q: 'Avez-vous déjà envoyé une photo de votre {id} ou de votre passeport à un inconnu, ou publié une photo où on la voit ?', why: 'Une copie de pièce d\'identité peut servir à des démarches frauduleuses à votre nom.', fix: 'Ne l\'envoyez qu\'à des organismes vérifiés, avec un filigrane « Copie pour [organisme], [date] ».' },
    family: { q: 'Les noms et photos de vos proches (parents, conjoint, frères et sœurs) sont-ils publics ?', why: 'Ils servent à se faire passer pour un proche en détresse, ou à répondre à vos questions secrètes.', fix: 'Limitez vos listes d\'amis et la famille affichée à « Amis » ou « Moi uniquement ».' },
    children: { q: 'Publiez-vous des photos de vos enfants avec leur prénom, leur école ou leur tenue scolaire ?', why: 'Elles permettent d\'identifier un enfant, son école et ses horaires.', fix: 'Floutez les écussons et les visages, et ne citez jamais l\'école.' },
    quizzes: { q: 'Répondez-vous aux quiz « ton nom de star = … » ou aux chaînes de questions personnelles ?', why: 'Ces jeux collectent les réponses à vos questions secrètes : premier animal, ville natale, année…', fix: 'Ne répondez plus à ces quiz et supprimez vos anciennes réponses.' },
    employer: { q: 'Votre employeur et votre poste sont-ils publics (LinkedIn, Facebook) ?', why: 'Ils permettent de vous envoyer un faux message « du patron », d\'un fournisseur ou d\'un recruteur.', fix: 'Gardez le poste, mais ne publiez ni organigramme, ni procédures internes, ni noms de collègues.' },
    email: { q: 'Votre adresse e-mail est-elle publique (profil, CV en ligne, annonces) ?', why: 'C\'est l\'identifiant de vos comptes : elle reçoit le phishing et sert à tester des mots de passe volés.', fix: 'Utilisez une adresse différente pour le public et pour vos comptes importants.' },
    secretsPublished: { q: 'Avez-vous déjà publié du code, une capture d\'écran ou un document contenant un mot de passe, une clé ou un code ?', why: 'Des robots parcourent GitHub et les réseaux pour récupérer ce type de secret.', fix: 'Révoquez-les, générez-en de nouveaux, puis supprimez-les de l\'historique et des publications.' },
    samePseudo: { q: 'Utilisez-vous le même pseudo partout (Instagram, TikTok, jeux, forums) ?', why: 'Un pseudo identique relie des comptes qui semblaient séparés, et révèle ce que vous ne vouliez pas lier.', fix: 'Gardez des pseudos différents pour la vie publique, privée et professionnelle.' },
    photoLocation: { q: 'La localisation est-elle activée pour l\'appareil photo, ou publiez-vous des photos géolocalisées ?', why: 'Les photos peuvent contenir les coordonnées GPS exactes du lieu de prise de vue, parfois votre domicile.', fix: 'Désactivez la localisation de l\'appareil photo dans les réglages du téléphone.' },
    travelLive: { q: 'Annoncez-vous vos voyages ou absences en direct (« en route pour… », « 2 semaines à Paris ») ?', why: 'Cela signale une maison vide et rend crédible un faux appel « je suis bloqué à l\'aéroport ».', fix: 'Publiez vos souvenirs de voyage après votre retour.' },
    routine: { q: 'Vos habitudes sont-elles visibles (salle de sport, trajets, horaires, école ou université) ?', why: 'Des habitudes régulières permettent de prévoir où vous serez, et quand.', fix: 'Variez, évitez de publier des lieux en temps réel et limitez la visibilité de vos stories.' },
    noMfa: { q: 'La double vérification est-elle DÉSACTIVÉE sur WhatsApp ou sur votre e-mail ?', why: 'Sans elle, un seul code ou mot de passe volé suffit pour prendre votre compte.', fix: 'Activez la « validation en deux étapes » dans les réglages de WhatsApp et de votre messagerie.' },
    passwordReuse: { q: 'Utilisez-vous le même mot de passe sur plusieurs comptes ?', why: 'Une seule fuite peut donner accès à tous les comptes qui partagent ce mot de passe.', fix: 'Un mot de passe par compte important, retenu par un gestionnaire de mots de passe.' },
    realSecretAnswers: { q: 'Vos questions secrètes ont-elles de vraies réponses (ville natale, nom de la mère, premier animal) ?', why: 'Ces réponses peuvent se trouver sur vos réseaux : elles permettent de « récupérer » votre compte.', fix: 'Donnez de fausses réponses, et notez-les dans un gestionnaire de mots de passe.' },
  },
  en: {
    birthDate: { q: 'Is your full date of birth (day and year) visible on your social media?', why: 'Many services use it to check identity, and it makes a trap message credible.', fix: 'Set it to "Only me" in your social networks\' privacy settings.' },
    phone: { q: 'Is your phone number visible (profile, status, open WhatsApp groups, ads)?', why: 'It is the key to your {money1} account, WhatsApp and your SMS codes, and a frequent scam target.', fix: 'Hide it on your profiles and avoid posting it in groups or ads.' },
    address: { q: 'Is your neighbourhood or address visible (profile, photos in front of your home, check-ins)?', why: 'It lets people locate you and makes a fake delivery or fake agent very credible.', fix: 'Remove your current city from profiles and avoid photos where your house is recognisable.' },
    idDocument: { q: 'Have you ever sent a photo of your {id} or passport to a stranger, or posted a photo where it shows?', why: 'A copy of an ID can be used for fraudulent procedures in your name.', fix: 'Only send it to verified organisations, watermarked "Copy for [organisation], [date]".' },
    family: { q: 'Are the names and photos of your relatives (parents, partner, siblings) public?', why: 'They are used to pose as a relative in trouble, or to answer your security questions.', fix: 'Limit your friend lists and listed family to "Friends" or "Only me".' },
    children: { q: 'Do you post photos of your children with their name, school or school uniform?', why: 'They make it possible to identify a child, their school and their schedule.', fix: 'Blur badges and faces, and never name the school.' },
    quizzes: { q: 'Do you answer "your star name = …" quizzes or chains of personal questions?', why: 'These games harvest the answers to your security questions: first pet, home town, year…', fix: 'Stop answering these quizzes and delete your old answers.' },
    employer: { q: 'Are your employer and job title public (LinkedIn, Facebook)?', why: 'They let attackers send a fake message "from the boss", a supplier or a recruiter.', fix: 'Keep your title, but never post org charts, internal procedures or colleagues\' names.' },
    email: { q: 'Is your email address public (profile, online CV, ads)?', why: 'It is your account login: it receives phishing and is used to test stolen passwords.', fix: 'Use a different address for the public and for your important accounts.' },
    secretsPublished: { q: 'Have you ever published code, a screenshot or a document containing a password, a key or a code?', why: 'Bots scan GitHub and social media to collect this kind of secret.', fix: 'Revoke them, create new ones, then remove them from history and posts.' },
    samePseudo: { q: 'Do you use the same username everywhere (Instagram, TikTok, games, forums)?', why: 'An identical username links accounts that seemed separate, and reveals what you did not want linked.', fix: 'Keep different usernames for public, private and work life.' },
    photoLocation: { q: 'Is location turned on for the camera, or do you post geotagged photos?', why: 'Photos can hold the exact GPS position where they were taken, sometimes your home.', fix: 'Turn off camera location in your phone\'s settings.' },
    travelLive: { q: 'Do you announce trips or absences live ("on my way to…", "2 weeks in Paris")?', why: 'It signals an empty home and makes a fake "I\'m stuck at the airport" call credible.', fix: 'Post your travel memories after you get back.' },
    routine: { q: 'Are your habits visible (gym, commute, schedule, school or university)?', why: 'Regular habits make it possible to predict where you will be, and when.', fix: 'Vary them, avoid posting places in real time and limit who sees your stories.' },
    noMfa: { q: 'Is two-step verification TURNED OFF on WhatsApp or on your email?', why: 'Without it, a single stolen code or password is enough to take over your account.', fix: 'Turn on "two-step verification" in the settings of WhatsApp and of your email.' },
    passwordReuse: { q: 'Do you use the same password on several accounts?', why: 'A single leak can open every account that shares that password.', fix: 'One password per important account, remembered by a password manager.' },
    realSecretAnswers: { q: 'Do your security questions have real answers (home town, mother\'s name, first pet)?', why: 'These answers may be found on your social media: they let someone "recover" your account.', fix: 'Give fake answers, and save them in a password manager.' },
  },
};

export const ANSWER_TEXT: Record<Lang, { visibility: [string, string, string]; yesno: [string, string, string] }> = {
  fr: { visibility: ['Public', 'Amis seulement', 'Non / caché'], yesno: ['Oui', 'Je ne sais pas', 'Non'] },
  en: { visibility: ['Public', 'Friends only', 'No / hidden'], yesno: ['Yes', 'Not sure', 'No'] },
};

interface ScenarioText {
  title: string;
  how: string;
  actions: string[];
}

export const SCENARIO_TEXT: Record<Lang, Record<ScenarioId, ScenarioText>> = {
  fr: {
    secretLeak: { title: 'Secret exposé (clé, mot de passe, code)', how: 'Une personne malveillante pourrait tenter d\'utiliser ce secret pour accéder au service correspondant.', actions: ['Révoquez immédiatement le secret et générez-en un nouveau.', 'Vérifiez l\'historique d\'utilisation du service.', 'Supprimez le secret de l\'historique Git ou de la publication.'] },
    accountTakeover: { title: 'Prise de contrôle de compte', how: 'Un mot de passe réutilisé, issu d\'une fuite, pourrait ouvrir vos comptes sans double vérification pour l\'arrêter.', actions: ['Activez la double vérification sur WhatsApp et votre e-mail.', 'Changez les mots de passe réutilisés, en commençant par l\'e-mail.'] },
    identityTheft: { title: 'Usurpation d\'identité', how: 'Une copie de pièce d\'identité, combinée à votre date de naissance ou votre adresse, pourrait servir à ouvrir des comptes ou des lignes à votre nom.', actions: ['N\'envoyez plus votre pièce sans filigrane.', 'Surveillez les lignes et comptes ouverts à votre nom auprès des opérateurs.'] },
    childTargeting: { title: 'Ciblage de vos enfants', how: 'Les photos de vos enfants, croisées avec un lieu ou des horaires, pourraient permettre de les identifier et de savoir où les trouver.', actions: ['Supprimez ou floutez les photos qui montrent l\'école ou la tenue.', 'Limitez ces publications à un cercle de proches.'] },
    simSwap: { title: 'Duplication de carte SIM ou vol de compte mobile money', how: 'Votre numéro, avec votre date de naissance ou une copie de pièce d\'identité, pourrait servir à se faire passer pour vous auprès d\'un opérateur.', actions: ['Masquez votre numéro et votre date de naissance.', 'Mettez un code secret sur votre compte {money1} et ne le donnez jamais.'] },
    recovery: { title: 'Récupération frauduleuse de compte', how: 'Les réponses à vos questions secrètes peuvent se déduire de ce que vous publiez.', actions: ['Remplacez vos réponses par de fausses réponses notées dans un gestionnaire.', 'Préférez la double vérification aux questions secrètes.'] },
    spearPhishing: { title: 'Hameçonnage ciblé ou faux recruteur', how: 'Votre employeur et vos coordonnées permettent d\'écrire un faux message très crédible « de la direction », d\'un fournisseur ou d\'un recruteur.', actions: ['Vérifiez toute demande inhabituelle par un autre canal (appel au numéro connu).', 'Séparez vos coordonnées publiques et professionnelles.'] },
    fakeRelative: { title: 'Faux proche en détresse', how: 'En connaissant vos proches et votre numéro, un escroc peut se faire passer pour l\'un d\'eux (« c\'est moi, nouveau numéro, envoie vite… »).', actions: ['Convenez d\'un mot de passe familial pour les urgences.', 'Rappelez toujours la personne sur son ancien numéro.'] },
    burglary: { title: 'Absence repérable', how: 'Annoncer un voyage tout en laissant deviner où vous habitez signale une maison vide.', actions: ['Publiez vos voyages après votre retour.', 'Retirez la localisation de vos publications.'] },
    linkedAccounts: { title: 'Comptes reliés entre eux', how: 'Un même pseudo permet de relier vos comptes et de reconstituer votre profil complet.', actions: ['Utilisez des pseudos différents selon les usages.', 'Vérifiez ce qui apparaît quand on cherche votre pseudo.'] },
    tailoredScam: { title: 'Arnaque sur mesure', how: 'Des informations personnelles et un moyen de vous contacter suffisent pour un message piège personnalisé, bien plus convaincant qu\'une arnaque générique.', actions: ['Méfiez-vous d\'un message qui vous connaît « trop bien ».', 'Limitez les informations personnelles publiques.'] },
  },
  en: {
    secretLeak: { title: 'Exposed secret (key, password, code)', how: 'A malicious person could try to use this secret to access the service it belongs to.', actions: ['Revoke the secret right away and create a new one.', 'Check the service\'s usage history.', 'Remove the secret from Git history or from the post.'] },
    accountTakeover: { title: 'Account takeover', how: 'A reused password from a leak could open your accounts, with no two-step verification to stop it.', actions: ['Turn on two-step verification on WhatsApp and your email.', 'Change reused passwords, starting with your email.'] },
    identityTheft: { title: 'Identity theft', how: 'A copy of your ID, combined with your birth date or address, could be used to open accounts or lines in your name.', actions: ['Never send your ID again without a watermark.', 'Check with operators which lines and accounts exist in your name.'] },
    childTargeting: { title: 'Targeting your children', how: 'Photos of your children, combined with a place or schedule, could make it possible to identify them and know where to find them.', actions: ['Delete or blur photos showing the school or uniform.', 'Limit these posts to close family.'] },
    simSwap: { title: 'SIM swap or mobile money theft', how: 'Your number, with your birth date or a copy of your ID, could be used to impersonate you at an operator.', actions: ['Hide your number and birth date.', 'Set a secret code on your {money1} account and never share it.'] },
    recovery: { title: 'Fraudulent account recovery', how: 'The answers to your security questions can be inferred from what you post.', actions: ['Replace your answers with fake ones saved in a password manager.', 'Prefer two-step verification to security questions.'] },
    spearPhishing: { title: 'Targeted phishing or fake recruiter', how: 'Your employer and contact details make it easy to write a very credible fake message "from management", a supplier or a recruiter.', actions: ['Check any unusual request through another channel (call the known number).', 'Keep public and work contact details separate.'] },
    fakeRelative: { title: 'Fake relative in trouble', how: 'Knowing your relatives and your number, a scammer can pose as one of them ("it\'s me, new number, send quickly…").', actions: ['Agree on a family password for emergencies.', 'Always call the person back on their old number.'] },
    burglary: { title: 'Visible absence', how: 'Announcing a trip while revealing where you live signals an empty home.', actions: ['Post your trips after you get back.', 'Remove location from your posts.'] },
    linkedAccounts: { title: 'Linked accounts', how: 'The same username lets someone link your accounts and rebuild your full profile.', actions: ['Use different usernames for different purposes.', 'Check what shows up when you search your username.'] },
    tailoredScam: { title: 'Tailor-made scam', how: 'Personal details plus a way to reach you are enough for a personalised trap message, far more convincing than a generic scam.', actions: ['Be wary of a message that knows you "too well".', 'Limit the personal details you make public.'] },
  },
};

export const DETECTOR_TEXT: Record<Lang, Record<DetectorId, { label: string; why: string }>> = {
  fr: {
    email: { label: 'Adresse e-mail', why: 'Identifiant de vos comptes : elle reçoit le phishing et sert à tester des mots de passe volés.' },
    phone: { label: 'Numéro de téléphone', why: 'Clé de votre compte {money1}, de WhatsApp et de vos codes par SMS, et une cible fréquente des arnaques.' },
    birthDate: { label: 'Date de naissance', why: 'Sert de vérification d\'identité et de base aux mots de passe devinables.' },
    age: { label: 'Âge', why: 'Permet de retrouver votre année de naissance.' },
    place: { label: 'Lieu ou quartier', why: 'Permet de vous localiser ou de rendre un faux agent crédible.' },
    employer: { label: 'Employeur', why: 'Base des faux messages « du patron » et des faux recrutements.' },
    school: { label: 'École ou université', why: 'Révèle vos lieux et horaires réguliers.' },
    family: { label: 'Membres de la famille', why: 'Sert à se faire passer pour un proche en détresse.' },
    travel: { label: 'Voyage ou absence annoncés', why: 'Signale une maison vide et rend crédible un faux appel à l\'aide.' },
    card: { label: 'Numéro de carte bancaire', why: 'Ne doit jamais apparaître dans un texte public.' },
    iban: { label: 'IBAN / coordonnées bancaires', why: 'Peut servir à des prélèvements ou à crédibiliser une fraude.' },
    secret: { label: 'Secret (mot de passe, clé, jeton)', why: 'Utilisable tel quel par quiconque le lit : à révoquer immédiatement.' },
    otp: { label: 'Code de vérification', why: 'Un code partagé peut ouvrir votre compte sur un autre téléphone.' },
    handle: { label: 'Pseudo (@…)', why: 'Permet de relier vos comptes entre plateformes.' },
  },
  en: {
    email: { label: 'Email address', why: 'Your account login: it receives phishing and is used to test stolen passwords.' },
    phone: { label: 'Phone number', why: 'Key to your {money1} account, WhatsApp and your SMS codes, and a frequent scam target.' },
    birthDate: { label: 'Date of birth', why: 'Used to check identity and as the base of guessable passwords.' },
    age: { label: 'Age', why: 'Reveals your birth year.' },
    place: { label: 'Place or neighbourhood', why: 'Lets people locate you or makes a fake agent credible.' },
    employer: { label: 'Employer', why: 'Basis of fake "boss" messages and fake recruitment.' },
    school: { label: 'School or university', why: 'Reveals your regular places and hours.' },
    family: { label: 'Family members', why: 'Used to pose as a relative in trouble.' },
    travel: { label: 'Announced trip or absence', why: 'Signals an empty home and makes a fake call for help credible.' },
    card: { label: 'Bank card number', why: 'Must never appear in a public text.' },
    iban: { label: 'IBAN / bank details', why: 'Can be used for debits or to make a fraud credible.' },
    secret: { label: 'Secret (password, key, token)', why: 'Usable as-is by anyone who reads it: revoke it right away.' },
    otp: { label: 'Verification code', why: 'A shared code can open your account on another phone.' },
    handle: { label: 'Username (@…)', why: 'Lets people link your accounts across platforms.' },
  },
};

export const LEVEL_TEXT: Record<Lang, Record<Level, string>> = {
  fr: { low: 'Faible', moderate: 'Modéré', high: 'Élevé', critical: 'Critique' },
  en: { low: 'Low', moderate: 'Moderate', high: 'High', critical: 'Critical' },
};

export const EXPOSURE_UI = {
  fr: {
    modes: { game: 'Le quiz du pirate', audit: 'Mon auto-audit', scan: 'Analyser un texte' },
    auditIntro: 'Répondez honnêtement : vos réponses restent sur votre appareil. L\'indice se met à jour à chaque réponse, et vous pouvez changer une réponse pour voir l\'effet (« et si je la cachais ? »).',
    progress: (n: number, total: number) => `${n} / ${total} réponses`,
    index: 'Indice d\'exposition numérique',
    exposed: 'Informations exposées',
    correlations: 'Scénarios possibles',
    highRisk: 'Scénarios à risque élevé',
    actions: 'Actions recommandées',
    disclaimer: 'Indicateur de sensibilisation, pas une probabilité d\'être piraté. Calcul : sensibilité 25 %, accessibilité 25 %, facilité de corrélation 20 %, potentiel d\'exploitation 20 %, persistance 10 %, plus un bonus par scénario détecté.',
    declared: 'Information déclarée',
    potential: 'Risque potentiel',
    found: 'Trouvé dans votre texte',
    scenariosTitle: 'Ce qu\'un attaquant pourrait en faire',
    scenariosNone: 'Aucune combinaison dangereuse pour l\'instant. Continuez à répondre.',
    because: 'Parce que :',
    quickWinsTitle: 'Et si… ? Les gestes qui font le plus baisser votre indice',
    quickWin: (n: number) => `−${n} point${n > 1 ? 's' : ''}`,
    fixTitle: 'Comment réduire chaque exposition',
    reset: 'Effacer mes réponses',
    scanIntro: 'Collez VOTRE biographie, une de vos publications ou votre CV. L\'analyse se fait sur votre appareil : rien n\'est envoyé ni conservé. Les secrets trouvés sont masqués.',
    scanPlaceholder: 'Ex : « Née le 12/03/1998, je travaille chez … Quartier Mermoz. En route pour Paris ! »',
    scanBtn: 'Analyser mon texte',
    scanNone: 'Aucune information sensible repérée. Cela ne garantit pas que le texte ne révèle rien : relisez-le avec les yeux d\'un inconnu.',
    scanFound: 'Ce que votre texte révèle',
    counter: (n: number, max: number) => `${n.toLocaleString('fr')} / ${max.toLocaleString('fr')} caractères`,
  },
  en: {
    modes: { game: 'The attacker quiz', audit: 'My self-audit', scan: 'Analyse a text' },
    auditIntro: 'Answer honestly: your answers stay on your device. The index updates with each answer, and you can change an answer to see the effect ("what if I hid it?").',
    progress: (n: number, total: number) => `${n} / ${total} answers`,
    index: 'Digital exposure index',
    exposed: 'Exposed information',
    correlations: 'Possible scenarios',
    highRisk: 'High-risk scenarios',
    actions: 'Recommended actions',
    disclaimer: 'An awareness indicator, not a probability of being hacked. Formula: sensitivity 25%, accessibility 25%, ease of correlation 20%, exploitation potential 20%, persistence 10%, plus a bonus per scenario detected.',
    declared: 'Declared information',
    potential: 'Potential risk',
    found: 'Found in your text',
    scenariosTitle: 'What an attacker could do with it',
    scenariosNone: 'No dangerous combination yet. Keep answering.',
    because: 'Because:',
    quickWinsTitle: 'What if…? The steps that lower your index the most',
    quickWin: (n: number) => `−${n} point${n > 1 ? 's' : ''}`,
    fixTitle: 'How to reduce each exposure',
    reset: 'Clear my answers',
    scanIntro: 'Paste YOUR bio, one of your posts or your CV. The analysis runs on your device: nothing is sent or kept. Any secrets found are masked.',
    scanPlaceholder: 'E.g. "Born 12/03/1998, I work at … Mermoz neighbourhood. On my way to Paris!"',
    scanBtn: 'Analyse my text',
    scanNone: 'No sensitive information spotted. That does not guarantee the text reveals nothing: reread it through a stranger\'s eyes.',
    scanFound: 'What your text reveals',
    counter: (n: number, max: number) => `${n.toLocaleString('en')} / ${max.toLocaleString('en')} characters`,
  },
} as const;

/** Short names of the self-audit items, used in "because" lists. */
export const ITEM_LABEL: Record<Lang, Record<ItemId, string>> = {
  fr: {
    birthDate: 'date de naissance', phone: 'numéro de téléphone', address: 'quartier / adresse', idDocument: 'copie de pièce d\'identité',
    family: 'proches visibles', children: 'photos des enfants', quizzes: 'réponses aux quiz', employer: 'employeur', email: 'adresse e-mail',
    secretsPublished: 'secret publié', samePseudo: 'même pseudo partout', photoLocation: 'photos géolocalisées', travelLive: 'voyages en direct',
    routine: 'habitudes visibles', noMfa: 'pas de double vérification', passwordReuse: 'mot de passe réutilisé', realSecretAnswers: 'vraies réponses secrètes',
  },
  en: {
    birthDate: 'date of birth', phone: 'phone number', address: 'neighbourhood / address', idDocument: 'copy of ID',
    family: 'visible relatives', children: 'photos of children', quizzes: 'quiz answers', employer: 'employer', email: 'email address',
    secretsPublished: 'published secret', samePseudo: 'same username everywhere', photoLocation: 'geotagged photos', travelLive: 'live travel posts',
    routine: 'visible habits', noMfa: 'no two-step verification', passwordReuse: 'reused password', realSecretAnswers: 'real security answers',
  },
};
