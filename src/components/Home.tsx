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
  IconAlert,
  GUIDE_ICONS,
} from './icons';
import { Reveal } from './Reveal';
import { AUTHOR } from '../config';

interface Props {
  lang: Lang;
}

const THEME_KEYS = ['theme1', 'theme2', 'theme3', 'theme4', 'theme5', 'theme6'] as const;

// Per-guide accent colors for icon tiles
const ICON_COLORS: Record<string, string> = {
  phish: '#f87171',
  money: '#34d399',
  key: '#fbbf24',
  share: '#38bdf8',
  phone: '#a78bfa',
  wifi: '#22d3ee',
  child: '#f472b6',
  news: '#fb923c',
  alert: '#f87171',
};

export const Home: React.FC<Props> = ({ lang }) => {
  const t = STR[lang];

  useEffect(() => {
    track('page_view', { page: 'home' });
  }, []);

  const guides = GUIDES[lang];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden pb-14 pt-16 sm:pt-24">
        <div className="hero-bg" aria-hidden="true" />
        <div className="relative">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className="chip border-[var(--color-accent)]/50 text-[var(--color-accent)]">
                <span className="pulse-dot mr-1.5 inline-block h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                {t.home.badge}
              </span>
              <span className="chip">🇸🇳 {lang === 'fr' ? 'Fait au Sénégal' : 'Made in Senegal'}</span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 max-w-4xl text-[2.6rem] font-extrabold leading-[1.05] tracking-tight text-[var(--text-heading)] sm:text-6xl lg:text-7xl">
              {t.home.titleA}{' '}
              <span className="text-gradient">{t.home.titleB}</span>{' '}
              {t.home.titleC}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--text-muted)] sm:text-xl">
              {t.home.sub}
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#/outils"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/outils');
                }}
                className="btn-primary px-6 py-3.5 text-base"
              >
                <IconTool className="h-5 w-5" />
                {t.home.ctaQuiz}
              </a>
              <a
                href="#/guides"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/guides');
                }}
                className="btn-ghost px-6 py-3.5 text-base"
              >
                <IconBook className="h-5 w-5" />
                {t.home.ctaGuides}
              </a>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <ul className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                { icon: IconBook, label: t.home.stats1, color: '#38bdf8' },
                { icon: IconTool, label: t.home.stats2, color: '#34d399' },
                { icon: IconShield, label: t.home.stats3, color: '#f59e0b' },
              ].map(({ icon: Icon, label, color }) => (
                <li key={label} className="card flex items-center gap-3.5 px-5 py-4">
                  <span
                    className="icon-tile h-10 w-10"
                    style={{ background: `${color}1a`, color }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium text-[var(--text)]">{label}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ============ SCAM TICKER ============ */}
      <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)]/60 py-4">
        <div className="flex items-center gap-4">
          <span className="flex shrink-0 items-center gap-2 px-4 text-xs font-bold uppercase tracking-widest text-[var(--bad)] sm:px-6">
            <IconAlert className="h-4 w-4" />
            <span className="hidden sm:inline">{t.home.tickerLabel}</span>
          </span>
          <div className="ticker flex-1">
            <div className="ticker-track">
              {[...t.home.ticker, ...t.home.ticker].map((item, i) => (
                <span key={i} className="flex items-center gap-2 whitespace-nowrap text-sm text-[var(--text-muted)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--bad)]" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHY ============ */}
      <section className="py-16">
        <Reveal>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-heading)] sm:text-4xl">
            {t.home.whyTitle}
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {(['why1', 'why2', 'why3'] as const).map((k, i) => (
            <Reveal key={k} delay={i * 100}>
              <div className="card card-hover h-full p-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-3xl font-bold text-[var(--color-accent)]/30">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-bold leading-snug text-[var(--text-heading)]">
                    {t.home[`${k}t` as const]}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                  {t.home[`${k}d` as const]}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ THEMES + GUIDES ============ */}
      <section className="border-t border-[var(--border)] py-16">
        <Reveal>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-heading)] sm:text-4xl">
            {t.home.themesTitle}
          </h2>
        </Reveal>
        <div className="mt-7 flex flex-wrap gap-2.5">
          {THEME_KEYS.map((k) => (
            <a
              key={k}
              href="#/guides"
              onClick={(e) => {
                e.preventDefault();
                navigate('/guides');
              }}
              className="chip transition-all hover:border-[var(--color-accent)] hover:text-[var(--text-heading)]"
            >
              {t.home[k]}
            </a>
          ))}
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {guides.slice(0, 6).map((g, i) => {
            const Icon = GUIDE_ICONS[g.icon] || IconShield;
            const color = ICON_COLORS[g.icon] || '#f59e0b';
            return (
              <Reveal key={g.slug} delay={(i % 3) * 90}>
                <a
                  href={`#/guides/${g.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/guides/${g.slug}`);
                  }}
                  className="card card-hover group flex h-full flex-col p-6"
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="icon-tile h-12 w-12"
                      style={{ background: `${color}1a`, color }}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="chip">{g.minutes} min</span>
                  </div>
                  <h3 className="mt-4 font-bold leading-snug text-[var(--text-heading)] transition-colors group-hover:text-[var(--color-accent)]">
                    {g.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-[var(--text-muted)]">
                    {g.intro}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)]">
                    {lang === 'fr' ? 'Lire le guide' : 'Read guide'}
                    <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>
        <Reveal>
          <div className="mt-10 text-center">
            <a
              href="#/guides"
              onClick={(e) => {
                e.preventDefault();
                navigate('/guides');
              }}
              className="btn-ghost"
            >
              {t.nav.guides} ({guides.length}) <IconArrow className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </section>

      {/* ============ CDP BANNER ============ */}
      <section className="py-16">
        <Reveal>
          <div className="card relative overflow-hidden p-7 sm:p-10">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[var(--sn-green)]/15 blur-3xl" />
            <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-[var(--color-accent)]/10 blur-3xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="icon-tile h-12 w-12 bg-[var(--sn-green)]/15 text-[var(--sn-green)]">
                    <IconScale className="h-6 w-6" />
                  </span>
                  <h2 className="text-2xl font-extrabold text-[var(--text-heading)] sm:text-3xl">
                    {t.home.cdpTitle}
                  </h2>
                </div>
                <p className="mt-4 leading-relaxed text-[var(--text-muted)]">{t.home.cdpText}</p>
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
        </Reveal>
      </section>

      {/* ============ TOOLS ============ */}
      <section className="border-t border-[var(--border)] py-16">
        <Reveal>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-heading)] sm:text-4xl">
            {t.home.toolsTitle}
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {([
            ['tool1t', 'tool1d', IconTool, '#38bdf8'],
            ['tool2t', 'tool2d', IconAlert, '#f87171'],
            ['tool3t', 'tool3d', IconShield, '#34d399'],
          ] as const).map(([tk, dk, Icon, color], i) => (
            <Reveal key={tk} delay={i * 100}>
              <div className="card card-hover h-full p-6">
                <span className="icon-tile h-12 w-12" style={{ background: `${color}1a`, color: color as string }}>
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-bold text-[var(--text-heading)]">{t.home[tk]}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{t.home[dk]}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ AUTHOR ============ */}
      <section className="pb-16">
        <Reveal>
          <div className="card overflow-hidden">
            <div className="flag-bar" />
            <div className="flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
              <div className="max-w-2xl">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
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
          </div>
        </Reveal>
      </section>
    </div>
  );
};
