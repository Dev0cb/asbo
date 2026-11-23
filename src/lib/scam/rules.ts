// Deterministic text rules, grouped in the six families of the ASBO scam
// model. Weights are starting values to calibrate on real (anonymised)
// messages — they are NOT probabilities. Patterns run on normalised text:
// lowercase, no accents, invisible characters removed.

export type Family = 'urgency' | 'sensitive' | 'promise' | 'link' | 'impersonation' | 'payment' | 'other';

export type RuleId =
  | 'suspendThreat'
  | 'deadline'
  | 'pressure'
  | 'askCode'
  | 'askPassword'
  | 'askCard'
  | 'askIdDocument'
  | 'verifyIdentity'
  | 'codeByMistake'
  | 'prize'
  | 'freeMoney'
  | 'investment'
  | 'upfrontFee'
  | 'sendMoney'
  | 'wrongTransfer'
  | 'sendBack'
  | 'jobOffer'
  | 'authority'
  | 'familyEmergency'
  | 'secrecy'
  | 'shouting';

export interface TextRule {
  id: RuleId;
  family: Family;
  weight: number;
  patterns: RegExp[];
}

// "send / give / enter …" — the request part of a credential theft.
const ASK = String.raw`(?:envoie[rz]?|envoyez|renvoie[rz]?|renvoyez|donne[rz]?|communique[rz]?|transmet(?:s|tre|tez)?|saisi(?:r|s|ssez)|entre[rz]?|tape[rz]?|confirme[rz]?|partage[rz]?|indique[rz]?|fourni(?:r|ssez)|ecri(?:s|vez|re)|dicte[rz]?|lis(?:ez)?|send|share|give|enter|type|confirm|provide|tell|forward|yonnee?(?: ma)?)`;
const GAP = String.raw`[^.!?\n]{0,60}?`;
const CODE = String.raw`(?:code (?:otp|pin|secret|de (?:validation|verification|confirmation|securite)|a \d chiffres|recu|whatsapp|wave|orange money)|\botp\b|\bpin\b|\bcvv\b|\bcode\b)`;
const PASSWORD = String.raw`(?:mot de passe|password|identifiants?|login details|credentials|code d'acces)`;
const CARD = String.raw`(?:numero de (?:votre |ta )?carte|card number|date d'expiration|expiry date|\biban\b|\brib\b|coordonnees bancaires|bank details)`;
const ID_DOC = String.raw`(?:(?:photo|copie|scan) (?:de |du |recto[- ]verso de )?(?:votre |ta )?(?:cni|carte d'identite|passeport|piece d'identite)|selfie avec|id card|passport)`;
const AMOUNT = String.raw`\d[\d\s.,]*\s?(?:f\b|fcfa|cfa|francs|xof|xaf|gnf|€|euros?|\$|dollars?|cedis?|ghs|₵|naira|ngn|₦|kes|ksh|shillings?|mad|dirhams?|cad)|(?:₦|₵|\$|€|ksh|kes|ghs)\s?\d`;

const ask = (target: string) => [new RegExp(`${ASK}${GAP}${target}`), new RegExp(`${target}${GAP}(?:a nous|a me|au|a l'agent|nous le|me le)? ?(?:envoyer|transmettre|communiquer|renvoyer|send|share)`)];

export const TEXT_RULES: TextRule[] = [
  // A. Urgency and psychological pressure
  {
    id: 'suspendThreat',
    family: 'urgency',
    weight: 15,
    patterns: [
      /(compte|account|carte|card|ligne|numero|sim|whatsapp|wave|orange money|abonnement|profil)[^.!?\n]{0,40}(suspendu|bloque|desactive|ferme|supprime|restreint|verrouille|coupe|suspended|blocked|deactivated|closed|locked|disabled|terminated|deleted)/,
      /(suspension|blocage|fermeture|desactivation|suppression|coupure) (definitive |immediate )?(de |du )?(votre |ton )?(compte|ligne|carte|numero|abonnement|courant)/,
    ],
  },
  {
    id: 'deadline',
    family: 'urgency',
    weight: 10,
    patterns: [
      /\b(dans les|dans|sous|d'ici|avant|within|in the next|in)\s*\d{1,2}\s*(h|heures?|hours?|minutes?|mn|min)\b/,
      /\b(24|48|72)\s?h\b/,
      /avant minuit|expire (aujourd'hui|ce soir|bientot|dans)|expires? (today|tonight|soon)|aujourd'hui seulement|today only/,
    ],
  },
  {
    id: 'pressure',
    family: 'urgency',
    weight: 10,
    patterns: [
      /immediatement|tout de suite|sans delai|des maintenant|\burgent|derniere chance|dernier (avis|rappel|delai|avertissement)|agissez vite|faites vite|au plus vite|immediately|right now|act now|last chance|final (notice|warning)|hurry/,
    ],
  },
  // B. Requests for sensitive information
  { id: 'askCode', family: 'sensitive', weight: 35, patterns: ask(CODE) },
  { id: 'askPassword', family: 'sensitive', weight: 35, patterns: ask(PASSWORD) },
  { id: 'askCard', family: 'sensitive', weight: 30, patterns: ask(CARD) },
  { id: 'askIdDocument', family: 'sensitive', weight: 15, patterns: ask(ID_DOC) },
  {
    id: 'codeByMistake',
    family: 'sensitive',
    weight: 35,
    patterns: [/(code|sms)[^.!?\n]{0,50}(par erreur|par megarde|by mistake|by accident)/, /(par erreur|by mistake)[^.!?\n]{0,50}(code|sms)/],
  },
  {
    id: 'verifyIdentity',
    family: 'sensitive',
    weight: 10,
    patterns: [
      /(confirme[rz]?|verifie[rz]?|valide[rz]?|mettez a jour|mettre a jour|actualise[rz]?|reactive[rz]?|confirm|verify|update|validate|reactivate) (votre |ton |vos |your )?(identite|compte|informations|donnees|kyc|account|details|profil|identity)/,
    ],
  },
  // C. Suspicious financial promises
  {
    id: 'prize',
    family: 'promise',
    weight: 15,
    patterns: [
      /(vous avez|tu as|you have|you've) (ete )?(selectionne|gagne|remporte|won|been selected)|felicitations|congratulations|\bgagnant|\bwinner|tirage au sort|lucky draw|jackpot|loterie|lottery/,
    ],
  },
  {
    id: 'freeMoney',
    family: 'promise',
    weight: 15,
    patterns: [
      new RegExp(`(recevez|recois|gagnez|gagne|obtenez|beneficiez|profitez|receive|get|claim|win)[^.!?\\n]{0,30}(gratuit|offert|free|bonus|cadeau|${AMOUNT})`),
      /argent facile|easy money|subvention (exceptionnelle|de l'etat)|aide (financiere|covid) de/,
    ],
  },
  {
    id: 'investment',
    family: 'promise',
    weight: 20,
    patterns: [
      /(investi(ssez|r|s|ssant)|placez|invest)[^.!?\n]{0,60}(\d|double|triple|benefice|profit|rendement|interet|retours?)/,
      /doubler (votre |ton )?argent|double your money|gains? garantis?|rendement garanti|guaranteed (profit|returns?)|sans (aucun )?risque|risk[- ]free/,
    ],
  },
  // F. Unusual payment requests
  {
    id: 'upfrontFee',
    family: 'payment',
    weight: 30,
    patterns: [
      /(frais|fee|fees)[^.!?\n]{0,30}(de dossier|d'inscription|de retrait|de deblocage|de livraison|de traitement|de transfert|de douane|de formation|d'activation|administratifs?|processing|registration|delivery|release|unlock|customs|withdrawal|activation)/,
      /(payez|payer|versez|verser|envoyez|reglez|regler|pay|send)[^.!?\n]{0,40}(d'abord|avant de|pour (recevoir|debloquer|retirer|valider|obtenir|activer|liberer)|first|to (receive|unlock|release|claim|activate))/,
    ],
  },
  {
    id: 'sendMoney',
    family: 'payment',
    weight: 15,
    patterns: [
      new RegExp(`(envoie[rz]?|envoyez|transfere[rz]?|faites un (depot|transfert)|depose[rz]?|verse[rz]?|recharge[rz]?|send|transfer|deposit|yonnee)[^.!?\\n]{0,40}(${AMOUNT}|argent|money|xaalis|credit|au (numero|\\+?\\d)|sur (le|ce) (numero|\\+?\\d))`),
    ],
  },
  {
    id: 'wrongTransfer',
    family: 'payment',
    weight: 25,
    patterns: [/(envoye|transfere|depose|recu|sent|transferred)[^.!?\n]{0,50}(par erreur|par megarde|by mistake|by error)|(trompe|erreur) de numero|wrong number/],
  },
  {
    id: 'sendBack',
    family: 'payment',
    weight: 10,
    patterns: [/(renvoie[rz]?|renvoyez|retourne[rz]?|rembourse[rz]?|send (it |the money )?back|return (it|the money))/],
  },
  // E. Impersonation
  {
    id: 'jobOffer',
    family: 'impersonation',
    weight: 5,
    patterns: [/recrutement|on recrute|nous recrutons|offre d'emploi|embauche|poste a pourvoir|travail a domicile|stage remunere|\bhiring\b|we are recruiting|job offer|work from home/],
  },
  {
    id: 'authority',
    family: 'impersonation',
    weight: 5,
    patterns: [/\bpolice\b|gendarmerie|tribunal|procureur|interpol|cybercriminalite|convocation|mandat d'arret|\bamende\b|plainte contre vous|arrest warrant/],
  },
  {
    id: 'familyEmergency',
    family: 'impersonation',
    weight: 20,
    patterns: [
      /(c'est moi|it's me)[^.!?\n]{0,40}(nouveau numero|new number)|(mon |my )?nouveau numero|j'ai change de numero|changed my number/,
      /(maman|papa|tonton|tata|mum|mom|dad|grand frere|grande soeur)[^.!?\n]{0,50}(urgence|accident|hopital|bloque|probleme|police|emergency|hospital)/,
    ],
  },
  {
    id: 'secrecy',
    family: 'other',
    weight: 10,
    patterns: [/ne (le |la )?(dis|dites) (rien|a personne)|n'en parle[rz]? a personne|garde[rz]? (le|ca|cela) secret|strictement confidentiel|don't tell anyone|keep (this|it) (secret|between us)|bul ko wax kenn/],
  },
];

/** Legitimate one-time-code notices say the opposite: "never share it". */
export const CODE_NOTICE_RE =
  /(ne (le |la |les )?(partagez|communiquez|donnez|transmettez|divulguez)|ne jamais (partager|communiquer|donner)|never share|do not share|don't share)[^.!?\n]{0,40}(personne|anyone|jamais|code|it)?/;

/** A request preceded by a negation ("ne communiquez jamais votre code") is advice, not a request. */
export const NEGATION_BEFORE_RE = /(\bne\b|\bn'|jamais|never|don't|do not|aucun)[^.!?\n]{0,12}$/;

/** International numbers (+225…, 00234…), Senegalese mobiles, and local numbers starting with 0. */
export const PHONE_RE =
  /(?:\+|00)\d{1,3}[\s.-]?\d(?:[\s.-]?\d){6,11}\b|\b(?:7[05678]|3[03])[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}\b|\b0\d(?:[\s.-]?\d){7,9}\b/g;

/** Caps cap the weight a single family can add, so one theme cannot dominate. */
export const FAMILY_CAPS: Record<Family, number> = {
  urgency: 25,
  sensitive: 50,
  promise: 30,
  link: 50,
  impersonation: 35,
  payment: 45,
  other: 20,
};
