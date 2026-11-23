import React from 'react';
import { STR, type Lang } from '../i18n';
import { AUTHOR } from '../config';
import { navigate } from '../lib/router';
import { AsboMark, IconGitHub, IconGlobe, IconLinkedIn } from './icons';

const linkClass = 'inline-flex min-h-11 items-center gap-1 text-[var(--text-muted)] transition-colors hover:text-[var(--text-heading)]';

export const Footer: React.FC<{ lang: Lang }> = ({ lang }) => {
  const t = STR[lang];
  const internal = [
    { to: '/guides', label: t.nav.guides },
    { to: '/outils', label: t.nav.tools },
    { to: '/droits', label: t.nav.rights },
    { to: '/auteur', label: t.nav.about },
  ];
  const external = [
    { href: AUTHOR.portfolio, label: 'malickba.me', Icon: IconGlobe },
    { href: AUTHOR.linkedin, label: 'LinkedIn', Icon: IconLinkedIn },
    { href: AUTHOR.github, label: 'GitHub', Icon: IconGitHub },
  ];

  return (
    <footer className="mt-24 border-t border-[var(--rule)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <AsboMark className="h-9 w-9" />
              <div className="leading-none">
                <p className="text-lg font-bold text-[var(--text-heading)]">ASBO</p>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Aar Sa Bopp Online
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">{t.home.footerNote}</p>
          </div>
          <nav aria-label="ASBO">
            <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">ASBO</h2>
            <ul className="mt-2 text-sm">
              {internal.map((l) => (
                <li key={l.to}>
                  <a
                    href={`#${l.to}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(l.to);
                    }}
                    className={linkClass}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">{AUTHOR.name}</h2>
            <ul className="mt-2 text-sm">
              {external.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className={`${linkClass} gap-2.5`}>
                    <l.Icon className="h-4 w-4 shrink-0" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-[var(--border)] pt-6 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} ASBO Platform</span>
          <span>
            {lang === 'fr' ? 'Conçu et développé par ' : 'Designed and built by '}
            <a
              href={AUTHOR.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-medium text-[var(--text-heading)] underline-offset-4 hover:underline"
            >
              {AUTHOR.name}
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};
