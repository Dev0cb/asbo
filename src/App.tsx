import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { STR, type Lang } from './i18n';
import { parseHash, scrollToId, type Route } from './lib/router';
import { track } from './lib/stats';
import { CountryContext, countryProfile, initialCountry, saveCountry, type CountryCode } from './lib/country';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './components/Home';
import { GuidesPage } from './components/GuidesPage';
import { GUIDES } from './data/guides';
import { RightsPage } from './components/RightsPage';
import { AboutPage } from './components/AboutPage';

// Heavier, interactive pages are split out so the first load stays small
// on low-end phones and slow connections.
const ToolsPage = lazy(() => import('./components/ToolsPage').then((m) => ({ default: m.ToolsPage })));
const AdminPage = lazy(() => import('./components/AdminPage').then((m) => ({ default: m.AdminPage })));

const STORAGE_LANG = 'securite-lang';

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_LANG);
    if (saved === 'fr' || saved === 'en') return saved;
  } catch {}
  return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

const TITLES: Record<Lang, Record<string, string>> = {
  fr: {
    '': 'Accueil',
    guides: 'Guides',
    outils: 'Outils',
    droits: 'Vos droits',
    auteur: 'Le concepteur',
    admin: 'Admin',
  },
  en: {
    '': 'Home',
    guides: 'Guides',
    outils: 'Tools',
    droits: 'Your rights',
    auteur: 'The designer',
    admin: 'Admin',
  },
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [route, setRoute] = useState<Route>(parseHash());
  const [countryCode, setCountryCode] = useState<CountryCode>(initialCountry);
  const countryValue = useMemo(
    () => ({
      country: countryProfile(countryCode),
      setCountry: (code: CountryCode) => {
        setCountryCode(code);
        saveCountry(code);
      },
    }),
    [countryCode],
  );

  useEffect(() => {
    // Light "paper" theme is the primary design; a saved choice still wins.
    const savedTheme = localStorage.getItem('securite-theme') as 'dark' | 'light' | null;
    const initial = savedTheme || 'light';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  useEffect(() => {
    const onHash = () => {
      const r = parseHash();
      setRoute(r);
      window.scrollTo({ top: 0 });
      const section = r.path[0] ?? '';
      const pageName = r.path[1] ? `${section}/${r.path[1]}` : section || 'home';
      if (pageName !== 'admin') {
        track('page_view', { page: pageName });
      }
    };
    window.addEventListener('hashchange', onHash);
    onHash();
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    const [section = '', sub] = route.path;
    const known = section in TITLES[lang];
    const guide = section === 'guides' && sub ? GUIDES[lang].find((g) => g.slug === sub) : undefined;
    const pageTitle = !known ? STR[lang].common.notFound : guide ? guide.title : TITLES[lang][section];
    const tagline = lang === 'fr' ? 'Se protéger en ligne' : 'Stay safe online';
    document.title = section ? `${pageTitle} · ASBO — Aar Sa Bopp Online` : `ASBO — Aar Sa Bopp Online · ${tagline}`;
  }, [lang, route]);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'fr' ? 'en' : 'fr';
      try {
        localStorage.setItem(STORAGE_LANG, next);
      } catch {}
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('securite-theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  const t = STR[lang];
  const [seg, sub] = route.path;

  let page: React.ReactNode;
  if (seg === 'guides') {
    page = <GuidesPage lang={lang} slug={sub} />;
  } else if (seg === 'outils') {
    page = <ToolsPage lang={lang} slug={sub} />;
  } else if (seg === 'droits') {
    page = <RightsPage lang={lang} />;
  } else if (seg === 'auteur') {
    page = <AboutPage lang={lang} />;
  } else if (seg === 'admin') {
    page = <AdminPage lang={lang} />;
  } else if (!seg) {
    page = <Home lang={lang} />;
  } else {
    page = (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="eyebrow justify-center">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-[var(--text-heading)]">{t.common.notFound}</h1>
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = '#/';
          }}
          className="btn-primary mt-8"
        >
          {t.common.backHome}
        </a>
      </div>
    );
  }

  return (
    <CountryContext.Provider value={countryValue}>
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--text-muted)]">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          scrollToId('main');
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-[var(--bg-elevated)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--text-heading)]"
      >
        {t.ui.skip}
      </a>
      <Header
        lang={lang}
        onToggleLang={toggleLang}
        theme={theme}
        onToggleTheme={toggleTheme}
        route={route.path}
      />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>{page}</Suspense>
      </main>
      <Footer lang={lang} />
    </div>
    </CountryContext.Provider>
  );
};

export default App;
