import React from 'react';
import { STR, type Lang } from '../i18n';
import { IconAlert, IconArrow } from './icons';
import { scrollToId } from '../lib/router';
import { LetterGenerator } from './LetterGenerator';
import { AUTHORITIES, AUTHORITY_STR } from '../data/letters';
import { useCountry, type RightsArticles } from '../lib/country';

interface Props {
  lang: Lang;
}

const RIGHTS: { t: 'r1t' | 'r2t' | 'r3t' | 'r4t'; d: 'r1d' | 'r2d' | 'r3d' | 'r4d'; a: keyof RightsArticles | null }[] = [
  { t: 'r1t', d: 'r1d', a: null },
  { t: 'r2t', d: 'r2d', a: 'access' },
  { t: 'r3t', d: 'r3d', a: 'rectification' },
  { t: 'r4t', d: 'r4d', a: 'objection' },
];

export const RightsPage: React.FC<Props> = ({ lang }) => {
  const r = STR[lang].rights;
  const au = AUTHORITY_STR[lang];
  const letterCta = lang === 'fr' ? 'Générer ma lettre' : 'Generate my letter';
  const { country } = useCountry();
  const steps = r.howSteps.map((step, i) =>
    i === r.howSteps.length - 1
      ? `${step} ${country.authority ? r.authorityFor(country.name[lang], country.authority.name) : r.authorityUnknown}`
      : step,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-3xl">
        <p className="eyebrow">{country.authority ? country.authority.lawShort : r.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.08] text-[var(--text-heading)] sm:text-5xl">{r.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--text-muted)]">{r.intro}</p>
        <a
          href="#lettre"
          onClick={(e) => {
            e.preventDefault();
            scrollToId('lettre');
          }}
          className="btn-primary mt-7"
        >
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
                {item.a && country.articles && (
                  <span className="font-mono text-xs uppercase tracking-wider text-[var(--accent-text)]">
                    {r.articleLabel(country.articles[item.a])}
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-[var(--text-heading)]">{r[item.t]}</h3>
              <p className="mt-2 leading-relaxed text-[var(--text-muted)]">{r[item.d]}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--text-heading)]">{r.howTitle}</h2>
          <ol className="mt-5 space-y-4">
            {steps.map((step, i) => (
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

      <section className="rule-top mt-16 pt-8" aria-labelledby="authorities-title">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div>
            <p className="eyebrow">{au.eyebrow}</p>
            <h2 id="authorities-title" className="mt-3 text-3xl font-semibold text-[var(--text-heading)]">{au.title}</h2>
            <p className="mt-4 leading-relaxed text-[var(--text)]">{au.p1}</p>
            <p className="mt-3 leading-relaxed text-[var(--text-muted)]">{au.p2}</p>
            <p className="mt-3 leading-relaxed text-[var(--text-muted)]">{au.p3}</p>
          </div>
          <div>
            <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--rule)] font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    <th scope="col" className="px-4 py-3 font-medium">{au.colCountry}</th>
                    <th scope="col" className="px-4 py-3 font-medium">{au.colAuthority}</th>
                    <th scope="col" className="px-4 py-3 font-medium">{au.colLaw}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {AUTHORITIES.map((a, i) => (
                    <tr key={a.law} className={i === 0 ? 'bg-[var(--highlight)]/40' : undefined}>
                      <th scope="row" className="px-4 py-3 font-semibold text-[var(--text-heading)]">{a.country[lang]}</th>
                      <td className="px-4 py-3 text-[var(--text)]">{a.authority}</td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">{a.law}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-[var(--text-muted)]">{au.disclaimer}</p>
          </div>
        </div>
      </section>

      <LetterGenerator lang={lang} />
    </div>
  );
};
