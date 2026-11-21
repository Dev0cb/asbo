import React, { useEffect, useMemo, useState } from 'react';
import { STR, type Lang } from '../i18n';
import { GUIDES, type Guide } from '../data/guides';
import { track } from '../lib/stats';
import { navigate } from '../lib/router';
import { GUIDE_ICONS, IconArrow, IconClock, IconCheck } from './icons';

interface Props {
  lang: Lang;
  slug?: string;
}

export const GuidesPage: React.FC<Props> = ({ lang, slug }) => {
  const t = STR[lang];
  const guides = GUIDES[lang];

  if (slug) {
    const guide = guides.find((g) => g.slug === slug);
    if (!guide) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <p className="text-lg text-[var(--text-muted)]">{t.common.notFound}</p>
          <a href="#/guides" className="btn-ghost mt-6">{t.guides.back}</a>
        </div>
      );
    }
    return <GuideArticle lang={lang} guide={guide} guides={guides} />;
  }

  return <GuidesIndex lang={lang} guides={guides} />;
};

/* ---------------- Index ---------------- */

const GuidesIndex: React.FC<{ lang: Lang; guides: Guide[] }> = ({ lang, guides }) => {
  const t = STR[lang];
  const [q, setQ] = useState('');

  useEffect(() => {
    track('page_view', { page: 'guides' });
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return guides;
    return guides.filter(
      (g) =>
        g.title.toLowerCase().includes(needle) ||
        g.intro.toLowerCase().includes(needle) ||
        g.sections.some(
          (s) =>
            s.heading?.toLowerCase().includes(needle) ||
            s.body?.some((p) => p.toLowerCase().includes(needle)) ||
            s.list?.some((l) => l.toLowerCase().includes(needle)),
        ),
    );
  }, [q, guides]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-heading)] sm:text-4xl">
        {t.guides.title}
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--text-muted)]">{t.guides.intro}</p>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.guides.search}
        className="input mt-6 max-w-md"
        aria-label={t.guides.search}
      />
      {filtered.length === 0 ? (
        <p className="mt-10 text-[var(--text-muted)]">{t.guides.empty}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => {
            const Icon = GUIDE_ICONS[g.icon] || IconCheck;
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
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="chip">
                    <IconClock className="mr-1 h-3.5 w-3.5" />
                    {g.minutes} {t.ui.minutes}
                  </span>
                </div>
                <h2 className="mt-4 font-semibold leading-snug text-[var(--text-heading)] group-hover:text-[var(--color-accent)]">
                  {g.title}
                </h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--text-muted)]">
                  {g.intro}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)]">
                  <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ---------------- Article ---------------- */

const GuideArticle: React.FC<{ lang: Lang; guide: Guide; guides: Guide[] }> = ({
  lang,
  guide,
  guides,
}) => {
  const t = STR[lang];

  useEffect(() => {
    track('guide_view', { slug: guide.slug, lang });
    window.scrollTo({ top: 0 });
  }, [guide.slug, lang]);

  const idx = guides.findIndex((g) => g.slug === guide.slug);
  const prev = guides[(idx - 1 + guides.length) % guides.length];
  const next = guides[(idx + 1) % guides.length];
  const related = guides.filter((g) => g.slug !== guide.slug).slice(0, 3);
  const Icon = GUIDE_ICONS[guide.icon] || IconCheck;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <a
        href="#/guides"
        onClick={(e) => {
          e.preventDefault();
          navigate('/guides');
        }}
        className="text-sm text-[var(--text-muted)] hover:text-[var(--color-accent)]"
      >
        ← {t.guides.back}
      </a>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip capitalize">{guide.level}</span>
          <span className="chip">
            <IconClock className="mr-1 h-3.5 w-3.5" />
            {guide.minutes} {t.ui.minutes}
          </span>
        </div>
        <div className="mt-4 flex items-start gap-4">
          <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] sm:flex">
            <Icon className="h-8 w-8" />
          </span>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[var(--text-heading)] sm:text-4xl">
            {guide.title}
          </h1>
        </div>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text-muted)]">{guide.intro}</p>
      </header>

      <div className="mt-8 space-y-8">
        {guide.sections.map((s, i) => (
          <section key={i} className="card p-5 sm:p-6">
            {s.heading && (
              <h2 className="text-lg font-bold text-[var(--text-heading)]">{s.heading}</h2>
            )}
            {s.body?.map((p, j) => (
              <p key={j} className="mt-3 leading-relaxed text-[var(--text-muted)]">
                {p}
              </p>
            ))}
            {s.list && (
              <ul className="mt-3 space-y-2.5">
                {s.list.map((item, j) => (
                  <li key={j} className="flex gap-3 text-[var(--text-muted)]">
                    <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--good)]" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-muted)]">
        {t.guides.disclaimer}
      </p>

      <nav className="mt-8 grid gap-3 sm:grid-cols-2">
        <a
          href={`#/guides/${prev.slug}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/guides/${prev.slug}`);
          }}
          className="card p-4 text-sm transition-colors hover:border-[var(--color-accent)]"
        >
          <span className="text-xs text-[var(--text-muted)]">← {t.guides.prev}</span>
          <p className="mt-1 font-medium text-[var(--text-heading)]">{prev.title}</p>
        </a>
        <a
          href={`#/guides/${next.slug}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/guides/${next.slug}`);
          }}
          className="card p-4 text-right text-sm transition-colors hover:border-[var(--color-accent)]"
        >
          <span className="text-xs text-[var(--text-muted)]">{t.guides.next} →</span>
          <p className="mt-1 font-medium text-[var(--text-heading)]">{next.title}</p>
        </a>
      </nav>

      <div className="mt-10">
        <h2 className="text-lg font-bold text-[var(--text-heading)]">{t.guides.related}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {related.map((g) => {
            const RI = GUIDE_ICONS[g.icon] || IconCheck;
            return (
              <a
                key={g.slug}
                href={`#/guides/${g.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/guides/${g.slug}`);
                }}
                className="card flex items-center gap-3 p-4 text-sm transition-colors hover:border-[var(--color-accent)]"
              >
                <RI className="h-5 w-5 shrink-0 text-[var(--color-accent)]" />
                <span className="line-clamp-2 font-medium text-[var(--text-heading)]">{g.title}</span>
              </a>
            );
          })}
        </div>
      </div>
    </article>
  );
};
