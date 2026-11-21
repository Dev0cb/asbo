import React, { useEffect } from 'react';
import { STR, type Lang } from '../i18n';
import { AUTHOR } from '../config';
import { track } from '../lib/stats';
import { IconUser, IconExternal } from './icons';

interface Props {
  lang: Lang;
}

export const AboutPage: React.FC<Props> = ({ lang }) => {
  const t = STR[lang];

  useEffect(() => {
    track('page_view', { page: 'about' });
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="card overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-[var(--color-accent)] to-[var(--good)]" />
        <div className="p-6 sm:p-10">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <IconUser className="h-9 w-9" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-[var(--text-heading)] sm:text-3xl">
                {AUTHOR.name}
              </h1>
              <p className="text-[var(--text-muted)]">{AUTHOR.role}</p>
            </div>
          </div>
          <p className="mt-6 leading-relaxed text-[var(--text-muted)]">{t.about.text}</p>
          <p className="mt-4 leading-relaxed text-[var(--text-muted)]">{t.about.mission}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={AUTHOR.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('outbound_click', { target: 'portfolio' })}
              className="btn-primary"
            >
              {t.about.links} <IconExternal className="h-4 w-4" />
            </a>
            <a
              href={AUTHOR.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('outbound_click', { target: 'linkedin' })}
              className="btn-ghost"
            >
              LinkedIn <IconExternal className="h-4 w-4" />
            </a>
            <a
              href={AUTHOR.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('outbound_click', { target: 'github' })}
              className="btn-ghost"
            >
              GitHub <IconExternal className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-8 border-t border-[var(--border)] pt-5 font-mono text-xs text-[var(--text-muted)]">
            {t.about.built}
          </p>
        </div>
      </div>
    </div>
  );
};
