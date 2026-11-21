# Sécurité — Plateforme d'éducation à la sécurité numérique (Sénégal)

Progressive Web App gratuite et pédagogique pour aider tous les Sénégalais à
protéger leurs données personnelles et à pratiquer des usages en ligne sûrs.
Conçue et développée par **Malick BA** — <https://malickba.me>.

## Fonctionnalités

- **9 guides pratiques** (hameçonnage, Mobile Money, mots de passe, réseaux
  sociaux, téléphone, Wi-Fi public, enfants, infox, que faire en cas d'arnaque)
- **3 outils interactifs** : quiz « êtes-vous en sécurité ? », détecteur
  d'arnaque 100 % local, checklist de protection sauvegardée sur l'appareil
- **Section « Vos droits »** : loi n° 2008-12, droits CDP, contacts de la
  Commission de Protection des Données Personnelles
- **Dashboard admin** (`/#/admin`) : statistiques d'usage via Supabase
  (visiteurs, pages vues, quiz, guides populaires, scores)
- **PWA** : installable, fonctionne hors ligne (service worker), responsive
  mobile / tablette / desktop
- **Bilingue FR/EN** avec détection automatique de la langue

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, Supabase (stats + auth admin),
GitHub Pages. Aucun backend applicatif : tout le contenu est statique, les
événements sont envoyés vers Supabase.

## Développement

```bash
npm install
cp .env.example .env.local   # renseigner les clés Supabase
npm run dev                  # http://localhost:3100
npm run build                # dist/ prêt pour GitHub Pages
```

## Configuration Supabase

1. Créer un projet sur <https://supabase.com> (région eu-west ou la plus proche).
2. Dans **SQL Editor**, exécuter `supabase/schema.sql` (table `events` + RLS).
3. Créer un utilisateur admin : **Authentication → Users → Add user**
   (email + mot de passe) — c'est le seul compte qui pourra lire les stats.
4. Copier `Project URL` et `anon public key` dans `.env.local`.

Sans `.env`, la plateforme fonctionne quand même : le dashboard `/admin`
affiche les statistiques locales de démonstration.

## Déploiement (sous-domaine `securite.malickba.me`)

Le site portfolio (`malickba.me`) et Sécurité sont deux sites GitHub Pages
distincts — un repo ne peut avoir qu'un seul domaine custom.

1. Créer un nouveau repo GitHub (ex. `securite`) et y pousser `platform/`.
2. Activer **Settings → Pages → GitHub Actions** avec le workflow fourni
   (`.github/workflows/deploy.yml` dans ce dossier — à copier à la racine du
   nouveau repo).
3. Dans les settings Pages du nouveau repo : **Custom domain** =
   `securite.malickba.me`.
4. Chez le registrar de `malickba.me`, ajouter un enregistrement **CNAME** :
   `securite` → `<user>.github.io`.

## Licence

Contenu librement réutilisable avec mention de la source. Le code est fourni
tel quel pour un usage citoyen.
