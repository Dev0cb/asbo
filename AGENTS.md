# ASBO (Aar Sa Bopp Online) — Agent Handoff Report

Complete context for continuing development on this project. Read this file
first, then `README.md`.

## What this is

**ASBO Platform** — *Aar Sa Bopp Online* (Wolof: "protect yourself online") — is a free Progressive Web App that teaches every Senegalese
user to protect their personal data and browse safely online. It is an
independent civic initiative by **Malick BA** (software/data/AI engineer,
DevSecOps practitioner) — <https://malickba.me>.

Live URL: **https://asbo.malickba.me** (GitHub Pages, custom domain; formerly securite.malickba.me).
Repo: **https://github.com/Dev0cb/asbo** (public, `main` branch; renamed from `securite` on 2026-11-22 — GitHub redirects the old URL).
It is a *separate* repo from the portfolio repo
(`malick-ba---devsecops---software-engineer-portfolio`) — do NOT merge them.
The `platform/` folder inside the portfolio checkout is a git-ignored copy;
the canonical source is the `Dev0cb/asbo` repo. Keep them in sync by
working in `platform/` and pushing to the `asbo` remote.

## Stack

- React 19 + TypeScript + Vite 6 + Tailwind CSS **v4** (CSS-first config)
- Hash-based routing (no react-router) — required for static GitHub Pages
- PWA: `public/manifest.webmanifest`, `public/sw.js` (hand-rolled service
  worker, cache name `securite-vN` — bump on every release)
- Supabase (`@supabase/supabase-js`, **lazy-loaded** via dynamic import so the
  main bundle stays ~100 kB gzip; Tools/Admin pages are `React.lazy` chunks, Tools is prefetched on idle so it works offline for low-end devices / slow connections)
- Bilingual FR/EN, **light "paper" theme by default** (dark theme available)

## Commands

```bash
cd platform
npm install
npm run dev        # http://localhost:3100
npm run build      # tsc-less vite build → dist/
npx tsc --noEmit   # typecheck (noEmit project)
git push           # triggers GitHub Actions → GitHub Pages deploy (~35s)
```

Supabase env vars live in `platform/.env.local` (git-ignored):
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. In CI they come from GitHub
repo **variables** (already set). `.env.example` documents them.

## ⚠️ Critical gotcha — Tailwind v4

**`postcss.config.mjs` (with `@tailwindcss/postcss`) is REQUIRED.** Without
it, `@import "tailwindcss"` is inlined raw, the built CSS contains a literal
`@tailwind utilities` and **zero utility classes** — every `flex`, `grid`,
`px-4`, `max-w-6xl` is ignored and the site looks like raw HTML. This was the
real root cause of the "site looks broken" reports (fixed 2026-11-22).
Quick check after a build: `grep -c '@tailwind' dist/assets/*.css` must be 0
and `grep -c 'max-w-6xl' dist/assets/*.css` must be ≥ 1.

Also: **`@apply` inside `@layer` is NOT expanded by Tailwind v4.** Custom classes
must be plain CSS. `src/index.css` documents this. If UI looks "unstyled",
check the built CSS for literal `@apply` — that was the bug that made the
site look broken. All design tokens are CSS vars (`--bg`, `--bg-card`,
`--border`, `--text`, `--text-heading`, `--color-accent`, `--sn-green`,
`--sn-gold`, `--sn-red`) defined for `[data-theme="dark"|"light"]`.

## File map

```
platform/
├── index.html              # FR default, dark-first theme script, fonts
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js               # offline-first; bump CACHE name per release
│   ├── favicon.svg, icons/ # PNGs generated with ImageMagick from SVG
├── src/
│   ├── main.tsx            # mounts app, registers SW in prod only
│   ├── App.tsx             # hash router + lang/theme state
│   ├── i18n.ts             # ALL UI strings FR/EN + QUIZ + CHECKLIST data
│   ├── config.ts           # env vars, AUTHOR info, PLATFORM_URL
│   ├── index.css           # design system (plain CSS, see gotcha above)
│   ├── data/guides.ts      # 9 guides × FR/EN (structured sections)
│   ├── data/labs.ts        # lab content + lab UI strings + quiz explanations
│   ├── lib/
│   │   ├── router.ts       # parseHash/navigate helpers
│   │   ├── session.ts      # anonymous session UUID (localStorage)
│   │   ├── stats.ts        # track() → Supabase + localStorage mirror
│   │   ├── scam/           # deterministic scam engine: normalize → rules + url → score/combos/verdict
│   │   ├── exposure/       # self-OSINT: model.ts (index, correlations, what-if), textScan.ts
│   │   ├── passphrase.ts   # BIP39-FR + local word list, unbiased CSPRNG generator
│   │   └── password.ts     # password crack-time estimator (word-by-word attack model)
│   └── components/
│       ├── Header/Footer   # nav, lang/theme toggles, PWA install btn
│       ├── Home.tsx        # hero (aurora bg), scam ticker, sections
│       ├── GuidesPage.tsx  # index (search) + article (prev/next/related)
│       ├── ToolsPage.tsx   # 6 tool tabs (lazy-loaded chunk), quiz w/ explanations
│       ├── tools/          # PhishingTrainer, PasswordTester, FootprintLab
│       ├── RightsPage.tsx  # Senegal law 2008-12 + CDP contact card
│       ├── AboutPage.tsx   # author card → malickba.me / LinkedIn / GitHub
│       ├── AdminPage.tsx   # Supabase auth dashboard + demo fallback
│       ├── Reveal.tsx      # visible by default; only below-fold items get .reveal-pending
│       └── icons.tsx       # SVG icon set + GUIDE_ICONS map
└── supabase/
    ├── schema.sql          # canonical schema (events table + RLS + view)
    └── migrations/          # 0001 init · 0002 + 0003 access hardening
```

## Routes (hash-based)

`#/` home · `#/guides` index · `#/guides/<slug>` article · `#/outils`
(tools; deep links `#/outils/quiz|vrai-ou-arnaque|detecteur|mot-de-passe|vos-donnees|checklist`) · `#/droits` (data rights/CDP) · `#/auteur` (author) · `#/admin`
(dashboard). Guide slugs (same in FR/EN): `hameconnage`, `mobile-money`,
`mots-de-passe`, `reseaux-sociaux`, `telephone-appareil`, `wifi-public`,
`enfants-en-ligne`, `infox-faux-profils`, `que-faire-urgence`.

## Brand, voice & positioning (owner's instructions, 2026-11-22)

- Name: **ASBO** / **Aar Sa Bopp Online** / "ASBO Platform". Logo = keyhole
  that is also a person (`AsboMark` in icons.tsx, `public/favicon.svg`).
- Personal branding: Malick BA — Senegalese software engineer specialised in
  distributed systems (Master 2 Systèmes d'Information Répartis, UCAD);
  certified GDPR & Data Privacy, Data Governance (DataCamp), Digital Security &
  Secure Online Practices (Code for Africa). Source of truth: portfolio repo
  `components/Interface.tsx`.
- **Never blame the CDP or institutions.** Justify ASBO by the problems
  (mobile-money fraud, WhatsApp account theft, young under-prepared users,
  little-known rights) — not by others' shortcomings.
- **Keep CDP visibility low** (owner wants a future partnership, not free
  promotion): no CDP CTA, link or contact card. Naming the CDP is OK where it
  is legally useful (owner, 2026-11-22): in generated letters, in step 3 of
  the Rights page and in the "Une autorité par pays" table (`AUTHORITIES` in
  data/letters.ts — one authority + one law per country; keep it indicative).
- Wording: "Formé en Systèmes d'Information Répartis (Master 2, UCAD)", never
  "Titulaire de". Certs: GDPR & Data Privacy, Data Governance, Data Literacy
  (DataCamp), Digital Security & Secure Online Practices (Code for Africa).
- Author photo: `public/malick-ba.webp|jpg` (320px, EXIF stripped).
- Do NOT rehost CDP's PDF templates (copyright unclear, signed URLs expire).
  ASBO's own letters live in `data/letters.ts` (art. 62 access, art. 68
  objection, art. 69 rectification/deletion of loi 2008-12 du 25/01/2008).
- No tech-stack mention in the UI. No Admin link in the header; `#/admin`
  stays as a hidden route (usage stats = impact proof for partners).

## Design system ("civic security bulletin")

- Fonts: Fraunces (display, h1/h2 automatically), Public Sans (body),
  JetBrains Mono (labels). Paper `#f4efe4` / ink `#16150f`, brand green
  `--brand`, ochre `.mark` highlighter, kola red `--bad`.
- Patterns: `.eyebrow` ("01 — POURQUOI"), `.rule-top` hairlines, flat
  `.card` (hover = ink border, no lift/glow), hairline grids
  (`gap-px bg-[var(--border)]`), `.stamp`, `.dot-grid` (hero only).
- Avoid: gradients, glow, blobs, rainbow icon tiles, emoji icons.

## UI/UX rules (enforced by the 2026-11-22 audit)

- Touch targets ≥ 44px: `.btn*`, `.input`, `a.chip` have `min-height: 2.75rem`;
  icon buttons use `h-11 w-11`; footer/back links use `min-h-11`.
- Inputs are 16px (`.input`) — smaller makes iOS Safari zoom on focus.
- Colours: never use `--color-accent`, raw hex or decorative hues as TEXT.
  Use `text-[var(--accent-text)]`, `--good`, `--bad`, `--warn`, which are
  redefined darker in the light theme to meet 4.5:1. `--color-accent` is for
  backgrounds/borders (e.g. `.btn-primary` gradient with dark text).
- No emoji as UI icons (flag emoji shows "SN" on Windows) — use SVG (`FlagSN`).
- Moving content must be pausable: the scam ticker pauses on hover, focus and tap.
- Audit method: headless Chrome via CDP, every route × dark/light at 390px,
  checking target size, font size, input font size and WCAG contrast.

## Audience and countries (owner, 2026-11-23)

- **Primary audience: Senegalese users; institutional targets: the CDP and
  the ministry.** Other nationalities may use the tools and learn, but the
  content stays Senegal-first.
- **Only verifiable content.** Never add a foreign law, authority, article,
  official domain, ID-number format or menu path we cannot verify. When in
  doubt, use general wording ("la législation applicable", "l'autorité
  compétente") or leave it out.
- `src/lib/country.ts`: two profiles only — `SN` (loi n° 2008-12, articles
  62/68/69, CDP, Wave / Orange Money / Free Money, CNI) and `OTHER`
  (generic wording, letter in the UI language, no law named). Default:
  saved choice (`asbo-country`), otherwise SN — never guessed from the
  browser locale (many Senegalese phones use `fr-FR`). `CountryPicker` on Tools, Rights and footer.
- Copy placeholders `{money}`, `{money1}`, `{id}` are filled by
  `fillCountry()`.
- Scam engine `BRANDS`: list only official domains we are sure of; a brand
  without a verified domain has `tokens: []` (its links are never called
  "fake" or "official").
- The "Une autorité par pays" table (`AUTHORITIES` in `data/letters.ts`) is
  the owner's original indicative list — do not extend it without a source.

## Content conventions

- **All user-facing text lives in `src/i18n.ts`** (`STR.fr` / `STR.en`) —
  never hardcode strings in components. Guides live in `src/data/guides.ts`
  with per-language `title/intro/sections[]`.
- Guide icons: add key to `GUIDES[].icon` + `GUIDE_ICONS` in `icons.tsx` +
  `ICON_COLORS` maps in `Home.tsx`/`GuidesPage.tsx`.
- Tone: plain language, concrete Senegalese examples (Wave, Orange Money,
  SONATEL, CDP, loi 2008-12), no jargon. Audience: every age, every phone.

## Supabase backend

- Project: **securite** — ref `cwbriicexplvyosdvqmb`, region eu-central-1,
  URL `https://cwbriicexplvyosdvqmb.supabase.co`
- CLI: `supabase` v3.2.0 installed globally; logged in via access token;
  project linked in `platform/` (`supabase/config.toml` may exist — check).
- Schema (`supabase/schema.sql`, applied via `supabase db push --remote`):
  - `events` table: `id, type, data jsonb, session_id, lang, created_at`
  - RLS: `anon`+`authenticated` can INSERT; only `authenticated` can SELECT
  - view `daily_stats`: per-day counts for partner/authority reports
- Event types tracked (`lib/stats.ts`): `page_view`, `guide_view`,
  `quiz_complete`, `checker_use`, `checklist_update`, `outbound_click`.
  `track()` is fire-and-forget and also mirrors to `localStorage`
  (`securite-local-events`) for the admin demo mode.
- **Admin account**: the owner's Supabase Auth email/password account (never
  write the email in this public repo). Reads of `events` are restricted to
  users listed in `public.admins` (plain RLS, migrations 0002 + 0003; no
  SECURITY DEFINER function); `daily_stats` is `security_invoker`; anonymous
  inserts are limited to known event types and 2 KB payloads. Supabase
  advisors: clean except "leaked password protection" (dashboard setting). Public sign-up is enabled in Auth but
  grants no read access. Add an admin: `insert into public.admins (user_id)
  values ('<auth uid>');` in the SQL editor.
- Admin dashboard `/#/admin` (`components/AdminPage.tsx` = auth + paged fetch;
  `components/admin/` = `aggregate.ts` pure maths, `charts.tsx` SVG/HTML
  charts, `Dashboard.tsx` layout, `strings.ts` plain-language FR/EN copy).
  Real data only — no demo mode, no local mirror. Fetches every `events` row
  in pages of 1,000 (PostgREST cap; the old `.limit(5000)` silently returned
  1,000). Past ~200k rows, move aggregation to SQL views. Charts follow the
  dataviz skill; chart colours are `--chart-*` tokens validated with its
  palette validator in both themes. Audit test events are excluded in
  `aggregate.ts` (`isAuditEvent`).

## Deployment

- GitHub Actions `.github/workflows/deploy.yml`: `npm ci` → `vite build`
  (with `vars.VITE_SUPABASE_*`) → `upload-pages-artifact` → `deploy-pages`.
- GitHub Pages: custom domain `asbo.malickba.me`, `build_type=workflow`,
  `https_enforced` pending cert provisioning (automatic once GitHub issues
  the Let's Encrypt cert — check `gh api repos/Dev0cb/asbo/pages`).
- DNS (Namecheap): `asbo` CNAME → `dev0cb.github.io` ✅ done (old `securite` CNAME may still exist; GitHub serves only one custom domain).
- `base: './'` in `vite.config.ts` keeps the build portable (subdomain root
  or sub-path). Do not change to `/` unless the domain setup changes.

## Known state / pending

- HTTPS cert: if `gh api repos/Dev0cb/asbo/pages` has no
  `https_certificate` field, GitHub never requested one — remove and re-add
  the custom domain to trigger it (see Deployment).
- Unit tests: `npm test` (vitest), run with `tsc --noEmit` in the deploy
  workflow before the build — a failure blocks the deployment — `src/lib/**/*.test.ts` cover the
  password estimator, the scam engine (anonymised corpus incl. legitimate
  messages) and the exposure model. Add a corpus case for every new rule.
  Install with `npm install --ignore-scripts` (onnxruntime-node's postinstall
  downloads ~1 GB of CUDA libs and filled the disk once).
- Verification is also `tsc --noEmit` + `vite build` + visual
  check with headless Chrome screenshots, e.g.
  `google-chrome --headless=new --hide-scrollbars --virtual-time-budget=5000
  --window-size=390,2400 --screenshot=out.png "http://localhost:4173/#/guides"`
  after `npx vite preview --port 4173`. Always check mobile (390px) AND
  desktop (1366px) and look at the screenshots.
- Analytics: `page_view` is tracked ONLY in `App.tsx` (on hash change). Do
  not add per-page `track('page_view')` effects — that double-counted.

## Labs (Tools page)

Adapted from the owner's "Cyber-Enquêteur Academy" project
(`~/Téléchargements/cyber-enquêteur-academy`, Next.js/AI Studio), rewritten
for Senegal and the Sécurité design system:
- **Vrai ou arnaque ?** (`PhishingTrainer`) ← its "Détecteur de phishing":
  8 SMS/WhatsApp/e-mail scenarios, clues + explanation after each answer.
- **Mot de passe** (`PasswordTester` + `lib/password.ts`) ← "Craquage de mots
  de passe", with a guesses-based estimate at 1e10 guesses/s = the cheapest of
  brute force, common words/word+digits, sequences AND a word-by-word attack
  (each word = one pick from a dictionary; the ASBO list is public, so a
  passphrase is only as strong as its number of random words). Generator
  (`lib/passphrase.ts`): 6 words from ~2,200 (BIP39 French + local words),
  rejection sampling, number at a random position. Typed value NEVER tracked.
- **Détecteur d'arnaque** (`tools/ScamChecker.tsx` + `lib/scam/`): no AI.
  Six rule families (urgency, sensitive data, financial promise, links,
  impersonation, payment) with per-family caps, offline URL analysis (brand
  look-alikes, typosquatting, shorteners, IP, punycode, TLD, .apk), combination
  floors (code + fake site → critical…), verdicts low/moderate/high/critical
  at 20/40/70. Copy in `data/scamText.ts`. Never say "message sûr".
- **Vos données parlent** (`FootprintLab`) — 3 modes: a real free-text form
  (city, year, close relative, passion; validated in `validateFootprint`) that
  builds guessable passwords + a trap message using the user's country; a self-audit (`tools/ExposureAudit.tsx`, 17 declared items, index =
  Σ weight × accessibility + scenario bonus, 11 correlation scenarios,
  "what if" quick wins); a local scan of the user's own text
  (`tools/ExposureScan.tsx`, secrets masked). Copy in `data/exposure.ts`.
  Answers are kept in memory only.
- **Quiz explanations** (`QUIZ_WHY`) ← "Sécurité des comptes": feedback +
  "why" after each answer. Keep `QUIZ_WHY` in the same order as `QUIZ`.
- Event `lab_complete` `{lab, score?, max?, lang}` (no DB constraint on type).
- Lab strings live in `data/labs.ts` (`LAB_STR`) to keep `i18n.ts` < 800 lines.

## On-device AI (LLM in the browser)

- Library: `@huggingface/transformers` 4.3.2 (pinned). Model:
  `onnx-community/Qwen2.5-0.5B-Instruct` — q4f16 on WebGPU (~480 MB) when
  the GPU supports `shader-f16`, otherwise int8 on WASM (~510 MB). Constants
  in `src/lib/llm/protocol.ts`.
- `src/lib/llm/worker.ts` runs the model in a module worker (page never
  freezes); `engine.ts` is the page-side store (status, progress, streaming,
  interrupt); `prompts.ts` builds grounded prompts.
- **Never auto-download.** `components/tools/LocalAI.tsx` (`LocalAIGate`)
  asks first, shows the size, warns on data-saver / low memory, then caches
  (browser Cache Storage; `asbo-llm-cached` flag) so it works offline.
- Users' text never leaves the device. Weights come from Hugging Face; Vite
  bundles the ONNX runtime wasm (`assets/ort-wasm-*.wasm`, ~6.7 MB gzip).
- Tools using it: scam checker "Analyse approfondie" (`tools/CheckerAI.tsx`,
  grounded on the rule-based signals) and "Assistant IA"
  (`tools/AssistantLab.tsx`, keyword retrieval over the 9 guides; shows
  the guides used as sources). A 0.5B model is small: keep prompts short,
  grounded and in the user's language; always show the "AI can be wrong"
  disclaimer.

## "Vrai ou arnaque ?" (phone simulator)

- Scenarios in `src/data/phishing.ts` (18, FR/EN, per-scenario `clues`
  with a `target` that is outlined + numbered on the phone after answering).
- `components/tools/phone/Phone.tsx` draws SMS / WhatsApp / Gmail-like
  e-mail / Messenger / Facebook post screens; order reshuffled each game.

## Roadmap ideas (discussed with owner)

1. Open Graph image + Google Search Console sitemap submission (SEO).
2. Partial Wolof translation (home + key guides) — biggest reach lever.
3. Partner/authority reporting: export `daily_stats` view as CSV/PDF for
   ARTP, CNDP, CDP, NGOs — the dashboard data is already there.
4. WhatsApp share cards per guide (viral loop — the quiz share button is
   the main organic-growth mechanic).
5. Optional: real backend form for "signaler une arnaque" feeding a
   moderated incident map (needs Supabase table + RLS review).

## Working agreements

- Commit style: short imperative subject (see `git log`). The portfolio repo uses the same convention.
- Never commit `.env.local` or secrets; anon key is public-by-design but
  keep service-role keys out of the repo entirely.
- After any UI change: bump `CACHE` (`asbo-vN`) in `public/sw.js`, rebuild, push,
  then tell the user to hard-refresh (SW caches aggressively on phones).
