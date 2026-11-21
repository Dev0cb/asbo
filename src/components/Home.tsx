import React, { useEffect } from 'react';
import { STR, type Lang } from '../i18n';
import { GUIDES } from '../data/guides';
import { track } from '../lib/stats';
import { navigate } from '../lib/router';
import {
  IconShield,
  IconBook,
  IconTool,
  IconScale,
  IconArrow,
  IconExternal,
  GUIDE_ICONS,
} from './icons';
import { AUTHOR } from '../config';

interface Props {
  lang: Lang;
}

const THEME_KEYS = ['theme1', 'theme2', 'theme3', 'theme4', 'theme5', 'theme6'] as const;

export const Home: React.FC<Props> = ({ lang }) => {
  const t = STR[lang];

  useEffect(() => {
    track('page_view', { page: 'home' });
  }, []);

  const guides = GUIDES[lang];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* HERO */}
      <section className="pb-12 pt-14 sm:pt-20">
        <span className="chip text-[var(--color-accent)]">{t.home.badge}</span>
        <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-[var(--text-heading)] sm:text-5xl lg:text-6xl">
          {t.home.titleA} <span className="text-[var(--color-accent)]">{t.home.titleB}</span>{' '}
          {t.home.titleC}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--text-muted)]">
          {t.home.sub}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#/guides"
            onClick={(e) => {
              e.preventDefault();
              navigate('/guides');
            }}
            className="btn-primary"
          >
            <IconBook className="h-4 w-4" />
            {t.home.ctaGuides}
          </a>
          <a
            href="#/outils"
            onClick={(e) => {
              e.preventDefault();
              navigate('/outils');
            }}
            className="btn-ghost"
          >
            <IconTool className="h-4 w-4" />
            {t.home.ctaQuiz}
          </a>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {[t.home.stats1, t.home.stats2, t.home.stats3].map((s) => (
            <li key={s} className="card flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-muted)]">
              <IconShield className="h-5 w-5 shrink-0 text-[var(--color-accent)]" />
              {s}
            </li>
          ))}
        </ul>
      </section>

      {/* WHY */}
      <section className="border-t border-[var(--border)] py-12">
        <h2 className="text-2xl font-bold text-[var(--text-heading)]">{t.home.whyTitle}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {(['why1', 'why2', 'why3'] as const).map((k, i) => (
            <div key={k} className="card p-5">
              <p className="font-mono text-xs text-[var(--color-accent)]">0{i + 1}</p>
              <h3 className="mt-2 font-semibold text-[var(--text-heading)]">{t.home[`${k}t` as const]}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{t.home[`${k}d` as const]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THEMES */}
      <section className="border-t border-[var(--border)] py-12">
        <h2 className="text-2xl font-bold text-[var(--text-heading)]">{t.home.themesTitle}</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {THEME_KEYS.map((k) => (
            <a
              key={k}
              href="#/guides"
              onClick={(e) => {
                e.preventDefault();
                navigate('/guides');
              }}
              className="card group p-4 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--text-heading)]"
            >
              {t.home[k]}
            </a>
          ))}
        </div>
        {/* Guide cards preview */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.slice(0, 6).map((g) => {
            const Icon = GUIDE_ICONS[g.icon] || IconShield;
            return (
              <a
                key={g.slug}
                href={`#/guides/${g.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/guides/${g.slug}`);
                }}
                className="card group flex flex-col p-5 transition-colors hover:border-[var(--color-accent)]"
              >
                <div className="flex items-start justify-between">
                  <Icon className="h-8 w-8 text-[var(--color-accent)]" />
                  <span className="chip">{g.minutes} min</span>
                </div>
                <h3 className="mt-3 font-semibold leading-snug text-[var(--text-heading)] group-hover:text-[var(--color-accent)]">
                  {g.title}
                </h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-[var(--text-muted)]">{g.intro}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)]">
                  <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </a>
            );
          })}
        </div>
        <div className="mt-6 text-center">
          <a
            href="#/guides"
            onClick={(e) => {
              e.preventDefault();
              navigate('/guides');
            }}
            className="btn-ghost"
          >
            {t.nav.guides} ({guides.length})
          </a>
        </div>
      </section>

      {/* CDP BANNER */}
      <section className="border-t border-[var(--border)] py-12">
        <div className="card relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[var(--color-accent)]/10 blur-2xl" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[var(--color-accent)]">
                <IconScale className="h-5 w-5" />
                <h2 className="text-xl font-bold text-[var(--text-heading)] sm:text-2xl">{t.home.cdpTitle}</h2>
              </div>
              <p className="mt-3 leading-relaxed text-[var(--text-muted)]">{t.home.cdpText}</p>
            </div>
            <a
              href="#/droits"
              onClick={(e) => {
                e.preventDefault();
                navigate('/droits');
              }}
              className="btn-primary shrink-0"
            >
              {t.home.cdpCta} <IconArrow className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section className="border-t border-[var(--border)] py-12">
        <h2 className="text-2xl font-bold text-[var(--text-heading)]">{t.home.toolsTitle}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {([
            ['tool1t', 'tool1d'],
            ['tool2t', 'tool2d'],
            ['tool3t', 'tool3d'],
          ] as const).map(([tk, dk]) => (
            <div key={tk} className="card p-5">
              <IconTool className="h-7 w-7 text-[var(--color-accent)]" />
              <h3 className="mt-3 font-semibold text-[var(--text-heading)]">{t.home[tk]}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{t.home[dk]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AUTHOR */}
      <section className="border-t border-[var(--border)] py-12">
        <div className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)]">
              {t.home.authorTitle}
            </p>
            <p className="mt-3 leading-relaxed text-[var(--text-muted)]">{t.home.authorText}</p>
          </div>
          <a
            href={AUTHOR.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('outbound_click', { target: 'portfolio' })}
            className="btn-ghost shrink-0"
          >
            {AUTHOR.name} <IconExternal className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
};
