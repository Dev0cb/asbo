// FR/EN copy for the scam detector (kept out of i18n.ts, which is near its
// size limit). Every signal explains WHY it matters, in plain language.
import type { Lang } from '../i18n';
import type { AdviceId, ComboId, SignalId, Verdict } from '../lib/scam/engine';

interface Text {
  label: string;
  detail: string;
}

export const SIGNAL_TEXT: Record<Lang, Record<SignalId, Text>> = {
  fr: {
    suspendThreat: { label: 'Menace de blocage ou de suspension', detail: 'Faire peur (« compte bloqué ») pour vous empêcher de réfléchir : c\'est un levier très courant des arnaques.' },
    deadline: { label: 'Délai artificiel', detail: '« Dans les 24 h », « avant minuit » : un vrai service vous laisse le temps de vérifier.' },
    pressure: { label: 'Pression pour agir vite', detail: '« Urgent », « dernière chance » : la précipitation est l\'alliée de l\'arnaqueur.' },
    askCode: { label: 'Demande de code (OTP, PIN, code secret)', detail: 'Un agent de mobile money ou de banque n\'a pas à vous demander un code. Avec ce code, quelqu\'un peut accéder à votre compte.' },
    askPassword: { label: 'Demande de mot de passe', detail: 'Un service sérieux n\'a pas à vous demander votre mot de passe par message.' },
    askCard: { label: 'Demande de coordonnées bancaires', detail: 'Numéro de carte, date d\'expiration, IBAN : ne les donnez jamais en réponse à un message.' },
    askIdDocument: { label: 'Demande de pièce d\'identité', detail: 'Une photo de votre CNI sert à ouvrir des comptes ou des lignes à votre nom.' },
    verifyIdentity: { label: '« Confirmez votre compte / identité »', detail: 'Prétexte classique pour vous faire remplir un faux formulaire.' },
    codeByMistake: { label: '« Code envoyé par erreur »', detail: 'Technique de vol de compte WhatsApp : le code demandé est celui qui ouvre VOTRE compte sur le téléphone du pirate.' },
    prize: { label: 'Gain ou tirage au sort inattendu', detail: 'On ne gagne pas à un jeu auquel on n\'a pas participé.' },
    freeMoney: { label: 'Argent gratuit promis', detail: 'Bonus, cadeau, subvention « exceptionnelle » : l\'appât le plus courant.' },
    investment: { label: 'Investissement miracle', detail: 'Doubler son argent, gain garanti, sans risque : aucun placement honnête ne promet cela.' },
    upfrontFee: { label: 'Frais à payer d\'abord', detail: 'Payer pour recevoir un gain, un emploi ou un colis : c\'est l\'arnaque elle-même.' },
    sendMoney: { label: 'Demande d\'envoi d\'argent', detail: 'Le message vous demande de transférer de l\'argent ou du crédit.' },
    wrongTransfer: { label: '« Argent envoyé par erreur »', detail: 'Il arrive qu\'aucun argent n\'ait été envoyé : le SMS de « réception » peut être faux. Vérifiez votre solde dans l\'application officielle.' },
    sendBack: { label: 'Demande de renvoyer de l\'argent', detail: 'Ne renvoyez rien vous-même : une vraie erreur se règle par le service client officiel.' },
    jobOffer: { label: 'Offre d\'emploi ou de recrutement', detail: 'Pas suspect en soi, mais un employeur sérieux ne demande pas d\'argent pour un poste.' },
    authority: { label: 'Prétend venir de la police ou de la justice', detail: 'Une amende ou un paiement réclamé par message doit être vérifié directement auprès du service officiel.' },
    familyEmergency: { label: 'Faux proche en détresse ou « nouveau numéro »', detail: 'Appelez la personne sur son numéro habituel avant toute chose.' },
    secrecy: { label: 'Demande de garder le secret', detail: 'Vous isoler empêche quelqu\'un de vous mettre en garde.' },
    shouting: { label: 'Ton excessif (MAJUSCULES, !!!)', detail: 'Indice faible, mais fréquent dans les messages frauduleux.' },
    brandClaim: { label: 'Se présente comme une marque ou un service connu', detail: 'Vérifiez par vous-même dans l\'application ou au numéro officiel, jamais via le message.' },
    brandLink: { label: 'Lien qui imite une marque', detail: 'L\'adresse ressemble à celle d\'une marque connue sans être son vrai site.' },
    linkPresent: { label: 'Lien présent', detail: 'Lisez l\'adresse exacte avant tout clic. Dans le doute, n\'ouvrez pas.' },
    shortener: { label: 'Lien raccourci', detail: 'Il cache la vraie destination. Pas toujours malveillant, mais à éviter dans un message inattendu.' },
    ipLink: { label: 'Lien vers une adresse IP', detail: 'Les vrais services utilisent un nom de domaine, pas une suite de chiffres.' },
    punycode: { label: 'Adresse avec des caractères déguisés', detail: 'Des lettres étrangères qui ressemblent aux nôtres peuvent imiter un vrai site.' },
    suspiciousTld: { label: 'Extension de domaine inhabituelle', detail: '.xyz, .top, .click… souvent utilisées par des sites jetables. Indice, pas preuve.' },
    phishyWords: { label: 'Adresse « login / vérification / bonus »', detail: 'Ces mots dans une adresse inconnue servent à rendre un faux site crédible.' },
    apk: { label: 'Fichier d\'application à installer (.apk)', detail: 'N\'installez des applications que depuis le Play Store ou l\'App Store.' },
    obfuscated: { label: 'Caractères invisibles ou déguisés', detail: 'Le message cache des mots (« O T P », lettres étrangères) pour tromper les filtres.' },
    phonePayment: { label: 'Numéro de téléphone pour un paiement', detail: 'Un service officiel ne vous fait pas payer sur un numéro personnel.' },
    codeNotice: { label: 'Ressemble à un vrai message de code', detail: 'Il vous dit de ne partager le code avec personne, sans lien : c\'est ainsi qu\'écrivent les vrais services.' },
  },
  en: {
    suspendThreat: { label: 'Threat of blocking or suspension', detail: 'Fear ("account blocked") stops you from thinking: a very common scam lever.' },
    deadline: { label: 'Artificial deadline', detail: '"Within 24 h", "before midnight": a real service gives you time to check.' },
    pressure: { label: 'Pressure to act fast', detail: '"Urgent", "last chance": haste is the scammer\'s ally.' },
    askCode: { label: 'Asks for a code (OTP, PIN, secret code)', detail: 'A mobile money or bank agent has no reason to ask you for a code. With it, someone can access your account.' },
    askPassword: { label: 'Asks for a password', detail: 'A serious service has no reason to ask for your password by message.' },
    askCard: { label: 'Asks for bank details', detail: 'Card number, expiry date, IBAN: never give them in reply to a message.' },
    askIdDocument: { label: 'Asks for an ID document', detail: 'A photo of your ID card is used to open accounts or lines in your name.' },
    verifyIdentity: { label: '"Confirm your account / identity"', detail: 'Classic pretext to make you fill in a fake form.' },
    codeByMistake: { label: '"Code sent by mistake"', detail: 'WhatsApp account theft: the code requested is the one that opens YOUR account on the attacker\'s phone.' },
    prize: { label: 'Unexpected prize or draw', detail: 'You cannot win a game you never entered.' },
    freeMoney: { label: 'Free money promised', detail: 'Bonus, gift, "exceptional" grant: the most common bait.' },
    investment: { label: 'Miracle investment', detail: 'Double your money, guaranteed gains, risk-free: no honest investment promises that.' },
    upfrontFee: { label: 'Fees to pay first', detail: 'Paying to receive a prize, a job or a parcel: that IS the scam.' },
    sendMoney: { label: 'Asks you to send money', detail: 'The message asks you to transfer money or airtime.' },
    wrongTransfer: { label: '"Money sent by mistake"', detail: 'Sometimes no money was sent at all: the "received" SMS can be fake. Check your balance in the official app.' },
    sendBack: { label: 'Asks you to send money back', detail: 'Do not send anything yourself: a real mistake is fixed by official customer service.' },
    jobOffer: { label: 'Job or recruitment offer', detail: 'Not suspicious in itself, but a serious employer does not ask for money for a job.' },
    authority: { label: 'Claims to be police or justice', detail: 'A fine or payment demanded by message should be checked directly with the official service.' },
    familyEmergency: { label: 'Fake relative in trouble or "new number"', detail: 'Call the person on their usual number first.' },
    secrecy: { label: 'Asks you to keep it secret', detail: 'Isolating you stops anyone from warning you.' },
    shouting: { label: 'Excessive tone (CAPITALS, !!!)', detail: 'Weak clue, but common in fraudulent messages.' },
    brandClaim: { label: 'Claims to be a known brand or service', detail: 'Check yourself in the app or at the official number, never through the message.' },
    brandLink: { label: 'Link imitating a brand', detail: 'The address looks like a well-known brand\'s without being its real site.' },
    linkPresent: { label: 'Contains a link', detail: 'Read the exact address before clicking. When in doubt, do not open it.' },
    shortener: { label: 'Shortened link', detail: 'It hides the real destination. Not always malicious, but avoid it in an unexpected message.' },
    ipLink: { label: 'Link to an IP address', detail: 'Real services use a domain name, not a string of numbers.' },
    punycode: { label: 'Address with disguised characters', detail: 'Foreign letters that look like ours can imitate a real site.' },
    suspiciousTld: { label: 'Unusual domain extension', detail: '.xyz, .top, .click… often used by throwaway sites. A clue, not proof.' },
    phishyWords: { label: '"login / verification / bonus" address', detail: 'These words in an unknown address make a fake site look credible.' },
    apk: { label: 'App file to install (.apk)', detail: 'Only install apps from the Play Store or the App Store.' },
    obfuscated: { label: 'Invisible or disguised characters', detail: 'The message hides words ("O T P", foreign letters) to fool filters.' },
    phonePayment: { label: 'Phone number for a payment', detail: 'An official service does not make you pay to a personal number.' },
    codeNotice: { label: 'Looks like a genuine code message', detail: 'It tells you not to share the code, with no link: that is how real services write.' },
  },
};

export const COMBO_TEXT: Record<Lang, Record<ComboId, string>> = {
  fr: {
    codeAndFakeSite: 'Demande de code + faux site imitant une marque : schéma typique du vol de compte.',
    codeAndLink: 'Demande de code ou de mot de passe + lien : ne cliquez pas, ne donnez rien.',
    codeTheft: '« Code envoyé par erreur » + demande de le renvoyer : vol de compte WhatsApp en cours.',
    codeAndBrand: 'Se fait passer pour une marque ET demande un code : une marque ne fait jamais ça.',
    threatAndLink: 'Menace + lien : on veut vous faire cliquer sous le coup de la peur.',
    feeForGain: 'Gain, emploi ou bonus promis contre des frais : l\'argent versé ne revient jamais.',
    refundTrap: '« Erreur de transfert » + demande de remboursement : schéma d\'arnaque courant avec le mobile money.',
    familyMoney: 'Faux proche + demande d\'argent : rappelez la personne sur son ancien numéro.',
  },
  en: {
    codeAndFakeSite: 'Code request + fake site imitating a brand: typical account-theft pattern.',
    codeAndLink: 'Code or password request + link: do not click, give nothing.',
    codeTheft: '"Code sent by mistake" + request to send it back: WhatsApp account theft in progress.',
    codeAndBrand: 'Poses as a brand AND asks for a code: a brand never does that.',
    threatAndLink: 'Threat + link: they want you to click out of fear.',
    feeForGain: 'Prize, job or bonus promised in exchange for fees: the money never comes back.',
    refundTrap: '"Transfer mistake" + refund request: a common mobile money scam pattern.',
    familyMoney: 'Fake relative + money request: call the person back on their old number.',
  },
};

export const VERDICT_TEXT: Record<Lang, Record<Verdict, Text>> = {
  fr: {
    low: { label: 'Aucun signal suspect détecté', detail: 'Cela ne prouve pas que le message est légitime : une arnaque bien écrite peut passer inaperçue.' },
    moderate: { label: 'Risque modéré', detail: 'Quelques éléments méritent une vérification avant d\'agir.' },
    high: { label: 'Risque élevé', detail: 'Plusieurs caractéristiques courantes des tentatives d\'arnaque.' },
    critical: { label: 'Risque critique', detail: 'Forte accumulation de signaux dangereux. Ne cliquez pas, ne payez pas, ne donnez aucun code.' },
  },
  en: {
    low: { label: 'No suspicious signal detected', detail: 'This does not prove the message is genuine: a well-written scam can slip through.' },
    moderate: { label: 'Moderate risk', detail: 'A few things deserve checking before you act.' },
    high: { label: 'High risk', detail: 'Several features common to scam attempts.' },
    critical: { label: 'Critical risk', detail: 'Heavy build-up of dangerous signals. Do not click, do not pay, give no code.' },
  },
};

export const ADVICE_TEXT: Record<Lang, Record<AdviceId, string>> = {
  fr: {
    noLink: 'N\'ouvrez pas le lien. Pour vérifier, tapez vous-même l\'adresse officielle ou passez par l\'application.',
    noApk: 'N\'installez pas ce fichier : une fausse application peut lire vos SMS et vos codes.',
    noCode: 'Ne communiquez aucun code (OTP, PIN, WhatsApp), mot de passe ni photo de pièce d\'identité.',
    noPay: 'Ne payez aucun frais et n\'envoyez pas d\'argent à la demande d\'un message.',
    refund: 'Vérifiez votre solde dans l\'application officielle. Si une vraie erreur existe, l\'opérateur la règle lui-même.',
    callBack: 'Appelez la personne sur son numéro habituel, ou un proche commun, avant toute chose.',
    job: 'Un vrai employeur ne fait jamais payer de frais de dossier, de formation ou de badge.',
    officialApp: 'Vérifiez directement dans l\'application officielle de votre service (mobile money, banque, opérateur) ou à son numéro officiel.',
    alreadyDone: 'Déjà donné un code ou payé ? Appelez tout de suite votre opérateur ou votre banque pour bloquer, et changez vos codes.',
    report: 'Signalez le message (WhatsApp : bloquer et signaler) et prévenez votre entourage.',
    noProof: 'Restez prudent : en cas de doute, vérifiez par un autre canal que le message lui-même.',
  },
  en: {
    noLink: 'Do not open the link. To check, type the official address yourself or use the app.',
    noApk: 'Do not install this file: a fake app can read your SMS and your codes.',
    noCode: 'Give no code (OTP, PIN, WhatsApp), no password and no photo of your ID.',
    noPay: 'Pay no fees and send no money because a message asks you to.',
    refund: 'Check your balance in the official app. If there really was a mistake, the operator fixes it.',
    callBack: 'Call the person on their usual number, or a mutual relative, first.',
    job: 'A real employer never charges application, training or badge fees.',
    officialApp: 'Check directly in your service\'s official app (mobile money, bank, operator) or at its official number.',
    alreadyDone: 'Already gave a code or paid? Call your operator or bank right away to block it, and change your codes.',
    report: 'Report the message (WhatsApp: block and report) and warn the people around you.',
    noProof: 'Stay careful: when in doubt, check through another channel than the message itself.',
  },
};

export const CHECKER_UI = {
  fr: {
    counter: (n: number, max: number) => `${n.toLocaleString('fr')} / ${max.toLocaleString('fr')} caractères`,
    signals: 'Signaux détectés',
    combos: 'Combinaisons dangereuses',
    links: 'Liens analysés',
    advice: 'Que faire',
    evidence: 'Repéré',
    noSignal: 'Aucun des signaux connus n\'a été trouvé.',
    officialLink: 'domaine officiel',
    method: 'Analyse par règles, sans IA : chaque signal a un poids, certaines combinaisons déclenchent directement un risque critique. C\'est un indicateur, pas une preuve.',
    privacy: 'Analyse locale · Aucun compte requis · Aucun message conservé',
  },
  en: {
    counter: (n: number, max: number) => `${n.toLocaleString('en')} / ${max.toLocaleString('en')} characters`,
    signals: 'Signals detected',
    combos: 'Dangerous combinations',
    links: 'Links analysed',
    advice: 'What to do',
    evidence: 'Spotted',
    noSignal: 'None of the known signals was found.',
    officialLink: 'official domain',
    method: 'Rule-based analysis, no AI: each signal has a weight, and some combinations trigger a critical risk directly. It is an indicator, not proof.',
    privacy: 'Local analysis · No account needed · No message stored',
  },
} as const;

/** Plain-text summary of an analysis (used to ground the optional on-device AI). */
export function describeSignals(signals: { id: SignalId }[], lang: Lang): string {
  return signals
    .filter((s) => s.id !== 'codeNotice')
    .map((s) => `- ${SIGNAL_TEXT[lang][s.id].label} : ${SIGNAL_TEXT[lang][s.id].detail}`)
    .join('\n');
}
