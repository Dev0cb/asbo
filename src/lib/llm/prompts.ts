// Prompts for the on-device model. A 0.5B model is small, so every prompt
// grounds it: the scam checker passes the rule-based signals, and the
// assistant passes the most relevant passages of ASBO's own guides.
import type { Lang } from '../../i18n';
import { GUIDES, type Guide } from '../../data/guides';
import type { Analysis } from '../scam/engine';
import { describeSignals } from '../../data/scamText';
import type { ChatMessage } from './protocol';

const MAX_MESSAGE_CHARS = 1500;
const MAX_CONTEXT_CHARS = 2400;
const TOP_PASSAGES = 3;
const HISTORY_TURNS = 4;

/* ------------------------------ Scam checker ------------------------------ */

const VERDICT_LABEL: Record<Lang, Record<Analysis['verdict'], string>> = {
  fr: { critical: 'risque critique', high: 'risque élevé', moderate: 'risque modéré', low: 'aucun signal suspect' },
  en: { critical: 'critical risk', high: 'high risk', moderate: 'moderate risk', low: 'no suspicious signal' },
};

export function checkerMessages(text: string, analysis: Analysis, lang: Lang): ChatMessage[] {
  const signals = describeSignals(analysis.signals, lang) || '-';
  const system =
    lang === 'fr'
      ? `Tu es l'assistant de sécurité d'ASBO, une plateforme sénégalaise d'éducation à la cybersécurité. Tu aides des personnes non spécialistes à savoir si un message reçu (SMS, WhatsApp, e-mail, Facebook) est une arnaque.
Règles :
- Réponds en français simple, sans jargon, en 8 lignes maximum.
- Commence exactement par « Verdict : » suivi de « Arnaque probable », « Suspect » ou « Probablement sans danger ».
- Puis « Pourquoi : » avec 2 ou 3 puces courtes qui citent des éléments précis du message.
- Puis « Que faire : » avec 2 puces de conseils concrets (ne pas cliquer, appeler le numéro officiel, ne jamais donner un code ou un PIN…).
- Wave, Orange Money, les banques et les opérateurs ne demandent JAMAIS un code PIN ou un code reçu par SMS.
- N'invente aucun fait qui n'est pas dans le message.

Exemple de réponse attendue :
Verdict : Arnaque probable
Pourquoi :
- Le lien « orange-money-promo.xyz » n'est pas le site officiel.
- On vous demande votre code PIN.
Que faire :
- Ne cliquez pas et ne répondez pas.
- Appelez le service client officiel pour vérifier.`
      : `You are the security assistant of ASBO, a Senegalese cybersecurity education platform. You help non-specialists tell whether a message they received (SMS, WhatsApp, email, Facebook) is a scam.
Rules:
- Answer in plain English, no jargon, 8 lines maximum.
- Start exactly with "Verdict:" followed by "Likely scam", "Suspicious" or "Probably safe".
- Then "Why:" with 2 or 3 short bullets quoting precise elements of the message.
- Then "What to do:" with 2 bullets of concrete advice (don't click, call the official number, never give a code or PIN…).
- Wave, Orange Money, banks and operators NEVER ask for a PIN or a code received by SMS.
- Do not invent any fact that is not in the message.

Example of the expected answer:
Verdict: Likely scam
Why:
- The link "orange-money-promo.xyz" is not the official site.
- It asks for your PIN.
What to do:
- Don't click and don't reply.
- Call the official customer service to check.`;
  const user =
    lang === 'fr'
      ? `Message reçu :\n"""\n${text.slice(0, MAX_MESSAGE_CHARS)}\n"""\n\nSignaux détectés automatiquement (score de risque ${analysis.score}/100, ${VERDICT_LABEL.fr[analysis.verdict]}) :\n${signals}\n\nAnalyse ce message.`
      : `Message received:\n"""\n${text.slice(0, MAX_MESSAGE_CHARS)}\n"""\n\nAutomatically detected signals (risk score ${analysis.score}/100, ${VERDICT_LABEL.en[analysis.verdict]}):\n${signals}\n\nAnalyse this message.`;
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

/* ------------------------------ Assistant (grounded on guides) ------------------------------ */

const STOP = new Set(
  'les des une pour que qui quoi dans avec sur pas mon mes mais est sont vous votre vos nous ils elle elles cette ces comment quand faire fait peut plus tres bien aussi etre avoir what when where which with your have this that from they them about does should would could there their'.split(' '),
);

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, ' ');

const terms = (s: string) => normalize(s).split(/\s+/).filter((w) => w.length >= 3 && !STOP.has(w));

interface Passage {
  guide: Guide;
  text: string;
  score: number;
}

/** Keyword retrieval over every guide section (no embeddings needed). */
export function retrieve(question: string, lang: Lang): Passage[] {
  const q = new Set(terms(question));
  if (!q.size) return [];
  const passages: Passage[] = [];
  for (const guide of GUIDES[lang]) {
    for (const section of guide.sections) {
      const text = [section.heading, ...(section.body ?? []), ...(section.list ?? []).map((l) => `- ${l}`)]
        .filter(Boolean)
        .join('\n');
      const words = terms(`${guide.title} ${text}`);
      let score = 0;
      for (const w of words) if (q.has(w)) score++;
      // Prefix matches catch plurals/conjugations ("code" ~ "codes").
      for (const t of q) if (words.some((w) => w !== t && (w.startsWith(t) || t.startsWith(w)) && Math.min(w.length, t.length) >= 4)) score += 0.5;
      if (score > 0) passages.push({ guide, text, score: score / Math.sqrt(words.length + 5) });
    }
  }
  return passages.sort((a, b) => b.score - a.score).slice(0, TOP_PASSAGES);
}

export function assistantMessages(
  question: string,
  history: ChatMessage[],
  lang: Lang,
): { messages: ChatMessage[]; sources: Guide[] } {
  const passages = retrieve(question, lang);
  let context = '';
  for (const p of passages) {
    const block = `[${p.guide.title}]\n${p.text}\n\n`;
    if (context.length + block.length > MAX_CONTEXT_CHARS) break;
    context += block;
  }
  const sources = [...new Map(passages.map((p) => [p.guide.slug, p.guide])).values()];
  const system =
    lang === 'fr'
      ? `Tu es l'assistant de sécurité numérique d'ASBO (Aar Sa Bopp Online), une plateforme sénégalaise. Tu réponds à des personnes de tous âges, souvent peu à l'aise avec le numérique.
Règles :
- Réponds en français simple, en 3 à 6 phrases courtes ou en petites étapes numérotées.
- Appuie-toi UNIQUEMENT sur les extraits des guides ASBO ci-dessous.
- Si les extraits ne contiennent pas la réponse, dis-le honnêtement et conseille de consulter les guides ASBO ou un proche de confiance.
- Ne demande jamais d'informations personnelles (code, mot de passe, numéro de carte).
- En cas d'argent perdu ou de compte volé, donne d'abord les gestes urgents.

Extraits des guides ASBO :
${context || '(aucun extrait pertinent)'}`
      : `You are the digital-safety assistant of ASBO (Aar Sa Bopp Online), a Senegalese platform. You answer people of all ages, often not comfortable with technology.
Rules:
- Answer in plain English, in 3 to 6 short sentences or small numbered steps.
- Rely ONLY on the ASBO guide excerpts below.
- If the excerpts do not contain the answer, say so honestly and suggest reading the ASBO guides or asking a trusted person.
- Never ask for personal information (code, password, card number).
- If money was lost or an account stolen, give the urgent steps first.

ASBO guide excerpts:
${context || '(no relevant excerpt)'}`;
  return {
    messages: [{ role: 'system', content: system }, ...history.slice(-HISTORY_TURNS), { role: 'user', content: question }],
    sources,
  };
}
