// Heuristic scam-message analyser. Runs 100% client-side — nothing is sent anywhere.
export interface Finding {
  label: string;
  detail: string;
  severity: 'high' | 'medium' | 'low';
}

export interface Analysis {
  score: number; // 0-100, higher = more likely a scam
  verdict: 'danger' | 'suspect' | 'unclear' | 'probably-ok';
  findings: Finding[];
  tips: string[];
}

const URL_RE = /https?:\/\/[^\s)\]]+|www\.[^\s)\]]+/gi;
const SHORTENER_RE =
  /(bit\.ly|tinyurl|t\.co|ow\.ly|goo\.gl|cutt\.ly|rebrand\.ly|is\.gd|buff\.ly)/i;
const SHORT_CODE_RE = /\b\d{3,6}\b/g;

const URGENCY_WORDS = [
  'urgent', 'immédiatement', 'vite', 'maintenant', 'dernière', 'dernier',
  'expire', 'expiré', 'avant', '24h', '48h', 'immédiat', 'pressé', 'pressée',
  'urgence', 'suite à une', 'problème détecté', 'compte bloqué', 'suspendu',
  'suspendue', 'verrouillé', 'verrouillée',
];

const MONEY_WORDS = [
  'argent', 'wave', 'orange money', 'free money', 'argent facile', 'gain',
  'gagner', 'gagnez', 'cfa', 'francs', 'fcfa', 'euros', 'dollars', '$',
  'paiement', 'payez', 'versez', 'envoyez', 'transférez', 'remboursement',
  'rembourser', 'lot', 'jackpot', 'cadeau', 'prix', 'bonus',
];

const CREDENTIAL_WORDS = [
  'mot de passe', 'password', 'code pin', 'code secret', 'code de vérification',
  'otp', 'code à 6 chiffres', 'code à 4 chiffres', 'numéro de carte',
  'cvv', 'numéro de compte', 'iban', 'identifiant', 'login', 'connexion',
  'vérifiez votre compte', 'confirmez votre identité', 'kYC',
];

const AUTHORITY_SPOOF = [
  'banque', 'bank', 'sonatel', 'orange', 'wave', 'impôts', 'dgid',
  'ministère', 'government', 'police', 'gendarmerie', 'interpol',
  'admin', 'administrateur', 'support officiel', 'service client',
];

function countMatches(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  return words.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);
}

export function analyzeMessage(raw: string): Analysis {
  const text = raw.trim();
  const findings: Finding[] = [];
  let score = 0;

  if (!text) {
    return {
      score: 0,
      verdict: 'unclear',
      findings: [{ label: 'Message vide', detail: 'Collez d\'abord le message suspect.', severity: 'low' }],
      tips: [],
    };
  }

  // URLs
  const urls = text.match(URL_RE) || [];
  const shorteners = urls.filter((u) => SHORTENER_RE.test(u));
  if (urls.length > 0) {
    score += 15;
    findings.push({
      label: 'Lien présent',
      detail: `${urls.length} lien(s) détecté(s). Vérifiez toujours l'adresse exacte avant de cliquer.`,
      severity: 'medium',
    });
  }
  if (shorteners.length > 0) {
    score += 20;
    findings.push({
      label: 'Lien raccourci',
      detail: 'Les raccourcisseurs masquent la vraie destination — très utilisé par les arnaqueurs.',
      severity: 'high',
    });
  }

  // Urgency
  const urgency = countMatches(text, URGENCY_WORDS);
  if (urgency >= 2) {
    score += 25;
    findings.push({
      label: 'Pression urgente',
      detail: 'Le message crée une urgence pour vous empêcher de réfléchir. C\'est le signal n°1 des arnaques.',
      severity: 'high',
    });
  } else if (urgency === 1) {
    score += 10;
    findings.push({ label: 'Ton pressant', detail: 'Le message presse à agir vite.', severity: 'low' });
  }

  // Money
  const money = countMatches(text, MONEY_WORDS);
  if (money >= 2) {
    score += 25;
    findings.push({
      label: 'Argent en jeu',
      detail: 'Promesse de gain ou demande d\'argent : les arnaques visent presque toujours votre portefeuille.',
      severity: 'high',
    });
  } else if (money === 1) {
    score += 10;
    findings.push({ label: 'Mention d\'argent', detail: 'Le message parle d\'argent ou de paiement.', severity: 'low' });
  }

  // Credentials
  const creds = countMatches(text, CREDENTIAL_WORDS);
  if (creds >= 1) {
    score += 30;
    findings.push({
      label: 'Demande d\'informations sensibles',
      detail: 'Aucune banque ou administration sérieuse ne demande votre mot de passe, code PIN ou code de vérification par message.',
      severity: 'high',
    });
  }

  // Authority spoofing
  const authHits = AUTHORITY_SPOOF.filter((w) => text.toLowerCase().includes(w));
  if (authHits.length > 0) {
    score += 10;
    findings.push({
      label: 'Usurpation d\'autorité',
      detail: `Le message cite « ${authHits.slice(0, 3).join(', ')} ». Méfiez-vous : vérifiez via les canaux officiels.`,
      severity: 'medium',
    });
  }

  // Short codes (Wave/OM codes) + money = classic scam
  const codes = text.match(SHORT_CODE_RE) || [];
  if (codes.length > 0 && money > 0) {
    score += 15;
    findings.push({
      label: 'Code court + argent',
      detail: 'Un code à chiffres courtes avec une demande d\'argent ressemble à une fausse confirmation de paiement.',
      severity: 'high',
    });
  }

  // Greeting generic
  if (/^(bonjour|salut|coucou|hello|hi)\b/i.test(text) && text.length < 400 && urls.length > 0) {
    score += 5;
  }

  score = Math.min(100, score);
  const verdict: Analysis['verdict'] =
    score >= 60 ? 'danger' : score >= 35 ? 'suspect' : score >= 15 ? 'unclear' : 'probably-ok';

  const tips = [
    'Ne cliquez sur aucun lien et n\'appelez aucun numéro du message.',
    'Vérifiez directement dans l\'application officielle (Wave, Orange Money, votre banque) ou appelez le service client officiel.',
    'Si vous avez déjà envoyé de l\'argent ou donné un code : appelez immédiatement votre opérateur et votre banque.',
    'Signalez l\'arnaque à la plateforme (WhatsApp : bloquer et signaler) et aux autorités.',
  ];

  return { score, verdict, findings, tips };
}
