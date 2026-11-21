import React from 'react';
import { STR, type Lang } from '../i18n';
import { AUTHOR } from '../config';
import { IconExternal, IconShield } from './icons';

export const Footer: React.FC<{ lang: Lang }> = ({ lang }) => {
  const t = STR[lang];
  return (
    <footer className="mt-20 border-t border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 font-bold text-[var(--text-heading)]">
              <IconShield className="h-5 w-5 text-[var(--color-accent)]" />
              Sécurité
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--text-muted)]">
              {t.home.footerNote}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {t.nav.guides}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a className="text-[var(--text-muted)] hover:text-[var(--text-heading)]" href="#/guides">{t.nav.guides}</a></li>
              <li><a className="text-[var(--text-muted)] hover:text-[var(--text-heading)]" href="#/outils">{t.nav.tools}</a></li>
              <li><a className="text-[var(--text-muted)] hover:text-[var(--text-heading)]" href="#/droits">{t.nav.rights}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {t.nav.about}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                  href={AUTHOR.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {AUTHOR.name} <IconExternal className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                  href={AUTHOR.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn <IconExternal className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                  href={AUTHOR.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub <IconExternal className="h-3 w-3" />
                </a>
              </li>
              <li><a className="text-[var(--text-muted)] hover:text-[var(--text-heading)]" href="#/auteur">{t.nav.about}</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[var(--border)] pt-6 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Sécurité — {AUTHOR.name}</span>
          <span>{t.about.built}</span>
        </div>
      </div>
    </footer>
  );
};
