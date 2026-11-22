import React, { useEffect, useState } from 'react';
import { STR, type Lang } from '../i18n';
import { navigate } from '../lib/router';
import { AsboMark, IconMenu, IconMoon, IconSun, IconDownload } from './icons';

interface Props {
  lang: Lang;
  onToggleLang: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  route: string[];
}

export const Header: React.FC<Props> = ({ lang, onToggleLang, theme, onToggleTheme, route }) => {
  const t = STR[lang];
  const [open, setOpen] = useState(false);
  const [installEvt, setInstallEvt] = useState<any>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const links = [
    { to: '/', label: t.nav.home },
    { to: '/guides', label: t.nav.guides },
    { to: '/outils', label: t.nav.tools },
    { to: '/droits', label: t.nav.rights },
    { to: '/auteur', label: t.nav.about },
  ];

  const isActive = (to: string) =>
    to === '/' ? route.length === 0 : route[0] === to.slice(1);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          className="flex h-11 items-center gap-2.5 text-[var(--text-heading)]"
          aria-label="ASBO, Aar Seu Bopp Online"
        >
          <AsboMark className="h-8 w-8" />
          <span className="flex flex-col leading-none">
            <span className="text-[17px] font-bold tracking-tight">ASBO</span>
            <span className="mt-1 hidden font-mono text-xs uppercase tracking-[0.16em] text-[var(--text-muted)] sm:block">
              Aar Seu Bopp Online
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.to}
              href={`#${l.to}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(l.to);
                setOpen(false);
              }}
              aria-current={isActive(l.to) ? 'page' : undefined}
              className={`relative flex h-11 items-center px-3 text-sm font-medium transition-colors after:absolute after:inset-x-3 after:bottom-2 after:h-px after:transition-colors ${
                isActive(l.to)
                  ? 'text-[var(--text-heading)] after:bg-[var(--rule)]'
                  : 'text-[var(--text-muted)] after:bg-transparent hover:text-[var(--text-heading)]'
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {installEvt && (
            <button
              onClick={() => installEvt.prompt()}
              className="hidden items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium text-[var(--text)] transition-colors hover:border-[var(--rule)] sm:flex"
              title={t.ui.install}
            >
              <IconDownload className="h-4 w-4" />
              {t.ui.install}
            </button>
          )}
          <button
            onClick={onToggleTheme}
            aria-label={t.ui.theme}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text)] transition-colors hover:border-[var(--rule)]"
          >
            {theme === 'dark' ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
          </button>
          <button
            onClick={onToggleLang}
            aria-label={t.ui.langSwitch}
            className="flex h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--border)] px-2 font-mono text-xs font-medium text-[var(--text)] transition-colors hover:border-[var(--rule)]"
          >
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={t.ui.menu}
            aria-controls="mobile-nav"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text)] lg:hidden"
          >
            <IconMenu className="h-4 w-4" />
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-[var(--border)] bg-[var(--bg)] lg:hidden">
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {links.map((l) => (
              <li key={l.to}>
                <a
                  href={`#${l.to}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(l.to);
                    setOpen(false);
                  }}
                  className={`block rounded-lg px-3 py-3 text-sm ${
                    isActive(l.to)
                      ? 'bg-[var(--bg-elevated)] font-medium text-[var(--text-heading)]'
                      : 'text-[var(--text)]'
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};
