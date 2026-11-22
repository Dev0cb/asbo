import React from 'react';
import { STR, type Lang } from '../i18n';
import { AUTHOR } from '../config';
import { track } from '../lib/stats';
import { IconExternal, IconCheck } from './icons';

interface Props {
  lang: Lang;
}

export const AboutPage: React.FC<Props> = ({ lang }) => {
  const a = STR[lang].about;
  const out = (target: string) => () => track('outbound_click', { target });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr]">
        <section>
          <p className="eyebrow">{a.eyebrow}</p>
          <h1 className="mt-4 text-5xl font-semibold leading-none text-[var(--text-heading)] sm:text-6xl">{a.title}</h1>
          <p className="mt-4 text-xl text-[var(--text)]">
            <span className="mark">{a.role}</span>
          </p>
          <p className="mt-8 text-lg leading-relaxed text-[var(--text-muted)]">{a.text}</p>
          <p className="mt-4 text-lg leading-relaxed text-[var(--text-muted)]">{a.mission}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={AUTHOR.portfolio} target="_blank" rel="noopener noreferrer" onClick={out('portfolio')} className="btn-primary">
              {a.links} <IconExternal className="h-4 w-4" />
            </a>
            <a href={AUTHOR.linkedin} target="_blank" rel="noopener noreferrer" onClick={out('linkedin')} className="btn-ghost">
              LinkedIn <IconExternal className="h-4 w-4" />
            </a>
            <a href={AUTHOR.github} target="_blank" rel="noopener noreferrer" onClick={out('github')} className="btn-ghost">
              GitHub <IconExternal className="h-4 w-4" />
            </a>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="card p-6">
            <h2 className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">{a.certsTitle}</h2>
            <ul className="mt-4 divide-y divide-[var(--border)]">
              {a.certs.map((c) => (
                <li key={c.title} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
                  <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent-text)]" />
                  <div>
                    <p className="font-semibold leading-snug text-[var(--text-heading)]">{c.title}</p>
                    <p className="mt-0.5 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">{c.issuer}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-[var(--border)] pt-4 text-sm font-medium text-[var(--text)]">{a.education}</p>
          </div>

          <div className="rounded-[0.625rem] bg-[var(--text-heading)] p-6 text-[var(--bg)]">
            <h2 className="text-2xl font-semibold">{a.partnerTitle}</h2>
            <p className="mt-3 leading-relaxed opacity-85">{a.partnerText}</p>
            <a
              href={AUTHOR.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={out('partnership')}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--bg)] px-4 font-semibold text-[var(--text-heading)] transition-opacity hover:opacity-90"
            >
              {a.partnerCta} <IconExternal className="h-4 w-4" />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
};
