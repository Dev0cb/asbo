import React from 'react';
import { STR, type Lang } from '../i18n';
import { IconAlert, IconArrow } from './icons';
import { LetterGenerator } from './LetterGenerator';

interface Props {
  lang: Lang;
}

const RIGHTS = [
  { t: 'r1t', d: 'r1d', a: null },
  { t: 'r2t', d: 'r2d', a: 'r2a' },
  { t: 'r3t', d: 'r3d', a: 'r3a' },
  { t: 'r4t', d: 'r4d', a: 'r4a' },
] as const;

export const RightsPage: React.FC<Props> = ({ lang }) => {
  const r = STR[lang].rights;
  const letterCta = lang === 'fr' ? 'Générer ma lettre' : 'Generate my letter';

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-3xl">
        <p className="eyebrow">{r.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.08] text-[var(--text-heading)] sm:text-5xl">{r.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--text-muted)]">{r.intro}</p>
        <a href="#lettre" className="btn-primary mt-7">
          {letterCta} <IconArrow className="h-4 w-4" />
        </a>
      </header>

      <section className="rule-top mt-14 pt-8">
        <h2 className="text-2xl font-semibold text-[var(--text-heading)]">{r.rightsTitle}</h2>
        <ol className="mt-6 grid gap-px overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
          {RIGHTS.map((item, i) => (
            <li key={item.t} className="bg-[var(--bg-card)] p-6">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-sm text-[var(--text-muted)]">{String(i + 1).padStart(2, '0')}</span>
                {item.a && (
                  <span className="font-mono text-xs uppercase tracking-wider text-[var(--accent-text)]">{r[item.a]}</span>
                )}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-[var(--text-heading)]">{r[item.t]}</h3>
              <p className="mt-2 leading-relaxed text-[var(--text-muted)]">{r[item.d]}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--text-heading)]">{r.howTitle}</h2>
          <ol className="mt-5 space-y-4">
            {r.howSteps.map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--rule)] font-mono text-sm font-medium text-[var(--text-heading)]">
                  {i + 1}
                </span>
                <span className="pt-1 leading-relaxed text-[var(--text)]">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <aside className="flex gap-3 self-start rounded-lg border border-[var(--bad)]/40 bg-[var(--bad)]/5 p-5">
          <IconAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--bad)]" />
          <div>
            <p className="font-semibold text-[var(--text-heading)]">{r.warnTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">{r.warnText}</p>
          </div>
        </aside>
      </section>

      <LetterGenerator lang={lang} />
    </div>
  );
};
