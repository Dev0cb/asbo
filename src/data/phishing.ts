// "Vrai ou arnaque ?" scenarios — the most common real-life cases seen in
// Senegal on SMS, WhatsApp, e-mail, Facebook and Messenger. Each one is
// rendered inside a drawn smartphone (components/tools/phone).
// Brand names appear only as the scammers misuse them; all numbers, links
// and addresses are fictitious.
import type { Lang } from '../i18n';

export type Channel = 'sms' | 'whatsapp' | 'email' | 'messenger' | 'facebook';
/** Which part of the phone screen a clue points at (highlighted after answering). */
export type ClueTarget = 'sender' | 'banner' | 'subject' | 'body' | 'link' | 'attachment' | 'cta' | 'price';
export type Illustration = 'gift' | 'job' | 'phone' | 'video' | 'crypto' | 'parcel';

export interface Clue {
  text: string;
  target?: ClueTarget;
}

interface ScenarioText {
  sender: string;
  senderDetail?: string;
  subject?: string;
  body: string;
  link?: string;
  cta?: string;
  price?: string;
  stats?: string;
  clues: Clue[];
  explanation: string;
}

interface ScenarioBase {
  id: string;
  channel: Channel;
  isScam: boolean;
  time: string;
  /** WhatsApp: "this number is not in your contacts" banner. */
  unknown?: boolean;
  attachment?: string;
  illustration?: Illustration;
  avatar?: string;
  text: Record<Lang, ScenarioText>;
}

export interface PhishingScenario extends Omit<ScenarioBase, 'text'>, ScenarioText {}

const SCENARIOS: ScenarioBase[] = [
  {
    id: 'wave-suspended',
    channel: 'sms',
    isScam: true,
    time: '08:14',
    text: {
      fr: {
        sender: 'WAVE-INFO',
        body: 'Wave: Votre compte est suspendu suite a une activite suspecte. Confirmez votre identite sous 24h sinon votre solde sera bloquer :',
        link: 'https://wave-sn-securite.com/verif',
        clues: [
          { target: 'link', text: '« wave-sn-securite.com » n\'est pas le site de Wave (wave.com).' },
          { target: 'body', text: 'Urgence, menace et fautes : « sous 24h », « solde sera bloquer ».' },
          { target: 'sender', text: 'Le nom d\'expéditeur d\'un SMS se falsifie très facilement.' },
        ],
        explanation: 'Wave ne vous demande jamais de vous identifier via un lien reçu par SMS. Ouvrez vous-même l\'application pour vérifier votre compte.',
      },
      en: {
        sender: 'WAVE-INFO',
        body: 'Wave: Your account is suspended due to suspicious activity. Confirm your identity within 24h or your balance will be block:',
        link: 'https://wave-sn-securite.com/verif',
        clues: [
          { target: 'link', text: '"wave-sn-securite.com" is not Wave\'s website (wave.com).' },
          { target: 'body', text: 'Urgency, threats and mistakes: "within 24h", "will be block".' },
          { target: 'sender', text: 'An SMS sender name is very easy to fake.' },
        ],
        explanation: 'Wave never asks you to identify yourself through a link received by SMS. Open the app yourself to check your account.',
      },
    },
  },
  {
    id: 'whatsapp-fake-relative',
    channel: 'whatsapp',
    isScam: true,
    time: '21:47',
    unknown: true,
    text: {
      fr: {
        sender: '+221 78 412 09 41',
        body: 'Maman c\'est moi 😔 mon téléphone est tombé dans l\'eau, je t\'écris avec le numéro d\'un ami. J\'ai un gros souci, envoie moi 50 000 F par Wave stp c\'est urgent, je t\'explique ce soir 🙏🙏',
        clues: [
          { target: 'banner', text: 'Numéro inconnu, absent de vos contacts, qui prétend être un proche.' },
          { target: 'body', text: 'Argent urgent, impossible d\'appeler, « je t\'explique ce soir ».' },
        ],
        explanation: 'C\'est l\'arnaque au faux proche. Appelez l\'ancien numéro de la personne ou posez une question que seul votre vrai proche connaît.',
      },
      en: {
        sender: '+221 78 412 09 41',
        body: 'Mum it\'s me 😔 my phone fell in water, I\'m writing from a friend\'s number. I have a big problem, please send me 50,000 F by Wave it\'s urgent, I\'ll explain tonight 🙏🙏',
        clues: [
          { target: 'banner', text: 'Unknown number, not in your contacts, claiming to be a relative.' },
          { target: 'body', text: 'Urgent money, no way to call, "I\'ll explain tonight".' },
        ],
        explanation: 'This is the fake-relative scam. Call the person\'s old number or ask a question only your real relative would know.',
      },
    },
  },
  {
    id: 'om-received',
    channel: 'sms',
    isScam: false,
    time: '12:03',
    text: {
      fr: {
        sender: 'OrangeMoney',
        body: 'Vous avez recu 15000 FCFA du 77 512 34 12. Nouveau solde: 23450 FCFA. Ref: MP251123.1203.B47201. Orange Money vous remercie.',
        clues: [
          { target: 'body', text: 'Aucun lien, aucun code demandé, aucune action exigée.' },
          { target: 'sender', text: 'Format habituel d\'une notification Orange Money.' },
        ],
        explanation: 'Message légitime. Mais attention à l\'arnaque qui suit souvent : un faux SMS de ce type, puis un appel « je me suis trompé, renvoie-moi l\'argent ». Vérifiez toujours votre vrai solde avec #144#.',
      },
      en: {
        sender: 'OrangeMoney',
        body: 'You have received 15000 FCFA from 77 512 34 12. New balance: 23450 FCFA. Ref: MP251123.1203.B47201. Thank you for using Orange Money.',
        clues: [
          { target: 'body', text: 'No link, no code requested, no action required.' },
          { target: 'sender', text: 'Usual format of an Orange Money notification.' },
        ],
        explanation: 'Legitimate message. But beware the scam that often follows: a fake SMS like this, then a call "I sent it by mistake, send it back". Always check your real balance with #144#.',
      },
    },
  },
  {
    id: 'whatsapp-code-theft',
    channel: 'whatsapp',
    isScam: true,
    time: '16:20',
    avatar: 'C',
    text: {
      fr: {
        sender: 'Cheikh Fall',
        body: 'Salut frère ! Je t\'ai envoyé un code par SMS par erreur, je l\'attendais pour réactiver mon compte. Tu peux me le renvoyer vite stp ? C\'est 6 chiffres 🙏',
        clues: [
          { target: 'body', text: 'Le code reçu sert à connecter VOTRE WhatsApp sur le téléphone du pirate.' },
          { target: 'sender', text: 'Le compte de votre ami est probablement déjà piraté.' },
        ],
        explanation: 'Technique n°1 de vol de comptes WhatsApp. Ne partagez jamais un code reçu par SMS, même avec un proche, et activez la « Validation en deux étapes » dans WhatsApp.',
      },
      en: {
        sender: 'Cheikh Fall',
        body: 'Hey bro! I sent a code to you by SMS by mistake, I was waiting for it to reactivate my account. Can you send it back quickly please? It\'s 6 digits 🙏',
        clues: [
          { target: 'body', text: 'That code logs YOUR WhatsApp into the attacker\'s phone.' },
          { target: 'sender', text: 'Your friend\'s account has probably already been hacked.' },
        ],
        explanation: 'The #1 WhatsApp account-theft technique. Never share a code received by SMS, even with someone close, and turn on WhatsApp "Two-step verification".',
      },
    },
  },
  {
    id: 'senelec-apk',
    channel: 'email',
    isScam: true,
    time: '07:52',
    attachment: 'Facture_Senelec_Nov.apk',
    text: {
      fr: {
        sender: 'SENELEC Service Client',
        senderDetail: 'senelec-facturation@gmail.com',
        subject: 'URGENT : coupure de courant prévue ce soir',
        body: 'Cher(e) client(e),\n\nNous constatons que votre facture du mois de novembre reste impayée. Sans régularisation aujourd\'hui avant 18h, votre compteur sera coupé à distance.\n\nTéléchargez votre facture en pièce jointe pour payer en ligne.\n\nLe Service Recouvrement',
        clues: [
          { target: 'sender', text: 'Une entreprise n\'écrit pas depuis une adresse @gmail.com.' },
          { target: 'attachment', text: '« .apk » est une application Android, pas une facture : elle peut espionner le téléphone.' },
          { target: 'subject', text: 'Menace de coupure le jour même.' },
        ],
        explanation: 'Arnaque dangereuse : le fichier installe un logiciel espion. Une facture est un PDF. Payez uniquement via Woyofal, l\'application officielle ou une agence.',
      },
      en: {
        sender: 'SENELEC Customer Service',
        senderDetail: 'senelec-facturation@gmail.com',
        subject: 'URGENT: power cut scheduled tonight',
        body: 'Dear customer,\n\nYour November bill remains unpaid. Unless you pay today before 6pm, your meter will be cut off remotely.\n\nDownload your bill attached to pay online.\n\nThe Collections Department',
        clues: [
          { target: 'sender', text: 'A company does not write from a @gmail.com address.' },
          { target: 'attachment', text: '".apk" is an Android app, not a bill: it can spy on the phone.' },
          { target: 'subject', text: 'Threat of a same-day power cut.' },
        ],
        explanation: 'Dangerous scam: the file installs spyware. A bill is a PDF. Only pay via Woyofal, the official app or an agency.',
      },
    },
  },
  {
    id: 'facebook-contest',
    channel: 'facebook',
    isScam: true,
    time: '2 h',
    illustration: 'gift',
    text: {
      fr: {
        sender: 'Orange Sénégal Officiel 🎁',
        senderDetail: 'Sponsorisé · 🌍',
        body: '🎉 GRAND JEU 25 ANS 🎉\nPour fêter nos 25 ans, 500 smartphones et 1 000 000 F de crédit à gagner ! Pour participer :\n1️⃣ Aimez la page\n2️⃣ Commentez avec votre numéro\n3️⃣ Validez votre participation ici 👇',
        link: 'orange-sn-25ans.web.app',
        cta: 'Participer',
        stats: '2,4 k J\'aime · 1,8 k commentaires',
        clues: [
          { target: 'sender', text: 'Pas de badge bleu certifié, emoji dans le nom : page imitée, créée récemment.' },
          { target: 'link', text: '« .web.app » est un hébergement gratuit, pas le site officiel de l\'opérateur.' },
          { target: 'body', text: 'Publier votre numéro en commentaire vous expose aux arnaqueurs.' },
        ],
        explanation: 'Les faux concours servent à récolter numéros et identifiants. Un vrai jeu est annoncé sur la page certifiée et ne demande jamais de « valider » sur un autre site.',
      },
      en: {
        sender: 'Orange Sénégal Officiel 🎁',
        senderDetail: 'Sponsored · 🌍',
        body: '🎉 25TH ANNIVERSARY GIVEAWAY 🎉\nTo celebrate 25 years, 500 smartphones and 1,000,000 F of credit to win! To enter:\n1️⃣ Like the page\n2️⃣ Comment with your number\n3️⃣ Confirm your entry here 👇',
        link: 'orange-sn-25ans.web.app',
        cta: 'Enter',
        stats: '2.4K likes · 1.8K comments',
        clues: [
          { target: 'sender', text: 'No blue verified badge, emoji in the name: a recently created copycat page.' },
          { target: 'link', text: '".web.app" is free hosting, not the operator\'s official site.' },
          { target: 'body', text: 'Posting your number in the comments exposes you to scammers.' },
        ],
        explanation: 'Fake giveaways harvest numbers and credentials. A real contest is announced on the verified page and never asks you to "confirm" on another site.',
      },
    },
  },
  {
    id: 'google-alert',
    channel: 'email',
    isScam: false,
    time: '10:31',
    text: {
      fr: {
        sender: 'Google',
        senderDetail: 'no-reply@accounts.google.com',
        subject: 'Alerte de sécurité',
        body: 'Nouvelle connexion sur Windows\n\nNous avons détecté une nouvelle connexion à votre compte Google sur un appareil Windows. Si c\'était vous, vous n\'avez rien à faire. Sinon, nous vous aiderons à sécuriser votre compte.',
        cta: 'Vérifier l\'activité',
        clues: [
          { target: 'sender', text: 'Adresse officielle : @accounts.google.com.' },
          { target: 'body', text: 'Pas de menace, pas d\'urgence, aucun mot de passe demandé.' },
          { target: 'cta', text: 'Bon réflexe malgré tout : vérifiez dans l\'application, pas via le bouton.' },
        ],
        explanation: 'E-mail légitime : Google envoie ce type d\'alerte. Pour vérifier, allez vous-même dans « Compte Google › Sécurité ».',
      },
      en: {
        sender: 'Google',
        senderDetail: 'no-reply@accounts.google.com',
        subject: 'Security alert',
        body: 'New sign-in on Windows\n\nWe noticed a new sign-in to your Google Account on a Windows device. If this was you, you don\'t need to do anything. If not, we\'ll help you secure your account.',
        cta: 'Check activity',
        clues: [
          { target: 'sender', text: 'Official address: @accounts.google.com.' },
          { target: 'body', text: 'No threat, no urgency, no password requested.' },
          { target: 'cta', text: 'Good reflex anyway: check in the app, not through the button.' },
        ],
        explanation: 'Legitimate email: Google sends this kind of alert. To check, go to "Google Account › Security" yourself.',
      },
    },
  },
  {
    id: 'whatsapp-job',
    channel: 'whatsapp',
    isScam: true,
    time: '11:08',
    unknown: true,
    illustration: 'job',
    text: {
      fr: {
        sender: '+225 07 58 21 90 33',
        body: '📢 RECRUTEMENT URGENT 📢\nGrande société internationale recrute 30 agents à Dakar. Travail simple depuis votre téléphone, 2h/jour.\n💰 Salaire : 250 000 F/mois\nPlaces limitées ! Frais de dossier : 10 000 F par Wave pour réserver votre poste. Écrivez « OK » 👇',
        clues: [
          { target: 'body', text: 'Il faut payer pour obtenir un emploi : c\'est toujours une arnaque.' },
          { target: 'banner', text: 'Numéro étranger inconnu, entreprise jamais nommée.' },
          { target: 'body', text: 'Salaire trop beau pour « 2h par jour depuis votre téléphone ».' },
        ],
        explanation: 'Un vrai employeur ne demande jamais d\'argent pour embaucher. Vérifiez toute offre sur le site officiel de l\'entreprise.',
      },
      en: {
        sender: '+225 07 58 21 90 33',
        body: '📢 URGENT RECRUITMENT 📢\nLarge international company hiring 30 agents in Dakar. Simple work from your phone, 2h/day.\n💰 Salary: 250,000 F/month\nLimited spots! Application fee: 10,000 F by Wave to book your position. Reply "OK" 👇',
        clues: [
          { target: 'body', text: 'Paying to get a job: always a scam.' },
          { target: 'banner', text: 'Unknown foreign number, company never named.' },
          { target: 'body', text: 'Salary too good for "2h a day from your phone".' },
        ],
        explanation: 'A real employer never asks for money to hire. Check any offer on the company\'s official website.',
      },
    },
  },
  {
    id: 'wave-otp-legit',
    channel: 'sms',
    isScam: false,
    time: '19:26',
    text: {
      fr: {
        sender: 'Wave',
        body: 'Votre code de connexion Wave est 482913. Ne le communiquez a personne, meme pas a un agent Wave.',
        clues: [
          { target: 'body', text: 'Code envoyé parce que VOUS venez de vous connecter à l\'application.' },
          { target: 'body', text: 'Le message vous rappelle de ne le donner à personne.' },
        ],
        explanation: 'Légitime si c\'est vous qui venez de demander à vous connecter. Si vous n\'avez rien demandé, quelqu\'un essaie d\'entrer sur votre compte : ne donnez jamais ce code, à personne.',
      },
      en: {
        sender: 'Wave',
        body: 'Your Wave login code is 482913. Do not share it with anyone, not even a Wave agent.',
        clues: [
          { target: 'body', text: 'Code sent because YOU just signed in to the app.' },
          { target: 'body', text: 'The message reminds you not to give it to anyone.' },
        ],
        explanation: 'Legitimate if you just asked to sign in. If you didn\'t, someone is trying to get into your account: never give this code to anyone.',
      },
    },
  },
  {
    id: 'messenger-video',
    channel: 'messenger',
    isScam: true,
    time: '23:12',
    avatar: 'A',
    illustration: 'video',
    text: {
      fr: {
        sender: 'Aminata Sow',
        body: 'C toi dans cette vidéo ?? 😱😱',
        link: 'fb-watch-video.click/v=8827',
        clues: [
          { target: 'body', text: 'Message court, choc, inhabituel pour cette amie : son compte est piraté.' },
          { target: 'link', text: 'Le lien mène à une fausse page de connexion Facebook.' },
        ],
        explanation: 'Si vous saisissez votre mot de passe, votre compte envoie à son tour ce message à tous vos amis. Ne cliquez pas ; prévenez votre amie par un autre moyen.',
      },
      en: {
        sender: 'Aminata Sow',
        body: 'Is that u in this video?? 😱😱',
        link: 'fb-watch-video.click/v=8827',
        clues: [
          { target: 'body', text: 'Short, shocking message, unusual for this friend: her account is hacked.' },
          { target: 'link', text: 'The link leads to a fake Facebook login page.' },
        ],
        explanation: 'If you type your password, your account then sends this message to all your friends. Don\'t click; warn your friend another way.',
      },
    },
  },
  {
    id: 'parcel-customs',
    channel: 'sms',
    isScam: true,
    time: '09:40',
    text: {
      fr: {
        sender: '+33 7 56 12 88 04',
        body: 'Votre colis est bloque au centre de tri de Dakar. Des frais de douane de 1500 FCFA sont dus. Reglez sous 48h pour eviter le retour :',
        link: 'http://dhl-sn-livraison.top/pay',
        clues: [
          { target: 'sender', text: 'Numéro étranger (+33) pour un colis « au centre de Dakar ».' },
          { target: 'link', text: 'Adresse en « .top », sans rapport avec le transporteur.' },
          { target: 'body', text: 'Petite somme pour inspirer confiance : le but est votre numéro de carte.' },
        ],
        explanation: 'Vous attendiez un colis ? Vérifiez sur le site officiel du transporteur avec votre numéro de suivi. On ne paie jamais des frais via un lien reçu par SMS.',
      },
      en: {
        sender: '+33 7 56 12 88 04',
        body: 'Your parcel is held at the Dakar sorting centre. Customs fees of 1500 FCFA are due. Pay within 48h to avoid return:',
        link: 'http://dhl-sn-livraison.top/pay',
        clues: [
          { target: 'sender', text: 'Foreign number (+33) for a parcel "at the Dakar centre".' },
          { target: 'link', text: '".top" address, unrelated to the carrier.' },
          { target: 'body', text: 'A small amount to build trust: the goal is your card number.' },
        ],
        explanation: 'Expecting a parcel? Check on the carrier\'s official site with your tracking number. Never pay fees through a link received by SMS.',
      },
    },
  },
  {
    id: 'canal-suspended',
    channel: 'email',
    isScam: true,
    time: '06:15',
    text: {
      fr: {
        sender: 'CANAL+ Afrique',
        senderDetail: 'service@canalplus-abonne-renouvel.com',
        subject: 'Votre abonnement a été suspendu ⚠️',
        body: 'Bonjour,\n\nLe paiement de votre abonnement a échoué. Vos chaînes seront coupées dans 24 heures.\n\nPour éviter l\'interruption, mettez à jour vos informations de paiement (carte bancaire ou Mobile Money).\n\nCordialement,\nL\'équipe CANAL+',
        cta: 'Mettre à jour mon paiement',
        clues: [
          { target: 'sender', text: 'Domaine à rallonge « canalplus-abonne-renouvel.com », pas le site officiel.' },
          { target: 'body', text: '« Bonjour » sans votre nom : message envoyé en masse.' },
          { target: 'cta', text: 'Le bouton mène à un formulaire qui vole vos coordonnées de paiement.' },
        ],
        explanation: 'Pour toute question d\'abonnement, passez par l\'application officielle, votre distributeur ou le service client, jamais par un lien reçu par e-mail.',
      },
      en: {
        sender: 'CANAL+ Afrique',
        senderDetail: 'service@canalplus-abonne-renouvel.com',
        subject: 'Your subscription has been suspended ⚠️',
        body: 'Hello,\n\nYour subscription payment failed. Your channels will be cut in 24 hours.\n\nTo avoid interruption, update your payment details (bank card or Mobile Money).\n\nKind regards,\nThe CANAL+ team',
        cta: 'Update my payment',
        clues: [
          { target: 'sender', text: 'Long-winded domain "canalplus-abonne-renouvel.com", not the official site.' },
          { target: 'body', text: '"Hello" without your name: a mass-mailed message.' },
          { target: 'cta', text: 'The button leads to a form that steals your payment details.' },
        ],
        explanation: 'For any subscription question, use the official app, your dealer or customer service, never a link received by email.',
      },
    },
  },
  {
    id: 'forfait-legit',
    channel: 'sms',
    isScam: false,
    time: '18:00',
    text: {
      fr: {
        sender: 'Orange',
        body: 'Cher client, votre pass Internet 5Go expire demain a 23h59. Pour le renouveler, composez #1234# ou rendez-vous dans l\'application Orange et Moi.',
        clues: [
          { target: 'body', text: 'Aucun lien : on vous renvoie vers un code USSD et l\'application officielle.' },
          { target: 'body', text: 'Simple information, rien à payer à un tiers.' },
        ],
        explanation: 'Message d\'information légitime. Le bon réflexe est exactement celui proposé : passer par les canaux officiels que vous connaissez déjà.',
      },
      en: {
        sender: 'Orange',
        body: 'Dear customer, your 5GB internet pass expires tomorrow at 23:59. To renew it, dial #1234# or go to the Orange et Moi app.',
        clues: [
          { target: 'body', text: 'No link: you are pointed to a USSD code and the official app.' },
          { target: 'body', text: 'Plain information, nothing to pay to a third party.' },
        ],
        explanation: 'Legitimate information message. The right reflex is exactly the one suggested: use the official channels you already know.',
      },
    },
  },
  {
    id: 'whatsapp-crypto',
    channel: 'whatsapp',
    isScam: true,
    time: '14:55',
    unknown: true,
    illustration: 'crypto',
    text: {
      fr: {
        sender: 'Coach Moussa Invest 💹',
        body: 'Bonjour 👋 Vous avez été ajouté(e) à notre groupe VIP. Avec seulement 25 000 F, notre robot de trading double votre argent en 48h GARANTI ✅\nDes centaines de Sénégalais gagnent déjà ! Voici les preuves 👇\nEnvoyez votre dépôt par Wave pour commencer.',
        clues: [
          { target: 'body', text: '« Doubler votre argent en 48 h, garanti » : aucun placement réel ne promet cela.' },
          { target: 'body', text: '« Preuves » faciles à truquer et pression du groupe.' },
          { target: 'banner', text: 'Inconnu qui vous a ajouté sans votre accord.' },
        ],
        explanation: 'C\'est une pyramide (Ponzi) : les premiers « gains » sont payés avec l\'argent des nouveaux, puis tout disparaît. Quittez le groupe et signalez-le.',
      },
      en: {
        sender: 'Coach Moussa Invest 💹',
        body: 'Hello 👋 You have been added to our VIP group. With only 25,000 F, our trading robot doubles your money in 48h GUARANTEED ✅\nHundreds of Senegalese are already earning! Here is the proof 👇\nSend your deposit by Wave to start.',
        clues: [
          { target: 'body', text: '"Double your money in 48h, guaranteed": no real investment promises that.' },
          { target: 'body', text: '"Proof" that is easy to fake, and group pressure.' },
          { target: 'banner', text: 'A stranger added you without your consent.' },
        ],
        explanation: 'It is a pyramid (Ponzi) scheme: early "gains" are paid with newcomers\' money, then everything vanishes. Leave the group and report it.',
      },
    },
  },
  {
    id: 'marketplace-deposit',
    channel: 'messenger',
    isScam: true,
    time: '17:34',
    avatar: 'K',
    illustration: 'phone',
    text: {
      fr: {
        sender: 'Khadim Diallo',
        senderDetail: 'Marketplace · iPhone 15 Pro',
        price: 'iPhone 15 Pro 256 Go — 150 000 F',
        body: 'Oui il est toujours dispo frère, neuf sous blister 👌 Beaucoup de gens sont intéressés. Envoie 30 000 F d\'acompte par Wave pour que je te le réserve, je suis à Thiès je te l\'envoie demain par Yango.',
        clues: [
          { target: 'price', text: 'Prix 4 à 5 fois sous le marché pour un téléphone neuf.' },
          { target: 'body', text: 'Acompte exigé avant de voir l\'objet, et pression « beaucoup d\'intéressés ».' },
          { target: 'body', text: 'Refus implicite de se rencontrer : envoi « demain » par un tiers.' },
        ],
        explanation: 'Sur Marketplace, ne payez jamais avant d\'avoir vu et testé l\'article, de préférence dans un lieu public. Un prix trop beau est un piège.',
      },
      en: {
        sender: 'Khadim Diallo',
        senderDetail: 'Marketplace · iPhone 15 Pro',
        price: 'iPhone 15 Pro 256GB — 150,000 F',
        body: 'Yes it\'s still available bro, brand new sealed 👌 Lots of people are interested. Send 30,000 F deposit by Wave so I can reserve it for you, I\'m in Thiès I\'ll send it tomorrow by Yango.',
        clues: [
          { target: 'price', text: 'Price 4 to 5 times below market for a new phone.' },
          { target: 'body', text: 'Deposit required before seeing the item, plus "lots of people interested" pressure.' },
          { target: 'body', text: 'Implicit refusal to meet: shipped "tomorrow" through a third party.' },
        ],
        explanation: 'On Marketplace, never pay before you have seen and tested the item, ideally in a public place. A too-good price is a trap.',
      },
    },
  },
  {
    id: 'facebook-security-legit',
    channel: 'email',
    isScam: false,
    time: '22:05',
    text: {
      fr: {
        sender: 'Facebook',
        senderDetail: 'security@facebookmail.com',
        subject: 'Nouvelle connexion à votre compte',
        body: 'Bonjour Fatou,\n\nNous avons remarqué une nouvelle connexion à votre compte depuis un appareil Android près de Dakar, Sénégal.\n\nSi c\'était vous, vous pouvez ignorer ce message. Sinon, sécurisez votre compte depuis les paramètres de l\'application.',
        clues: [
          { target: 'sender', text: '« facebookmail.com » est bien le domaine officiel d\'envoi de Facebook.' },
          { target: 'body', text: 'Le message vous appelle par votre prénom et ne demande aucun mot de passe.' },
          { target: 'body', text: 'Il vous renvoie vers l\'application, pas vers un lien de connexion.' },
        ],
        explanation: 'Légitime. En cas de doute, ouvrez l\'application Facebook : Paramètres › Sécurité et connexion montre toutes les connexions récentes.',
      },
      en: {
        sender: 'Facebook',
        senderDetail: 'security@facebookmail.com',
        subject: 'New login to your account',
        body: 'Hi Fatou,\n\nWe noticed a new login to your account from an Android device near Dakar, Senegal.\n\nIf this was you, you can ignore this message. If not, secure your account from the app settings.',
        clues: [
          { target: 'sender', text: '"facebookmail.com" is indeed Facebook\'s official sending domain.' },
          { target: 'body', text: 'It uses your first name and asks for no password.' },
          { target: 'body', text: 'It points you to the app, not to a login link.' },
        ],
        explanation: 'Legitimate. When in doubt, open the Facebook app: Settings › Security and login shows every recent login.',
      },
    },
  },
  {
    id: 'whatsapp-lottery',
    channel: 'whatsapp',
    isScam: true,
    time: '13:21',
    unknown: true,
    illustration: 'gift',
    text: {
      fr: {
        sender: 'Promo Anniversaire 🎉',
        body: 'Félicitation !! Votre numéro a été tiré au sort et gagne 1 000 000 FCFA lors du tirage anniversaire de votre opérateur 🥳\nPour recevoir votre gain, envoyez 5 000 F de frais de dossier au 76 344 21 09 puis la capture du transfert.',
        clues: [
          { target: 'body', text: 'Vous n\'avez participé à aucun jeu.' },
          { target: 'body', text: 'Payer pour recevoir un gain : toujours une arnaque.' },
          { target: 'banner', text: 'Paiement vers un numéro personnel inconnu, pas vers l\'opérateur.' },
        ],
        explanation: 'Arnaque aux « frais de dossier ». Un vrai gain ne demande jamais de payer d\'abord. Bloquez et signalez le numéro.',
      },
      en: {
        sender: 'Anniversary Promo 🎉',
        body: 'Congratulation!! Your number was drawn and wins 1,000,000 FCFA in your operator\'s anniversary draw 🥳\nTo receive your prize, send 5,000 F processing fees to 76 344 21 09 then a screenshot of the transfer.',
        clues: [
          { target: 'body', text: 'You did not enter any contest.' },
          { target: 'body', text: 'Paying to receive a prize: always a scam.' },
          { target: 'banner', text: 'Payment to an unknown personal number, not to the operator.' },
        ],
        explanation: '"Processing fee" scam. A real prize never asks you to pay first. Block and report the number.',
      },
    },
  },
  {
    id: 'whatsapp-account-deletion',
    channel: 'whatsapp',
    isScam: true,
    time: '10:02',
    unknown: true,
    text: {
      fr: {
        sender: 'WhatsApp Support ✅',
        body: '⚠️ AVIS IMPORTANT ⚠️\nVotre compte WhatsApp sera désactivé dans 24h pour non-vérification. Pour conserver vos conversations, vérifiez votre compte maintenant :',
        link: 'whatsapp-verify-account.online',
        clues: [
          { target: 'sender', text: 'WhatsApp ne vous écrit jamais depuis un numéro de discussion ordinaire, même avec un ✅ dans le nom.' },
          { target: 'link', text: 'Domaine « .online » qui imite WhatsApp.' },
          { target: 'body', text: 'Menace de suppression sous 24 h pour vous faire agir vite.' },
        ],
        explanation: 'WhatsApp n\'envoie pas ce type d\'avis par message. Ne cliquez pas, bloquez le numéro et signalez-le depuis la conversation.',
      },
      en: {
        sender: 'WhatsApp Support ✅',
        body: '⚠️ IMPORTANT NOTICE ⚠️\nYour WhatsApp account will be deactivated in 24h for non-verification. To keep your chats, verify your account now:',
        link: 'whatsapp-verify-account.online',
        clues: [
          { target: 'sender', text: 'WhatsApp never writes to you from an ordinary chat number, even with a ✅ in the name.' },
          { target: 'link', text: '".online" domain imitating WhatsApp.' },
          { target: 'body', text: 'Threat of deletion within 24h to make you act fast.' },
        ],
        explanation: 'WhatsApp does not send this kind of notice by message. Don\'t click, block the number and report it from the chat.',
      },
    },
  },
];

export const SCENARIO_COUNT = SCENARIOS.length;

export function phishingScenarios(lang: Lang): PhishingScenario[] {
  return SCENARIOS.map(({ text, ...base }) => ({ ...base, ...text[lang] }));
}
