import React, { useState } from 'react';
import { STR, type Lang } from '../i18n';
import { GUIDES } from '../data/guides';
import { navigate } from '../lib/router';
import { track } from '../lib/stats';
import { AUTHOR } from '../config';
import { Reveal } from './Reveal';
import { FlagSN, GUIDE_ICONS, IconAlert, IconArrow, IconCheck, IconShield } from './icons';

interface Props {
  lang: Lang;
}

const TOOLS_COUNT = 7;

/** Internal link that keeps hash routing (and analytics) consistent. */
const Go: React.FC<{ to: string; className?: string; children: React.ReactNode }> = ({ to, className, children }) => (
  <a
    href={`#${to}`}
    onClick={(e) => {
      e.preventDefault();
      navigate(to);
    }}
    className={className}
  >
    {children}
  </a>
);

/* ------------------------------ Hero ------------------------------ */

const Specimens: React.FC<{ lang: Lang }> = ({ lang }) => {
  const h = STR[lang].home;
  return (
    <figure className="relative mx-auto w-full max-w-md lg:mx-0" aria-label={h.specimenLabel}>
      <figcaption className="mb-4 font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {h.specimenLabel}
      </figcaption>
      <ul className="space-y-3">
        {h.specimens.map((m, i) => (
          <li
            key={m.from}
            className="card relative p-4 pr-24 shadow-[0_1px_0_var(--border)]"
            style={{ marginLeft: `${i * 14}px`, marginRight: `${(2 - i) * 14}px` }}
          >
            <p className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span className="font-mono uppercase tracking-wider">{m.channel}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate font-medium text-[var(--text-heading)]">{m.from}</span>
            </p>
            <p className="mt-1.5 text-sm leading-snug text-[var(--text)]">{m.text}</p>
            <span
              className="stamp absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: m.scam ? 'var(--bad)' : 'var(--good)', transform: `translateY(-50%) rotate(${m.scam ? -8 : 6}deg)` }}
            >
              {m.scam ? h.specimenScam : h.specimenSafe}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
};

const Hero: React.FC<{ lang: Lang }> = ({ lang }) => {
  const h = STR[lang].home;
  const stats = [
    { value: String(GUIDES[lang].length), label: h.stats1 },
    { value: String(TOOLS_COUNT), label: h.stats2 },
    { value: '0 F', label: h.stats3 },
  ];
  return (
    <section className="relative">
      <div className="dot-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div className="grid items-center gap-14 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.25fr_1fr] lg:pb-24">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">{h.badge}</span>
            <span className="chip gap-1.5">
              <FlagSN className="h-3 w-[18px] rounded-[2px]" />
              {h.madeIn}
            </span>
          </div>
          <h1 className="mt-7 text-[2.75rem] font-semibold leading-[1.02] text-[var(--text-heading)] sm:text-6xl lg:text-7xl">
            {h.titleA} <span className="mark italic">{h.titleB}</span>
          </h1>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.14em] text-[var(--accent-text)]">{h.meaning}</p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--text)] sm:text-xl">{h.sub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Go to="/outils/quiz" className="btn-primary px-6 text-base">
              {h.ctaQuiz} <IconArrow className="h-4 w-4" />
            </Go>
            <Go to="/guides" className="btn-ghost px-6 text-base">
              {h.ctaGuides}
            </Go>
          </div>
          <dl className="mt-12 grid max-w-xl grid-cols-3 divide-x divide-[var(--border)] border-y border-[var(--border)]">
            {stats.map((s) => (
              <div key={s.label} className="px-3 py-4 first:pl-0">
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-3xl font-semibold text-[var(--text-heading)]">{s.value}</dd>
                <dd className="mt-1 text-xs leading-snug text-[var(--text-muted)] sm:text-sm">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Specimens lang={lang} />
      </div>
    </section>
  );
};

/* ----------------------------- Ticker ----------------------------- */

const Ticker: React.FC<{ lang: Lang }> = ({ lang }) => {
  const h = STR[lang].home;
  // Moving content must be pausable (WCAG 2.2.2): tap toggles it,
  // keyboard focus and hover pause it (see .ticker in index.css).
  const [paused, setPaused] = useState(false);
  return (
    <section className="border-y border-[var(--rule)] bg-[var(--bg-elevated)] py-3.5">
      <div className="flex items-center gap-4">
        <span className="flex shrink-0 items-center gap-2 pl-1 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--bad)]">
          <IconAlert className="h-4 w-4" />
          <span className="hidden sm:inline">{h.tickerLabel}</span>
        </span>
        <div
          className={`ticker flex-1 ${paused ? 'is-paused' : ''}`}
          role="region"
          tabIndex={0}
          aria-label={h.tickerLabel}
          onClick={() => setPaused((v) => !v)}
        >
          <div className="ticker-track">
            {[...h.ticker, ...h.ticker].map((item, i) => (
              <span
                key={i}
                aria-hidden={i >= h.ticker.length}
                className="flex items-center gap-2.5 whitespace-nowrap text-sm text-[var(--text)]"
              >
                <span className="h-1.5 w-1.5 rotate-45 bg-[var(--bad)]" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------ Why ------------------------------- */

const Why: React.FC<{ lang: Lang }> = ({ lang }) => {
  const h = STR[lang].home;
  const items = (['why1', 'why2', 'why3', 'why4'] as const).map((k) => ({
    t: h[`${k}t` as const],
    d: h[`${k}d` as const],
  }));
  return (
    <section className="py-20 sm:py-28">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <p className="eyebrow">{h.whyEyebrow}</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight text-[var(--text-heading)] sm:text-[2.6rem]">{h.whyTitle}</h2>
          <p className="mt-5 text-lg leading-relaxed text-[var(--text-muted)]">{h.whyLead}</p>
        </Reveal>
        <ol className="grid gap-px overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
          {items.map((it, i) => (
            <li key={it.t} className="bg-[var(--bg-card)] p-6">
              <span className="font-mono text-sm text-[var(--accent-text)]">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 text-lg font-semibold leading-snug text-[var(--text-heading)]">{it.t}</h3>
              <p className="mt-2.5 leading-relaxed text-[var(--text-muted)]">{it.d}</p>
            </li>
          ))}
        </ol>
      </div>
      <Reveal>
        <blockquote className="mt-16 border-l-4 border-[var(--ochre)] pl-6 sm:pl-8">
          <p className="font-display text-2xl font-medium italic leading-snug text-[var(--text-heading)] sm:text-4xl">
            « {h.missionQuote} »
          </p>
          <footer className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
            — {AUTHOR.name}, {lang === 'fr' ? 'concepteur d\'ASBO' : 'designer of ASBO'}
          </footer>
        </blockquote>
      </Reveal>
    </section>
  );
};

/* ----------------------------- Guides ----------------------------- */

const Guides: React.FC<{ lang: Lang }> = ({ lang }) => {
  const t = STR[lang];
  const h = t.home;
  const guides = GUIDES[lang];
  return (
    <section className="rule-top py-16 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="eyebrow">{h.themesEyebrow}</p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--text-heading)] sm:text-[2.6rem]">{h.themesTitle}</h2>
          <p className="mt-4 text-lg text-[var(--text-muted)]">{h.themesLead}</p>
        </div>
        <Go to="/guides" className="btn-ghost">
          {t.nav.guides} ({guides.length}) <IconArrow className="h-4 w-4" />
        </Go>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guides.slice(0, 6).map((g, i) => {
          const Icon = GUIDE_ICONS[g.icon] || IconShield;
          return (
            <Reveal key={g.slug} delay={(i % 3) * 70}>
              <Go to={`/guides/${g.slug}`} className="card card-hover group flex h-full flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="icon-tile h-10 w-10 border border-[var(--border)] text-[var(--accent-text)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-[var(--text-muted)]">
                    {String(i + 1).padStart(2, '0')} · {g.minutes} min
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold leading-snug text-[var(--text-heading)]">{g.title}</h3>
                <p className="mt-2 line-clamp-2 flex-1 leading-relaxed text-[var(--text-muted)]">{g.intro}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent-text)]">
                  {h.readGuide}
                  <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Go>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};

/* ------------------------------ Tools ----------------------------- */

const Tools: React.FC<{ lang: Lang }> = ({ lang }) => {
  const h = STR[lang].home;
  const tools = [
    { t: h.tool1t, d: h.tool1d, to: '/outils/vrai-ou-arnaque' },
    { t: h.tool2t, d: h.tool2d, to: '/outils/mot-de-passe' },
    { t: h.tool3t, d: h.tool3d, to: '/outils/vos-donnees' },
    { t: h.tool4t, d: h.tool4d, to: '/droits' },
  ];
  return (
    <section className="rule-top py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="eyebrow">{h.toolsEyebrow}</p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--text-heading)] sm:text-[2.6rem]">{h.toolsTitle}</h2>
          <Go to="/outils" className="btn-ghost mt-8">
            {h.toolsCta} <IconArrow className="h-4 w-4" />
          </Go>
        </div>
        <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {tools.map((tool, i) => (
            <li key={tool.to}>
              <Go to={tool.to} className="group flex items-start gap-5 py-6">
                <span className="pt-1 font-mono text-sm text-[var(--text-muted)]">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1">
                  <span className="block text-xl font-semibold text-[var(--text-heading)] group-hover:underline group-hover:decoration-[var(--ochre)] group-hover:decoration-2 group-hover:underline-offset-4">
                    {tool.t}
                  </span>
                  <span className="mt-1.5 block leading-relaxed text-[var(--text-muted)]">{tool.d}</span>
                </span>
                <IconArrow className="mt-1.5 h-5 w-5 shrink-0 text-[var(--text-heading)] transition-transform group-hover:translate-x-1" />
              </Go>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

/* --------------------------- Rights band -------------------------- */

const RightsBand: React.FC<{ lang: Lang }> = ({ lang }) => {
  const h = STR[lang].home;
  return (
    <section className="py-8">
      <Reveal>
        <div className="grid gap-8 rounded-xl bg-[var(--text-heading)] p-8 text-[var(--bg)] sm:p-12 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] opacity-75">{h.rightsEyebrow}</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-[2.6rem]">{h.rightsTitle}</h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed opacity-85">{h.rightsText}</p>
          </div>
          <div className="lg:justify-self-end">
            <Go
              to="/droits"
              className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[var(--bg)] px-6 text-base font-semibold text-[var(--text-heading)] transition-opacity hover:opacity-90"
            >
              {h.rightsCta} <IconArrow className="h-4 w-4" />
            </Go>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

/* ----------------------------- Author ----------------------------- */

const Author: React.FC<{ lang: Lang }> = ({ lang }) => {
  const t = STR[lang];
  const h = t.home;
  return (
    <section className="py-16 sm:py-20">
      <Reveal>
        <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:gap-12">
          <div
            className="flex h-28 w-28 items-center justify-center rounded-full border border-[var(--rule)] font-display text-4xl font-semibold text-[var(--text-heading)]"
            aria-hidden="true"
          >
            MB
          </div>
          <div>
            <p className="eyebrow">{h.authorEyebrow}</p>
            <h2 className="mt-3 text-4xl font-semibold text-[var(--text-heading)]">{AUTHOR.name}</h2>
            <p className="mt-2 text-lg text-[var(--text)]">{h.authorRole}</p>
            <p className="mt-5 max-w-3xl leading-relaxed text-[var(--text-muted)]">{h.authorText}</p>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">{h.authorCerts}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {t.about.certs.map((c) => (
                <li key={c.title} className="chip gap-1.5 border-[var(--rule)]/30 py-1.5 text-[13px] text-[var(--text-heading)]">
                  <IconCheck className="h-3.5 w-3.5 text-[var(--accent-text)]" />
                  {c.title}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Go to="/auteur" className="btn-primary">
                {h.authorCta} <IconArrow className="h-4 w-4" />
              </Go>
              <a
                href={AUTHOR.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('outbound_click', { target: 'portfolio' })}
                className="btn-ghost"
              >
                malickba.me
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export const Home: React.FC<Props> = ({ lang }) => (
  <div className="mx-auto max-w-6xl px-4 sm:px-6">
    <Hero lang={lang} />
    <Ticker lang={lang} />
    <Why lang={lang} />
    <Guides lang={lang} />
    <Tools lang={lang} />
    <RightsBand lang={lang} />
    <Author lang={lang} />
  </div>
);
