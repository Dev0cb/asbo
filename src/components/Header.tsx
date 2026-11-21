import React, { useEffect, useState } from 'react';
import { STR, type Lang } from '../i18n';
import { navigate } from '../lib/router';
import {
  IconShield,
  IconMenu,
  IconMoon,
  IconSun,
  IconDownload,
  IconLock,
} from './icons';

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
    <header className="sticky top-0 z-50 border-b border-[var(--border)]/80 bg-[var(--bg)]/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          className="flex items-center gap-2 font-bold tracking-tight text-[var(--text-heading)]"
        >
          <IconShield className="h-6 w-6 text-[var(--color-accent)]" />
          <span className="text-lg">
            Sécurité<span className="hidden text-xs font-normal text-[var(--text-muted)] sm:inline"> .sn</span>
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
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive(l.to)
                  ? 'bg-[var(--bg-elevated)] font-medium text-[var(--text-heading)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {installEvt && (
            <button
              onClick={() => installEvt.prompt()}
              className="hidden items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium text-[var(--text)] transition-colors hover:border-[var(--color-accent)] sm:flex"
              title={t.ui.install}
            >
              <IconDownload className="h-4 w-4" />
              {t.ui.install}
            </button>
          )}
          <button
            onClick={onToggleTheme}
            aria-label={t.ui.theme}
            className="rounded-lg border border-[var(--border)] p-2 text-[var(--text)] transition-colors hover:border-[var(--color-accent)]"
          >
            {theme === 'dark' ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
          </button>
          <button
            onClick={onToggleLang}
            aria-label={t.ui.langSwitch}
            className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 font-mono text-xs font-medium text-[var(--text)] transition-colors hover:border-[var(--color-accent)]"
          >
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
          <a
            href="#/admin"
            onClick={(e) => {
              e.preventDefault();
              navigate('/admin');
            }}
            aria-label="Admin"
            className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--text-heading)]"
          >
            <IconLock className="h-4 w-4" />
          </a>
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={t.ui.menu}
            className="rounded-lg border border-[var(--border)] p-2 text-[var(--text)] lg:hidden"
          >
            <IconMenu className="h-4 w-4" />
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-[var(--border)] bg-[var(--bg)] lg:hidden">
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
