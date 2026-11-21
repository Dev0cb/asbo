import React, { useCallback, useEffect, useState } from 'react';
import { STR, type Lang } from './i18n';
import { parseHash, type Route } from './lib/router';
import { track } from './lib/stats';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './components/Home';
import { GuidesPage } from './components/GuidesPage';
import { ToolsPage } from './components/ToolsPage';
import { RightsPage } from './components/RightsPage';
import { AboutPage } from './components/AboutPage';
import { AdminPage } from './components/AdminPage';

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
    auteur: 'L\'auteur',
    admin: 'Admin',
  },
  en: {
    '': 'Home',
    guides: 'Guides',
    outils: 'Tools',
    droits: 'Your rights',
    auteur: 'Author',
    admin: 'Admin',
  },
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const savedTheme = localStorage.getItem('securite-theme') as 'dark' | 'light' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = savedTheme || (prefersDark ? 'dark' : 'light');
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
    const section = route.path[0] ?? '';
    const sectionTitle = TITLES[lang][section] ?? TITLES[lang][''];
    document.title = `Sécurité — ${sectionTitle} | Sécurité numérique au Sénégal`;
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
    page = <ToolsPage lang={lang} />;
  } else if (seg === 'droits') {
    page = <RightsPage lang={lang} />;
  } else if (seg === 'auteur') {
    page = <AboutPage lang={lang} />;
  } else if (seg === 'admin') {
    page = <AdminPage lang={lang} />;
  } else {
    page = <Home lang={lang} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text-muted)]">
      <a
        href="#main"
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
      <main id="main" className="flex-1">
        {page}
      </main>
      <Footer lang={lang} />
    </div>
  );
};

export default App;
