import React, { useMemo, useState } from 'react';
import type { Lang } from '../../i18n';
import { IconArrow, IconDownload, IconLogout } from '../icons';
import {
  cleanRows,
  delta,
  describe,
  dailyCsv,
  inRange,
  kpis,
  languages,
  periodWindow,
  phishingSuccess,
  quizLevels,
  toolUsage,
  topGuides,
  visitorSeries,
  type EventRow,
  type Kpis,
  type PeriodDays,
} from './aggregate';
import { ChartCard, LineChart, Meter, RankedBars, SegmentBar, fmt } from './charts';
import { dashStrings } from './strings';

const PERIODS: PeriodDays[] = [7, 30, 90, 0];
const RECENT_COUNT = 12;

interface Props {
  lang: Lang;
  rows: EventRow[];
  fetchedAt: number;
  refreshing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<Props> = ({ lang, rows: rawRows, fetchedAt, refreshing, onRefresh, onLogout }) => {
  const s = dashStrings(lang);
  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';
  const [period, setPeriod] = useState<PeriodDays>(30);

  const rows = useMemo(() => cleanRows(rawRows), [rawRows]);
  const win = useMemo(() => periodWindow(period, rows), [period, rows]);
  const current = useMemo(() => inRange(rows, win.start, win.end + 1), [rows, win]);
  const previous = useMemo(
    () => (win.prevStart === null ? null : inRange(rows, win.prevStart, win.start)),
    [rows, win],
  );

  const k = useMemo(() => kpis(current), [current]);
  const kPrev = useMemo(() => (previous ? kpis(previous) : null), [previous]);
  const series = useMemo(() => visitorSeries(current, win), [current, win]);
  const guides = useMemo(() => topGuides(current, lang), [current, lang]);
  const tools = useMemo(() => toolUsage(current, s), [current, s]);
  const quiz = useMemo(() => quizLevels(current), [current]);
  const phishing = useMemo(() => phishingSuccess(current), [current]);
  const langs = useMemo(() => languages(current), [current]);
  const recent = current.slice(0, RECENT_COUNT);

  const dayFmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  const longFmt = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  const timeFmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const rel = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const ago = (iso: string) => {
    const min = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
    if (Math.abs(min) < 60) return rel.format(min, 'minute');
    const h = Math.round(min / 60);
    if (Math.abs(h) < 24) return rel.format(h, 'hour');
    return timeFmt.format(new Date(iso));
  };

  const tableLabels = { show: s.showNumbers, label: s.colLabel, value: s.colValue };
  const exportCsv = () => {
    const blob = new Blob([dailyCsv(current, win, s)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asbo-statistiques-${period || 'tout'}j.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const kpiTiles: { key: keyof Kpis; label: string; help: string }[] = [
    { key: 'visitors', label: s.kpi.visitors, help: s.kpi.visitorsHelp },
    { key: 'pages', label: s.kpi.pages, help: s.kpi.pagesHelp },
    { key: 'guides', label: s.kpi.guides, help: s.kpi.guidesHelp },
    { key: 'exercises', label: s.kpi.exercises, help: s.kpi.exercisesHelp },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">ASBO</p>
          <h1 className="mt-3 text-4xl font-semibold text-[var(--text-heading)]">{s.title}</h1>
          <p className="mt-2 text-[var(--text-muted)]">{s.subtitle}</p>
        </div>
        <button type="button" onClick={onLogout} className="btn-ghost">
          <IconLogout className="h-4 w-4" />
          {lang === 'fr' ? 'Déconnexion' : 'Sign out'}
        </button>
      </div>

      {/* Filters: one row, above everything they scope */}
      <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-[var(--border)] py-3">
        <span className="text-sm font-medium text-[var(--text-muted)]">{s.period}</span>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={s.period}>
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={period === p}
              onClick={() => setPeriod(p)}
              className={`min-h-11 rounded-lg px-3.5 text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-[var(--text-heading)] text-[var(--bg)]'
                  : 'border border-[var(--border)] text-[var(--text)] hover:border-[var(--rule)]'
              }`}
            >
              {s.periods[p]}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">
            {s.updated} {timeFmt.format(new Date(fetchedAt))}
          </span>
          <button type="button" onClick={onRefresh} disabled={refreshing} className="btn-ghost">
            {s.refresh}
          </button>
          <button type="button" onClick={exportCsv} className="btn-ghost">
            <IconDownload className="h-4 w-4" />
            {s.exportCsv}
          </button>
        </div>
      </div>

      <div className={`transition-opacity ${refreshing ? 'opacity-60' : ''}`}>
        {/* Plain-language summary */}
        <p className="mt-8 max-w-3xl font-display text-2xl leading-snug text-[var(--text-heading)]">
          {current.length ? s.summary(s.periods[period], k.visitors, guides[0]?.label) : s.empty}
        </p>

        {/* Headline figures */}
        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--border)] lg:grid-cols-4">
          {kpiTiles.map(({ key, label, help }) => {
            const d = delta(k[key], kPrev ? kPrev[key] : null);
            const up = d !== null && d > 0;
            const down = d !== null && d < 0;
            return (
              <div key={key} className="bg-[var(--bg-card)] p-5">
                <dt className="text-sm font-medium text-[var(--text)]">{label}</dt>
                <dd className="mt-2 font-sans text-4xl font-semibold text-[var(--text-heading)]">{fmt(k[key], locale)}</dd>
                <dd className="mt-2 text-xs text-[var(--text-muted)]">{help}</dd>
                {kPrev && (
                  <dd className="mt-2 flex items-center gap-1.5 text-xs">
                    {d === null ? (
                      <span className="text-[var(--text-muted)]">{kPrev[key] === 0 && k[key] > 0 ? s.newPeriod : '—'}</span>
                    ) : (
                      <>
                        <IconArrow
                          className={`h-3.5 w-3.5 ${up ? '-rotate-45 text-[var(--good)]' : down ? 'rotate-45 text-[var(--bad)]' : 'text-[var(--text-muted)]'}`}
                          aria-hidden="true"
                        />
                        <span className="whitespace-nowrap font-semibold text-[var(--text-heading)]">
                          {d > 0 ? '+' : ''}
                          {Math.round(d * 100)} %
                        </span>
                        <span className="text-[var(--text-muted)]">{s.vsPrevious}</span>
                      </>
                    )}
                  </dd>
                )}
              </div>
            );
          })}
        </dl>

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <ChartCard
            title={series.weekly ? s.visitorsChartWeek : s.visitorsChart}
            help={s.visitorsChartHelp}
            className="lg:col-span-2"
            table={series.points.map((p) => ({ label: longFmt.format(new Date(p.t)), value: fmt(p.value, locale) }))}
            tableLabels={{ ...tableLabels, label: s.colDate }}
          >
            <LineChart
              points={series.points}
              locale={locale}
              valueLabel={series.weekly ? s.visitorsChartWeek : s.visitorsChart}
              formatX={(t) => dayFmt.format(new Date(t))}
              formatTooltipX={(t) => longFmt.format(new Date(t))}
              partialLabel={s.inProgress}
            />
          </ChartCard>

          <ChartCard
            title={s.guidesChart}
            help={s.guidesChartHelp}
            table={guides.map((g) => ({ label: g.label, value: fmt(g.value, locale) }))}
            tableLabels={tableLabels}
          >
            <RankedBars items={guides} locale={locale} empty={s.nothingYet} />
          </ChartCard>

          <ChartCard
            title={s.toolsChart}
            help={s.toolsChartHelp}
            table={tools.map((t) => ({ label: t.label, value: fmt(t.value, locale) }))}
            tableLabels={tableLabels}
          >
            <RankedBars items={tools} locale={locale} empty={s.nothingYet} />
          </ChartCard>

          <ChartCard title={s.quizChart} help={s.quizChartHelp}>
            {quiz.low + quiz.mid + quiz.high === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{s.quizNone}</p>
            ) : (
              <SegmentBar
                locale={locale}
                ariaLabel={s.quizChart}
                segments={[
                  { key: 'low', label: s.quizLevels.low, value: quiz.low, color: 'var(--chart-low)', on: 'var(--chart-on-low)' },
                  { key: 'mid', label: s.quizLevels.mid, value: quiz.mid, color: 'var(--chart-mid)', on: 'var(--chart-on-mid)' },
                  { key: 'high', label: s.quizLevels.high, value: quiz.high, color: 'var(--chart-high)', on: 'var(--chart-on-high)' },
                ]}
              />
            )}
          </ChartCard>

          <ChartCard title={s.phishingChart} help={phishing.games ? s.phishingHelp(phishing.games) : undefined}>
            {phishing.games === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{s.phishingNone}</p>
            ) : (
              <Meter value={phishing.rate} label={s.phishingChart} />
            )}
          </ChartCard>

          <ChartCard title={s.langChart}>
            {/* Identity, not quality: one hue — never the quiz status colours. */}
            <RankedBars
              locale={locale}
              empty={s.nothingYet}
              items={[
                { key: 'fr', label: s.langFr, value: langs.fr },
                { key: 'en', label: s.langEn, value: langs.en },
              ].sort((a, b) => b.value - a.value)}
            />
          </ChartCard>

          <ChartCard title={s.recent} help={s.recentHelp}>
            {recent.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{s.nothingYet}</p>
            ) : (
              <ol className="divide-y divide-[var(--border)]">
                {recent.map((r, i) => (
                  <li key={`${r.created_at}-${i}`} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                    <span className="text-[var(--text)]">{describe(r, lang, s)}</span>
                    <time dateTime={r.created_at} className="shrink-0 text-xs text-[var(--text-muted)]">
                      {ago(r.created_at)}
                    </time>
                  </li>
                ))}
              </ol>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
};
