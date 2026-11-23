# ASBO : alternatives à l'IA embarquée de 800 Mo

> Note de travail (23/11/2026), à reprendre plus tard.
> État actuel : `src/lib/llm/protocol.ts` charge **Gemma 3 1B instruct (ONNX, WebGPU)**,
> soit environ 760 à 860 Mo. Qwen2.5-0.5B avait été testé puis écarté (français incohérent, boucles).

## Constat

**Il n'existe pas d'IA intégrée au navigateur sur Android ou iOS qu'une PWA puisse utiliser.**
Et ASBO n'a probablement pas besoin d'un LLM téléchargé.

## 1. IA intégrée au navigateur

| Plateforme | Ce qui existe | Utilisable par la PWA ASBO ? |
|---|---|---|
| Chrome sur ordinateur | Gemini Nano, avec les API `LanguageModel` (Prompt API), Summarizer, Translator et Language Detector | Seulement sur des machines puissantes (environ 22 Go de disque libre, beaucoup de RAM ou une bonne carte graphique). La Prompt API n'est pas encore disponible partout pour les sites web. |
| Chrome sur Android | Gemini Nano existe, mais seulement pour les **applis natives** (ML Kit GenAI, AICore), sur certains téléphones haut de gamme | ❌ Rien n'est exposé aux pages web |
| iOS (Safari, et tous les navigateurs, qui utilisent WebKit) | Apple Foundation Models, pour les **applis Swift natives** uniquement | ❌ Rien côté web |

Les utilisateurs cibles sont surtout sur des Android d'entrée de gamme : ces API ne les toucheront pas.
On peut quand même s'en servir comme bonus quand elles sont présentes : `if ('LanguageModel' in self) { … }`.

## 2. Modèles légers, s'il faut vraiment de l'IA générative

Tailles approximatives en quantification 4 bits (WebLLM, Transformers.js ou MediaPipe) :

- **SmolLM2-135M** : environ 100 Mo. Faible, surtout bon en anglais.
- **Gemma 3 270M** : environ 150 à 250 Mo. Correct pour des tâches très ciblées, surtout après fine-tuning.
- **SmolLM2-360M** : environ 250 Mo.
- **Qwen2.5-0.5B / Qwen3-0.6B** : environ 350 à 400 Mo. Qwen2.5-0.5B est déjà écarté dans ASBO.

⚠️ En dessous de 500 Mo, ces modèles **hallucinent beaucoup**. Pour une appli de conseils de sécurité,
un mauvais conseil donné avec assurance est pire que pas de conseil. Aucun ne gère le wolof.

## 3. Recommandation pour ASBO (moins de 1 Mo, hors ligne, instantané)

- **« Vrai ou arnaque ? » / vérificateur** : un petit classifieur (régression logistique ou Naive Bayes
  sur des SMS d'arnaque en français et en wolof), entraîné hors ligne et livré sous forme de poids JSON
  (100 à 500 Ko). On l'associe à des règles explicables : urgence, Wave ou Orange Money, code OTP,
  lien raccourci, faux numéro de service client. On **montre quels signaux ont déclenché l'alerte**,
  ce qui apprend plus à l'utilisateur qu'un LLM opaque.
- **Recherche dans les 9 guides** : MiniSearch ou Fuse.js (quelques Ko), plutôt qu'un modèle
  d'embeddings (le plus petit qui gère le français pèse environ 120 Mo).
- **Si on garde un vrai assistant conversationnel** :
  - modèle lourd en **téléchargement optionnel**, avec consentement explicite, seulement en Wi-Fi,
    mis en cache pour fonctionner hors ligne ensuite ;
  - ou une Supabase Edge Function qui appelle un modèle hébergé, sans aucune donnée personnelle
    (on perd alors le hors-ligne).

## Prochaine étape possible

Prototyper le détecteur d'arnaques léger (règles et classifieur) pour remplacer ou compléter
`CheckerAI` et `AssistantLab`.
