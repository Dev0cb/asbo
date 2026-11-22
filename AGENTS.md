# Sécurité.sn — Agent Handoff Report

Complete context for continuing development on this project. Read this file
first, then `README.md`.

## What this is

**Sécurité.sn** is a free Progressive Web App that teaches every Senegalese
user to protect their personal data and browse safely online. It is an
independent civic initiative by **Malick BA** (software/data/AI engineer,
DevSecOps practitioner) — <https://malickba.me>.

Live URL: **https://securite.malickba.me** (GitHub Pages, custom domain).
Repo: **https://github.com/Dev0cb/securite** (public, `main` branch).
It is a *separate* repo from the portfolio repo
(`malick-ba---devsecops---software-engineer-portfolio`) — do NOT merge them.
The `platform/` folder inside the portfolio checkout is a git-ignored copy;
the canonical source is the `Dev0cb/securite` repo. Keep them in sync by
working in `platform/` and pushing to the `securite` remote.

## Stack

- React 19 + TypeScript + Vite 6 + Tailwind CSS **v4** (CSS-first config)
- Hash-based routing (no react-router) — required for static GitHub Pages
- PWA: `public/manifest.webmanifest`, `public/sw.js` (hand-rolled service
  worker, cache name `securite-vN` — bump on every release)
- Supabase (`@supabase/supabase-js`, **lazy-loaded** via dynamic import so the
  main bundle stays ~105 kB gzip for low-end devices / slow connections)
- Bilingual FR/EN, **dark theme by default** (light theme still available)

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
│   ├── lib/
│   │   ├── router.ts       # parseHash/navigate helpers
│   │   ├── session.ts      # anonymous session UUID (localStorage)
│   │   ├── stats.ts        # track() → Supabase + localStorage mirror
│   │   └── scamCheck.ts    # heuristic scam-message analyser (client-side)
│   └── components/
│       ├── Header/Footer   # nav, lang/theme toggles, PWA install btn
│       ├── Home.tsx        # hero (aurora bg), scam ticker, sections
│       ├── GuidesPage.tsx  # index (search) + article (prev/next/related)
│       ├── ToolsPage.tsx   # quiz / scam checker / checklist tabs
│       ├── RightsPage.tsx  # Senegal law 2008-12 + CDP contact card
│       ├── AboutPage.tsx   # author card → malickba.me / LinkedIn / GitHub
│       ├── AdminPage.tsx   # Supabase auth dashboard + demo fallback
│       ├── Reveal.tsx      # visible by default; only below-fold items get .reveal-pending
│       └── icons.tsx       # SVG icon set + GUIDE_ICONS map
└── supabase/
    ├── schema.sql          # canonical schema (events table + RLS + view)
    └── migrations/0001_init.sql
```

## Routes (hash-based)

`#/` home · `#/guides` index · `#/guides/<slug>` article · `#/outils`
(tools) · `#/droits` (data rights/CDP) · `#/auteur` (author) · `#/admin`
(dashboard). Guide slugs (same in FR/EN): `hameconnage`, `mobile-money`,
`mots-de-passe`, `reseaux-sociaux`, `telephone-appareil`, `wifi-public`,
`enfants-en-ligne`, `infox-faux-profils`, `que-faire-urgence`.

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
- **Admin account**: `hajjmalickba@icloud.com` (Supabase Auth email/password).
  Password was generated at setup and shared with the owner — he should
  rotate it (Authentication → Users in dashboard). Only this account can
  read `events` (RLS `authenticated` role).
- Admin dashboard `/#/admin`: without env vars it shows **local demo stats**;
  with Supabase it requires login, then aggregates up to 5000 recent events
  client-side (visitors ≈ distinct session_id, pageviews, quizzes, top
  guides, score buckets, 7-day chart, recent events table).

## Deployment

- GitHub Actions `.github/workflows/deploy.yml`: `npm ci` → `vite build`
  (with `vars.VITE_SUPABASE_*`) → `upload-pages-artifact` → `deploy-pages`.
- GitHub Pages: custom domain `securite.malickba.me`, `build_type=workflow`,
  `https_enforced` pending cert provisioning (automatic once GitHub issues
  the Let's Encrypt cert — check `gh api repos/Dev0cb/securite/pages`).
- DNS (Namecheap): `securite` CNAME → `dev0cb.github.io` ✅ done.
- `base: './'` in `vite.config.ts` keeps the build portable (subdomain root
  or sub-path). Do not change to `/` unless the domain setup changes.

## Known state / pending

- HTTPS cert: if `gh api repos/Dev0cb/securite/pages` has no
  `https_certificate` field, GitHub never requested one — remove and re-add
  the custom domain to trigger it (see Deployment).
- No tests yet — verification is `tsc --noEmit` + `vite build` + visual
  check with headless Chrome screenshots, e.g.
  `google-chrome --headless=new --hide-scrollbars --virtual-time-budget=5000
  --window-size=390,2400 --screenshot=out.png "http://localhost:4173/#/guides"`
  after `npx vite preview --port 4173`. Always check mobile (390px) AND
  desktop (1366px) and look at the screenshots.
- Analytics: `page_view` is tracked ONLY in `App.tsx` (on hash change). Do
  not add per-page `track('page_view')` effects — that double-counted.

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
- After any UI change: bump `CACHE` in `public/sw.js`, rebuild, push,
  then tell the user to hard-refresh (SW caches aggressively on phones).
