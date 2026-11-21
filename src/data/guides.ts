export interface GuideSection {
  heading?: string;
  body?: string[];
  list?: string[];
}

export interface Guide {
  slug: string;
  icon: string; // key into icon map in UI
  title: string;
  intro: string;
  minutes: number;
  level: 'débutant' | 'intermédiaire';
  sections: GuideSection[];
}

export const GUIDES: Record<'fr' | 'en', Guide[]> = {
  fr: [
    {
      slug: 'hameconnage',
      icon: 'phish',
      title: 'Hameçonnage : ne mordez pas à l\'hameçon',
      intro:
        'L\'hameçonnage (phishing) est l\'arnaque la plus répandue : un message vous pousse à cliquer sur un lien ou à donner vos codes. Voici comment le repérer en 10 secondes.',
      minutes: 6,
      level: 'débutant',
      sections: [
        {
          heading: 'C\'est quoi, concrètement ?',
          body: [
            'Un arnaqueur se fait passer pour une banque, Wave, Orange Money, la SONATEL, les impôts, un ami ou même la police. Il vous envoie un SMS, un message WhatsApp ou un appel qui vous presse : « votre compte sera bloqué », « vous avez gagné un prix », « un colis est en attente ». Le but : vous faire cliquer sur un faux site ou donner un code reçu par SMS.',
            'Le vrai site de votre banque ressemble au faux… à une lettre près. C\'est toute la ruse.',
          ],
        },
        {
          heading: 'Les 5 signes qui doivent vous alerter',
          list: [
            'Urgence : « agissez maintenant », « votre compte sera suspendu dans 24h ». Personne de sérieux ne vous menace.',
            'Un lien raccourci (bit.ly, t.co…) ou une adresse bizarre au lieu de wave.com ou orange.sn.',
            'On vous demande un code reçu par SMS, votre mot de passe ou votre code PIN Mobile Money.',
            'Le message contient des fautes d\'orthographe ou un français approximatif.',
            'La demande vient d\'un numéro inconnu qui se fait passer pour une administration.',
          ],
        },
        {
          heading: 'La règle d\'or',
          body: [
            'Ne cliquez jamais sur un lien reçu par message pour vous connecter à votre banque ou à Mobile Money. Ouvrez toujours l\'application officielle vous-même, ou tapez vous-même l\'adresse officielle dans votre navigateur.',
            'Si le doute persiste, appelez le numéro officiel de votre opérateur ou de votre banque — celui qui figure sur votre carte ou dans l\'application, pas celui du message.',
          ],
        },
        {
          heading: 'Et si vous avez cliqué ?',
          body: [
            'Si vous avez donné un code PIN ou un code reçu par SMS : appelez immédiatement votre opérateur (Wave, Orange Money) et votre banque pour faire bloquer la transaction. Plus vous attendez, plus l\'argent part vite.',
            'Si vous avez juste ouvert un lien sans rien saisir : fermez, supprimez le message, bloquez l\'expéditeur. Changez votre mot de passe par précaution si vous l\'avez tapé sur la page.',
          ],
        },
        {
          heading: 'Rappelez-vous',
          body: [
            'Les institutions sénégalaises et les opérateurs ne demandent jamais vos codes secrets par message ou appel. Un message qui crée la panique est presque toujours une arnaque. Partagez ce réflexe autour de vous : les personnes âgées et les enfants sont les premières cibles.',
          ],
        },
      ],
    },
    {
      slug: 'mobile-money',
      icon: 'money',
      title: 'Wave, Orange Money : les arnaques qui visent votre portefeuille',
      intro:
        'Le Mobile Money est partout au Sénégal — et c\'est aussi la cible favorite des fraudeurs. Apprenez les pièges classiques et les réflexes qui protègent votre argent.',
      minutes: 7,
      level: 'débutant',
      sections: [
        {
          heading: 'Les arnaques les plus courantes',
          list: [
            'Fausse offre d\'emploi ou de gain : on vous demande de payer des « frais » ou de recevoir un paiement pour « vérifier » votre compte.',
            'Fausse confirmation de paiement : un inconnu dit avoir payé votre achat et vous envoie un faux SMS ou une fausse capture d\'écran. Vérifiez dans l\'application, jamais sur la capture.',
            'Le « agent » qui vous demande votre code PIN pour « débloquer » une transaction ou créditer votre compte.',
            'L\'usurpation de numéro : le fraudeur vous appelle depuis un numéro qui ressemble au service client officiel.',
          ],
        },
        {
          heading: 'Vos 4 réflexes indispensables',
          list: [
            'Ne donnez JAMAIS votre code PIN Mobile Money, même à un « agent », un « technicien » ou quelqu\'un qui dit être de Wave/Orange.',
            'Pour tout paiement ou vérification, ouvrez l\'application officielle — pas le lien reçu par message.',
            'Méfiez-vous des captures d\'écran : elles se falsifient en 30 secondes.',
            'Activez les notifications de transaction et surveillez votre solde régulièrement.',
          ],
        },
        {
          heading: 'Numéro perdu ou SIM volée ?',
          body: [
            'Contactez immédiatement votre opérateur pour faire bloquer la ligne et désactiver le Mobile Money. Un numéro volé peut servir à vider votre compte via des transferts ou des réinitialisations de mot de passe.',
            'Pensez aussi à faire bloquer votre carte SIM chez l\'opérateur et à garder une preuve (numéro IMEI, date d\'achat) pour le dépôt de plainte.',
          ],
        },
        {
          heading: 'En cas d\'arnaque réussie',
          body: [
            'Composez le *144# (ou le code service de votre opérateur) pour signaler et tenter d\'interrompre la transaction. Déposez ensuite plainte au commissariat le plus proche — les opérateurs et la police traitent ces dossiers.',
            'Plus vous signalez vite, plus il y a de chances de récupérer une partie de l\'argent.',
          ],
        },
      ],
    },
    {
      slug: 'mots-de-passe',
      icon: 'key',
      title: 'Mots de passe et double vérification : les bases qui protègent tout',
      intro:
        'Un bon mot de passe est la première porte de votre vie numérique. Voici la méthode simple qui marche, sans outil compliqué.',
      minutes: 5,
      level: 'débutant',
      sections: [
        {
          heading: 'La méthode « phrase + transformation »',
          body: [
            'Oubliez les mots du dictionnaire. Prenez une phrase que vous seul connaissez — par exemple une parole de votre langue, une devise, un souvenir — et transformez-la : « Ndem bu rafet » devient « NdemBuRafet!2026# ». Longueur (12+ caractères), majuscules, chiffres, symbole : votre mot de passe devient quasi-incassable.',
            'Important : un mot de passe différent pour chaque compte important (WhatsApp, Facebook, Wave, email, banque). Si l\'un fuit, les autres restent en sécurité.',
          ],
        },
        {
          heading: 'Le gestionnaire de mots de passe',
          body: [
            'Se souvenir de 20 mots de passe forts est impossible — c\'est normal. Une application gratuite comme Bitwarden ou Proton Pass garde tous vos mots de passe chiffrés et les remplit automatiquement. Vous ne retenez qu\'un seul mot de passe maître.',
            'C\'est l\'outil le plus simple pour passer au niveau au-dessus sans y passer vos journées.',
          ],
        },
        {
          heading: 'Activez la double vérification (2FA)',
          body: [
            'La 2FA ajoute une étape : même si quelqu\'un connaît votre mot de passe, il lui faut aussi votre téléphone. Activez-la partout où c\'est proposé : WhatsApp (Paramètres → Compte → Validation en deux étapes), Facebook, Google, et si possible votre compte Mobile Money.',
            'Préférez l\'application d\'authentification (Google Authenticator, Aegis) aux SMS quand c\'est possible — le SMS peut être intercepté par une SIM volée.',
          ],
        },
        {
          heading: 'Les réflexes à bannir',
          list: [
            'Écrire vos mots de passe sur un papier collé à l\'ordinateur ou dans vos notes téléphone non verrouillées.',
            'Utiliser la même date de naissance ou le même mot de passe partout.',
            'Envoyer votre mot de passe à quelqu\'un « pour vous aider » — aucune personne sérieuse ne le demandera jamais.',
            'Ignorer les notifications « votre mot de passe a été trouvé dans une fuite » : changez-le immédiatement.',
          ],
        },
      ],
    },
    {
      slug: 'reseaux-sociaux',
      icon: 'share',
      title: 'Réseaux sociaux : ce que vous exposez sans le savoir',
      intro:
        'WhatsApp, Facebook, TikTok, Instagram : vos données personnelles y valent de l\'or. Quelques réglages simples réduisent considérablement ce que vous partagez.',
      minutes: 6,
      level: 'débutant',
      sections: [
        {
          heading: 'Ce que les arnaqueurs vous volent',
          body: [
            'Vos photos de famille, vos habitudes, vos lieux, votre date de naissance, le nom de votre banque… Tout cela sert à vous cibler : faux appels « de votre banque », messages personnalisés, usurpation d\'identité. Plus vous publiez, plus vous êtes facile à imiter.',
          ],
        },
        {
          heading: 'Réglages à faire aujourd\'hui',
          list: [
            'WhatsApp : activez la validation en deux étapes et limitez qui voit votre photo de profil et votre statut (« Mes contacts »).',
            'Facebook : passez votre profil en « Amis uniquement » et désactivez la localisation automatique des publications.',
            'Instagram/TikTok : passez le compte en privé si vous n\'avez pas besoin d\'audience publique, surtout pour les enfants.',
            'Tous : refusez les applications qui demandent accès à vos contacts, photos et localisation sans raison claire.',
          ],
        },
        {
          heading: 'Faux profils et usurpation',
          body: [
            'Un « ami » ou un « parent » qui vous écrit depuis un nouveau numéro peut être un fraudeur. Vérifiez par un appel sur l\'ancien numéro avant d\'envoyer quoi que ce soit — surtout de l\'argent.',
            'Sur Facebook et WhatsApp, signalez et bloquez les profils qui vous imitent. C\'est gratuit et ça protège vos vrais contacts.',
          ],
        },
        {
          heading: 'Partagez moins, vivez mieux',
          body: [
            'Demandez-vous avant chaque publication : « est-ce que ça peut servir à me voler ou à me manipuler ? ». Vos données personnelles appartiennent à la loi sénégalaise (loi n° 2008-12) — et elles vous appartiennent.',
          ],
        },
      ],
    },
    {
      slug: 'telephone-appareil',
      icon: 'phone',
      title: 'Téléphone : verrouiller, mettre à jour, protéger',
      intro:
        'Votre smartphone contient votre identité, vos photos, vos conversations et vos comptes. Trois réflexes suffisent à le protéger.',
      minutes: 5,
      level: 'débutant',
      sections: [
        {
          heading: 'Verrouillez votre appareil',
          body: [
            'Un code PIN, un schéma ou l\'empreinte digitale : sans verrouillage, quiconque trouve votre téléphone a accès à WhatsApp, à vos photos et à vos comptes Mobile Money. C\'est la première ligne de défense, et elle prend 30 secondes à activer.',
            'Activez aussi le « effacement après X tentatives » quand votre téléphone le propose.',
          ],
        },
        {
          heading: 'Mettez à jour, toujours',
          body: [
            'Les mises à jour corrigent des failles de sécurité que les fraudeurs exploitent. Activez les mises à jour automatiques pour Android/iOS et pour vos applications importantes (WhatsApp, banque, Mobile Money). Un téléphone qui n\'a pas été mis à jour depuis un an est une porte ouverte.',
          ],
        },
        {
          heading: 'Applications : regardez avant d\'installer',
          list: [
            'N\'installez que depuis le Play Store ou l\'App Store officiel — jamais via un lien reçu par message.',
            'Méfiez-vous des applications qui demandent plus d\'accès que nécessaire (une lampe torche n\'a pas besoin de vos SMS).',
            'Désinstallez les applications que vous n\'utilisez plus : elles continuent de collecter vos données.',
            'Ne « rooter » ou « jailbreaker » pas votre téléphone : vous désactivez ses protections.',
          ],
        },
        {
          heading: 'Perdu ou volé ?',
          body: [
            'Android : utilisez « Localiser mon appareil » (Google) pour localiser, faire sonner ou effacer à distance. iPhone : « Localiser » via iCloud. Changez vos mots de passe importants et faites bloquer votre SIM auprès de l\'opérateur.',
            'Déposez plainte au commissariat — le procès-verbal peut être exigé par votre assurance ou l\'opérateur.',
          ],
        },
      ],
    },
    {
      slug: 'wifi-public',
      icon: 'wifi',
      title: 'Wi-Fi public : pratique, mais pas sans précautions',
      intro:
        'Réseaux de cafés, aéroports, universités : le Wi-Fi gratuit est une faille courante. Voici comment l\'utiliser sans offrir vos données aux curieux.',
      minutes: 4,
      level: 'débutant',
      sections: [
        {
          heading: 'Le risque en une image',
          body: [
            'Sur un Wi-Fi public non chiffré, tout ce qui circule peut être intercepté : mots de passe, photos, messages. Un faux réseau « Free_WiFi_Aéroport » monté par un arnaqueur capte tout ce que vous envoyez.',
          ],
        },
        {
          heading: 'La règle simple',
          body: [
            'Réservez le Wi-Fi public à la navigation légère (lire, chercher). Pour tout ce qui touche à l\'argent, aux mots de passe ou aux données sensibles : utilisez vos données mobiles (3G/4G), qui sont chiffrées par votre opérateur.',
            'Vérifiez que le site commence par « https:// » et affiche le cadenas avant de vous connecter ou de payer.',
          ],
        },
        {
          heading: 'Réflexes pratiques',
          list: [
            'Désactivez le partage de fichiers (AirDrop, partage en réseau) sur les réseaux publics.',
            'Oubliez les réseaux Wi-Fi publics après usage pour ne pas vous y reconnecter automatiquement.',
            'Évitez les sites bancaires et Mobile Money sur Wi-Fi public — préférez la 4G.',
            'Si votre téléphone propose un VPN, activez-le sur les réseaux publics.',
          ],
        },
      ],
    },
    {
      slug: 'enfants-en-ligne',
      icon: 'child',
      title: 'Enfants et adolescents : les protéger en ligne',
      intro:
        'Les jeunes Sénégalais sont connectés de plus en plus tôt. Quelques règles simples protègent vos enfants des arnaques, des prédateurs et des mauvaises rencontres.',
      minutes: 7,
      level: 'débutant',
      sections: [
        {
          heading: 'Les dangers réels',
          body: [
            'Hameçonnage qui cible les ados («Skin pour ton compte Free Fire », « gagne de l\'argent facile »), contacts dangereux sur les réseaux, cyberharcèlement, et applications qui collectent les données des mineurs sans leur consentement éclairé.',
          ],
        },
        {
          heading: 'Parler, plutôt que surveiller',
          body: [
            'Le meilleur outil reste la conversation : expliquez à vos enfants qu\'un inconnu qui demande de l\'argent ou des photos n\'est jamais un ami. Dites-leur de venir vous voir IMMÉDIATEMENT si quelque chose les met mal à l\'aise — sans crainte d\'être grondés.',
          ],
        },
        {
          heading: 'Réglages techniques utiles',
          list: [
            'WhatsApp/Instagram/TikTok : passez les comptes des enfants en privé et limitez les contacts.',
            'Utilisez le contrôle parental de votre téléphone (Google Family Link, Temps d\'écran iOS) pour limiter le temps et les applications.',
            'Gardez le téléphone dans un espace commun le soir — pas dans la chambre.',
            'Apprenez à vos enfants à ne jamais donner nom, adresse, école ou photo en privé à un inconnu.',
          ],
        },
        {
          heading: 'En cas de problème',
          body: [
            'Conservez les captures d\'écran comme preuve. Signalez les contenus abusifs via les outils de signalement des plateformes et, si nécessaire, au commissariat cyber (ou à la division concernée de la police). Pour les données personnelles des enfants, la CDP peut être saisie.',
          ],
        },
      ],
    },
    {
      slug: 'infox-faux-profils',
      icon: 'news',
      title: 'Rumeurs, faux profils et fausses nouvelles',
      intro:
        'Une rumeur WhatsApp peut coûter cher — à vous comme à vos proches. Apprenez à vérifier avant de croire et avant de relayer.',
      minutes: 5,
      level: 'débutant',
      sections: [
        {
          heading: 'Pourquoi ça marche si bien',
          body: [
            'Les messages alarmistes se partagent vite : « votre compte WhatsApp va être supprimé », « le gouvernement offre de l\'argent », « ceci est une arnaque » (lui-même souvent faux). Les fraudeurs s\'habillent parfois en « lanceurs d\'alerte ».',
          ],
        },
        {
          heading: 'Vérifier en 3 questions',
          list: [
            'Qui envoie ? Un inconnu, un groupe de discussion ou un « contact » dont le numéro a changé ? Méfiance.',
            'Où est la source ? Une vraie information cite un média ou un site officiel — pas « on m\'a dit ».',
            'Est-ce trop beau, trop grave ou trop urgent ? C\'est probablement faux.',
          ],
        },
        {
          heading: 'Ne relayez pas l\'arnaque',
          body: [
            'Avant de transférer un message « pour alerter », vérifiez-le : vous pourriez diffuser vous-même une arnaque à tout votre entourage. Le réflexe « je vérifie d\'abord » protège votre famille entière.',
            'En cas de doute sur une information officielle (impôts, santé, sécurité), consultez le site officiel de l\'institution ou appelez-la directement.',
          ],
        },
      ],
    },
    {
      slug: 'que-faire-urgence',
      icon: 'alert',
      title: 'Vous pensez avoir été piraté ou arnaqué : que faire ?',
      intro:
        'Panique = mauvais réflexes. Voici le bon ordre des actions, minute par minute, pour limiter les dégâts.',
      minutes: 5,
      level: 'débutant',
      sections: [
        {
          heading: 'Dans les 10 premières minutes',
          list: [
            'Coupez la connexion : mettez le téléphone en mode avion ou désactivez les données mobiles.',
            'Appelez votre opérateur (Orange, Free, Expresso) pour bloquer votre ligne si votre numéro est compromis.',
            'Appelez votre banque ou votre service Mobile Money pour suspendre les transactions.',
            'Changez vos mots de passe depuis un AUTRE appareil sain (ordinateur ou téléphone d\'un proche).',
          ],
        },
        {
          heading: 'Ensuite',
          body: [
            'Déconnectez les appareils suspects : WhatsApp (Appareils connectés), Facebook (Sessions actives), Google (appareils connectés). Vérifiez aussi les applications autorisées sur votre compte.',
            'Faites une sauvegarde de vos photos et documents importants sur un autre appareil ou un disque dur externe.',
            'Notez tout : numéros, captures d\'écran, dates — ces preuves serviront pour la plainte.',
          ],
        },
        {
          heading: 'Déposer plainte et se faire aider',
          body: [
            'Déposez plainte au commissariat le plus proche ou à la brigade de cybercriminalité. Le procès-verbal est indispensable pour votre opérateur, votre banque ou votre assurance.',
            'Pour les données personnelles, vous pouvez saisir la CDP (Commission de Protection des Données Personnelles) — voir la section « Vos droits ».',
          ],
        },
      ],
    },
  ],

  en: [
    {
      slug: 'hameconnage',
      icon: 'phish',
      title: 'Phishing: don\'t bite the hook',
      intro:
        'Phishing is the most common scam: a message pushes you to click a link or hand over your codes. Here is how to spot it in 10 seconds.',
      minutes: 6,
      level: 'débutant',
      sections: [
        {
          heading: 'What it actually is',
          body: [
            'A scammer pretends to be your bank, Wave, Orange Money, SONATEL, the tax office, a friend, or even the police. They send an SMS, WhatsApp message or call that pressures you: "your account will be blocked", "you won a prize", "a parcel is waiting". The goal: make you click a fake site or give up a code sent by SMS.',
            'The real bank website looks like the fake one… except for one letter. That is the whole trick.',
          ],
        },
        {
          heading: 'The 5 warning signs',
          list: [
            'Urgency: "act now", "your account will be suspended within 24h". No serious organisation threatens you.',
            'A shortened link (bit.ly, t.co…) or a strange address instead of wave.com or orange.sn.',
            'They ask for a code received by SMS, your password, or your Mobile Money PIN.',
            'The message contains spelling mistakes or rough language.',
            'The request comes from an unknown number impersonating an administration.',
          ],
        },
        {
          heading: 'The golden rule',
          body: [
            'Never click a link received by message to log in to your bank or Mobile Money. Always open the official app yourself, or type the official address in your browser.',
            'If in doubt, call the official number of your operator or bank — the one on your card or in the app, not the one in the message.',
          ],
        },
        {
          heading: 'What if you already clicked?',
          body: [
            'If you gave a PIN or an SMS code: call your operator (Wave, Orange Money) and your bank immediately to block the transaction. The faster you act, the better your chances.',
            'If you only opened a link without entering anything: close it, delete the message, block the sender. Change your password as a precaution if you typed it on the page.',
          ],
        },
        {
          heading: 'Remember',
          body: [
            'Senegalese institutions and operators never ask for your secret codes by message or call. A message that creates panic is almost always a scam. Share this reflex: elderly people and children are the first targets.',
          ],
        },
      ],
    },
    {
      slug: 'mobile-money',
      icon: 'money',
      title: 'Wave, Orange Money: scams that target your wallet',
      intro:
        'Mobile Money is everywhere in Senegal — and it is also fraudsters\' favourite target. Learn the classic traps and the reflexes that protect your money.',
      minutes: 7,
      level: 'débutant',
      sections: [
        {
          heading: 'The most common scams',
          list: [
            'Fake job or winnings offer: you are asked to pay "fees" or receive a payment to "verify" your account.',
            'Fake payment confirmation: a stranger says they paid for your purchase and sends a fake SMS or screenshot. Check inside the app, never the screenshot.',
            'The "agent" who asks for your PIN to "unlock" a transaction or top up your account.',
            'Number spoofing: the fraudster calls from a number that looks like official customer service.',
          ],
        },
        {
          heading: 'Your 4 essential reflexes',
          list: [
            'NEVER give your Mobile Money PIN, even to an "agent", a "technician" or someone claiming to be from Wave/Orange.',
            'For any payment or check, open the official app — not the link received by message.',
            'Beware of screenshots: they can be faked in 30 seconds.',
            'Turn on transaction notifications and check your balance regularly.',
          ],
        },
        {
          heading: 'Lost number or stolen SIM?',
          body: [
            'Contact your operator immediately to block the line and disable Mobile Money. A stolen number can be used to empty your account via transfers or password resets.',
            'Also ask the operator to block your SIM card and keep proof (IMEI number, purchase date) for your police report.',
          ],
        },
        {
          heading: 'If you fell for a scam',
          body: [
            'Dial *144# (or your operator\'s service code) to report and try to interrupt the transaction. Then file a complaint at the nearest police station — operators and police handle these cases.',
            'The faster you report, the better your chances of recovering part of the money.',
          ],
        },
      ],
    },
    {
      slug: 'mots-de-passe',
      icon: 'key',
      title: 'Passwords and two-factor: the basics that protect everything',
      intro:
        'A good password is the first door of your digital life. Here is the simple method that works, no complicated tools needed.',
      minutes: 5,
      level: 'débutant',
      sections: [
        {
          heading: 'The "phrase + transform" method',
          body: [
            'Forget dictionary words. Take a sentence only you know — a saying, a motto, a memory — and transform it: "Ndem bu rafet" becomes "NdemBuRafet!2026#". Length (12+ characters), capitals, digits, symbol: your password becomes nearly unbreakable.',
            'Important: a different password for each important account (WhatsApp, Facebook, Wave, email, bank). If one leaks, the others stay safe.',
          ],
        },
        {
          heading: 'Password managers',
          body: [
            'Remembering 20 strong passwords is impossible — that is normal. A free app like Bitwarden or Proton Pass keeps all your passwords encrypted and fills them automatically. You only remember one master password.',
            'It is the simplest way to level up without spending your days on it.',
          ],
        },
        {
          heading: 'Turn on two-factor authentication (2FA)',
          body: [
            '2FA adds a step: even if someone knows your password, they also need your phone. Enable it everywhere it is offered: WhatsApp (Settings → Account → Two-step verification), Facebook, Google, and if possible your Mobile Money account.',
            'Prefer an authenticator app (Google Authenticator, Aegis) over SMS when possible — SMS can be intercepted via a stolen SIM.',
          ],
        },
        {
          heading: 'Reflexes to drop',
          list: [
            'Writing passwords on paper stuck to the computer or in unlocked phone notes.',
            'Using the same birth date or the same password everywhere.',
            'Sending your password to someone "to help you" — no serious person will ever ask for it.',
            'Ignoring "your password was found in a leak" alerts: change it immediately.',
          ],
        },
      ],
    },
    {
      slug: 'reseaux-sociaux',
      icon: 'share',
      title: 'Social media: what you expose without knowing',
      intro:
        'WhatsApp, Facebook, TikTok, Instagram: your personal data is worth gold there. A few simple settings drastically reduce what you share.',
      minutes: 6,
      level: 'débutant',
      sections: [
        {
          heading: 'What scammers steal from you',
          body: [
            'Your family photos, your habits, your locations, your birth date, your bank name… All of this helps target you: fake calls "from your bank", personalised messages, identity theft. The more you post, the easier you are to impersonate.',
          ],
        },
        {
          heading: 'Settings to change today',
          list: [
            'WhatsApp: enable two-step verification and limit who sees your profile photo and status ("My contacts").',
            'Facebook: set your profile to "Friends only" and turn off automatic location on posts.',
            'Instagram/TikTok: switch to a private account if you do not need a public audience, especially for children.',
            'All apps: refuse access to your contacts, photos and location when there is no clear reason.',
          ],
        },
        {
          heading: 'Fake profiles and impersonation',
          body: [
            'A "friend" or "relative" writing from a new number could be a fraudster. Verify by calling the old number before sending anything — especially money.',
            'On Facebook and WhatsApp, report and block profiles impersonating you. It is free and protects your real contacts.',
          ],
        },
        {
          heading: 'Share less, live better',
          body: [
            'Before every post ask yourself: "could this help someone steal from or manipulate me?". Your personal data is protected by Senegalese law (Act No. 2008-12) — and it belongs to you.',
          ],
        },
      ],
    },
    {
      slug: 'telephone-appareil',
      icon: 'phone',
      title: 'Phone: lock it, update it, protect it',
      intro:
        'Your smartphone holds your identity, photos, conversations and accounts. Three reflexes are enough to protect it.',
      minutes: 5,
      level: 'débutant',
      sections: [
        {
          heading: 'Lock your device',
          body: [
            'A PIN, a pattern or your fingerprint: without a lock, anyone who finds your phone gets access to WhatsApp, your photos and your Mobile Money accounts. It is the first line of defence and takes 30 seconds to enable.',
            'Also turn on "erase after X attempts" when your phone offers it.',
          ],
        },
        {
          heading: 'Update, always',
          body: [
            'Updates fix security flaws that fraudsters exploit. Enable automatic updates for Android/iOS and for your important apps (WhatsApp, bank, Mobile Money). A phone not updated for a year is an open door.',
          ],
        },
        {
          heading: 'Apps: look before installing',
          list: [
            'Install only from the official Play Store or App Store — never via a link received by message.',
            'Beware of apps asking for more access than needed (a flashlight does not need your SMS).',
            'Uninstall apps you no longer use: they keep collecting your data.',
            'Do not "root" or "jailbreak" your phone: you disable its protections.',
          ],
        },
        {
          heading: 'Lost or stolen?',
          body: [
            'Android: use "Find My Device" (Google) to locate, ring or erase remotely. iPhone: "Find My" via iCloud. Change your important passwords and ask your operator to block your SIM.',
            'File a complaint at the police station — the report may be required by your insurance or operator.',
          ],
        },
      ],
    },
    {
      slug: 'wifi-public',
      icon: 'wifi',
      title: 'Public Wi-Fi: handy, but not without precautions',
      intro:
        'Café, airport and university networks: free Wi-Fi is a common loophole. Here is how to use it without giving your data away.',
      minutes: 4,
      level: 'débutant',
      sections: [
        {
          heading: 'The risk in one picture',
          body: [
            'On unencrypted public Wi-Fi, everything in transit can be intercepted: passwords, photos, messages. A fake "Free_WiFi_Airport" network set up by a scammer captures everything you send.',
          ],
        },
        {
          heading: 'The simple rule',
          body: [
            'Keep public Wi-Fi for light browsing (reading, searching). For anything touching money, passwords or sensitive data: use mobile data (3G/4G), which is encrypted by your operator.',
            'Check that the site starts with "https://" and shows a padlock before logging in or paying.',
          ],
        },
        {
          heading: 'Practical reflexes',
          list: [
            'Turn off file sharing (AirDrop, network sharing) on public networks.',
            'Forget public Wi-Fi networks after use so you do not reconnect automatically.',
            'Avoid banking and Mobile Money sites on public Wi-Fi — prefer 4G.',
            'If your phone offers a VPN, turn it on for public networks.',
          ],
        },
      ],
    },
    {
      slug: 'enfants-en-ligne',
      icon: 'child',
      title: 'Children and teens: protecting them online',
      intro:
        'Senegalese kids get online earlier and earlier. A few simple rules protect your children from scams, predators and bad encounters.',
      minutes: 7,
      level: 'débutant',
      sections: [
        {
          heading: 'The real dangers',
          body: [
            'Phishing targeting teens ("skin for your Free Fire account", "earn easy money"), dangerous contacts on social media, cyberbullying, and apps collecting minors\' data without informed consent.',
          ],
        },
        {
          heading: 'Talk, don\'t just monitor',
          body: [
            'The best tool is conversation: explain that a stranger asking for money or photos is never a friend. Tell them to come to you IMMEDIATELY if something makes them uncomfortable — without fear of being scolded.',
          ],
        },
        {
          heading: 'Useful technical settings',
          list: [
            'WhatsApp/Instagram/TikTok: switch children\'s accounts to private and limit contacts.',
            'Use your phone\'s parental controls (Google Family Link, iOS Screen Time) to limit time and apps.',
            'Keep the phone in a common area at night — not in the bedroom.',
            'Teach children to never give their name, address, school or photos privately to a stranger.',
          ],
        },
        {
          heading: 'If something happens',
          body: [
            'Keep screenshots as evidence. Report abusive content via the platforms\' reporting tools and, if needed, to the police. For children\'s personal data, the CDP can be contacted.',
          ],
        },
      ],
    },
    {
      slug: 'infox-faux-profils',
      icon: 'news',
      title: 'Rumours, fake profiles and fake news',
      intro:
        'A WhatsApp rumour can cost a lot — to you and your loved ones. Learn to verify before believing and before sharing.',
      minutes: 5,
      level: 'débutant',
      sections: [
        {
          heading: 'Why it works so well',
          body: [
            'Alarming messages spread fast: "your WhatsApp account will be deleted", "the government is giving money", "this is a scam" (often false itself). Fraudsters sometimes dress up as "whistleblowers".',
          ],
        },
        {
          heading: 'Verify in 3 questions',
          list: [
            'Who sent it? A stranger, a discussion group, or a "contact" whose number changed? Be wary.',
            'Where is the source? Real information cites a media outlet or official site — not "I was told".',
            'Is it too good, too serious or too urgent? It is probably false.',
          ],
        },
        {
          heading: 'Do not spread the scam',
          body: [
            'Before forwarding a message "to warn everyone", verify it: you could be spreading a scam to your whole circle. The reflex "I check first" protects your entire family.',
            'If in doubt about official information (taxes, health, security), check the institution\'s official website or call them directly.',
          ],
        },
      ],
    },
    {
      slug: 'que-faire-urgence',
      icon: 'alert',
      title: 'Think you were hacked or scammed: what to do',
      intro:
        'Panic leads to bad reflexes. Here is the right order of actions, minute by minute, to limit the damage.',
      minutes: 5,
      level: 'débutant',
      sections: [
        {
          heading: 'In the first 10 minutes',
          list: [
            'Cut the connection: put the phone in airplane mode or turn off mobile data.',
            'Call your operator (Orange, Free, Expresso) to block your line if your number is compromised.',
            'Call your bank or Mobile Money service to suspend transactions.',
            'Change your passwords from ANOTHER healthy device (computer or a relative\'s phone).',
          ],
        },
        {
          heading: 'Then',
          body: [
            'Log out suspicious devices: WhatsApp (Linked devices), Facebook (Active sessions), Google (connected devices). Also check authorised apps on your account.',
            'Back up your photos and important documents on another device or external drive.',
            'Write everything down: numbers, screenshots, dates — this evidence will serve your complaint.',
          ],
        },
        {
          heading: 'File a complaint and get help',
          body: [
            'File a complaint at the nearest police station or cybercrime unit. The report is essential for your operator, bank or insurance.',
            'For personal data matters, you can contact the CDP (Commission de Protection des Données Personnelles) — see the "Your rights" section.',
          ],
        },
      ],
    },
  ],
};
