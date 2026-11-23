// Dependency-free chart primitives for the admin dashboard.
// Specs follow the dataviz skill: thin marks, 4px rounded data-ends,
// 2px lines, 10% area wash, hairline recessive grid, hover/focus tooltips,
// a table view for every chart, text in text tokens (never the data color).
import React, { useEffect, useId, useRef, useState } from 'react';
import type { Point, Ranked } from './aggregate';

/* ------------------------------ helpers ------------------------------ */

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** 0 → 0, otherwise a "nice" ceiling (1, 2, 5 × 10^n) for the y axis. */
function niceMax(v: number) {
  if (v <= 0) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return Math.max(4, nice * pow);
}

export const fmt = (n: number, locale: string) => n.toLocaleString(locale);

/* ------------------------------ Card + table view ------------------------------ */

export const ChartCard: React.FC<{
  title: string;
  help?: string;
  children: React.ReactNode;
  table?: { label: string; value: string }[];
  tableLabels?: { show: string; label: string; value: string };
  className?: string;
}> = ({ title, help, children, table, tableLabels, className = '' }) => (
  <section className={`card flex min-w-0 flex-col p-5 sm:p-6 ${className}`}>
    <h2 className="font-sans text-base font-semibold text-[var(--text-heading)]">{title}</h2>
    {help && <p className="mt-1 text-sm text-[var(--text-muted)]">{help}</p>}
    <div className="mt-5 flex-1">{children}</div>
    {table && tableLabels && table.length > 0 && (
      <details className="mt-4 border-t border-[var(--border)] pt-3 text-sm">
        <summary className="min-h-11 cursor-pointer py-2 font-medium text-[var(--accent-text)]">{tableLabels.show}</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
              <th scope="col" className="py-1.5 font-medium">{tableLabels.label}</th>
              <th scope="col" className="py-1.5 text-right font-medium">{tableLabels.value}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {table.map((row) => (
              <tr key={row.label}>
                <td className="py-1.5 text-[var(--text)]">{row.label}</td>
                <td className="py-1.5 text-right tabular-nums text-[var(--text-heading)]">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    )}
  </section>
);

/* ------------------------------ Line / area ------------------------------ */

const H = 220;
const PAD = { top: 16, right: 44, bottom: 28, left: 36 };

export const LineChart: React.FC<{
  points: Point[];
  formatX: (t: number) => string;
  formatTooltipX: (t: number) => string;
  locale: string;
  valueLabel: string;
  /** Text appended to the last point's tooltip when its period is still running. */
  partialLabel?: string;
}> = ({ points, formatX, formatTooltipX, locale, valueLabel, partialLabel }) => {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const labelId = useId();
  const n = points.length;
  const max = niceMax(Math.max(0, ...points.map((p) => p.value)));
  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const ticks = [0, max / 2, max];
  const path = (pts: Point[], offset = 0) =>
    pts.map((p, i) => `${i ? 'L' : 'M'}${x(i + offset).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  // The current day/week is still running: draw its segment dashed so a
  // partial count never reads as a collapse in audience.
  const partial = Boolean(partialLabel) && n >= 2;
  const solidPts = partial ? points.slice(0, n - 1) : points;
  const line = path(solidPts);
  const partialLine = partial ? path(points.slice(n - 2), n - 2) : '';
  const area = n ? `${path(points)} L${x(n - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z` : '';
  const last = n - 1;
  const xTickIdx = n <= 1 ? [0] : [0, Math.floor((n - 1) / 2), n - 1];

  const pick = (clientX: number, rect: DOMRect) => {
    const rel = clientX - rect.left - PAD.left;
    const i = Math.round((rel / Math.max(1, innerW)) * (n - 1));
    setActive(Math.min(n - 1, Math.max(0, i)));
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!n) return;
    if (e.key === 'ArrowRight') setActive((a) => Math.min(n - 1, (a ?? -1) + 1));
    else if (e.key === 'ArrowLeft') setActive((a) => Math.max(0, (a ?? n) - 1));
    else return;
    e.preventDefault();
  };

  const tip = active !== null && points[active] ? points[active] : null;

  return (
    <div ref={wrapRef} className="relative">
      {width > 0 && (
        <svg
          width={width}
          height={H}
          role="img"
          aria-labelledby={labelId}
          tabIndex={0}
          className="block touch-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
          onPointerMove={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
          onPointerDown={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
          onPointerLeave={() => setActive(null)}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
        >
          <title id={labelId}>{valueLabel}</title>
          {ticks.map((tv) => (
            <g key={tv}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(tv)} y2={y(tv)} stroke="var(--chart-grid)" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(tv) + 4} textAnchor="end" className="fill-[var(--text-muted)] text-[11px] tabular-nums">
                {fmt(Math.round(tv), locale)}
              </text>
            </g>
          ))}
          {xTickIdx.map((i) => (
            <text
              key={i}
              x={x(i)}
              y={H - 8}
              textAnchor={i === 0 && n > 1 ? 'start' : i === n - 1 && n > 1 ? 'end' : 'middle'}
              className="fill-[var(--text-muted)] text-[11px]"
            >
              {points[i] ? formatX(points[i].t) : ''}
            </text>
          ))}
          <path d={area} fill="var(--chart-wash)" />
          <path d={line} fill="none" stroke="var(--chart-series)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {partial && (
            <path d={partialLine} fill="none" stroke="var(--chart-series)" strokeWidth={2} strokeDasharray="4 4" strokeLinecap="round" />
          )}
          {n > 0 && (
            <>
              <circle cx={x(last)} cy={y(points[last].value)} r={6} fill="var(--bg-card)" />
              <circle
                cx={x(last)}
                cy={y(points[last].value)}
                r={4}
                fill={partial ? 'var(--bg-card)' : 'var(--chart-series)'}
                stroke="var(--chart-series)"
                strokeWidth={partial ? 2 : 0}
              />
              <text x={x(last) + 9} y={y(points[last].value) + 4} className="fill-[var(--text-heading)] text-[12px] font-semibold tabular-nums">
                {fmt(points[last].value, locale)}
              </text>
            </>
          )}
          {tip && active !== null && (
            <g pointerEvents="none">
              <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={y(0)} stroke="var(--rule)" strokeOpacity={0.35} strokeWidth={1} />
              <circle cx={x(active)} cy={y(tip.value)} r={6} fill="var(--bg-card)" />
              <circle cx={x(active)} cy={y(tip.value)} r={4} fill="var(--chart-series)" />
            </g>
          )}
        </svg>
      )}
      {tip && active !== null && (
        <div
          role="status"
          className="pointer-events-none absolute top-1 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm shadow-sm"
          style={{
            left: Math.min(Math.max(x(active) - 60, 0), Math.max(0, width - 130)),
          }}
        >
          <p className="font-semibold tabular-nums text-[var(--text-heading)]">{fmt(tip.value, locale)}</p>
          <p className="text-xs text-[var(--text-muted)]">
            {formatTooltipX(tip.t)}
            {partial && active === last ? ` · ${partialLabel}` : ''}
          </p>
        </div>
      )}
    </div>
  );
};

/* ------------------------------ Ranked horizontal bars ------------------------------ */

export const RankedBars: React.FC<{ items: Ranked[]; locale: string; empty: string }> = ({ items, locale, empty }) => {
  const visible = items.filter((i) => i.value > 0);
  if (!visible.length) return <p className="text-sm text-[var(--text-muted)]">{empty}</p>;
  const max = Math.max(...visible.map((i) => i.value));
  return (
    <ul className="space-y-3.5">
      {visible.map((item) => (
        <li key={item.key} className="group" title={`${item.label} : ${fmt(item.value, locale)}`}>
          <p className="text-sm leading-snug text-[var(--text)]">{item.label}</p>
          <div className="mt-1.5 flex items-center gap-2.5">
            <div className="h-4 flex-1">
              <div
                className="h-full rounded-r-[4px] bg-[var(--chart-series)] transition-opacity group-hover:opacity-80"
                style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-[var(--text-heading)]">
              {fmt(item.value, locale)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};

/* ------------------------------ Tall segmented bar ------------------------------ */

export interface Segment {
  key: string;
  label: string;
  value: number;
  color: string;
  on: string;
}

/** Share labels are printed inside a block only when it is wide enough. */
const MIN_SHARE_FOR_LABEL = 0.12;

export const SegmentBar: React.FC<{ segments: Segment[]; locale: string; ariaLabel: string }> = ({ segments, locale, ariaLabel }) => {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (!total) return null;
  const pct = (v: number) => Math.round((v / total) * 100);
  const description = segments.map((s) => `${s.label} ${pct(s.value)} %`).join(', ');
  return (
    <div>
      <div className="flex h-7 gap-[2px]" role="img" aria-label={`${ariaLabel} : ${description}`}>
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <div
              key={s.key}
              className="flex items-center rounded-[4px] px-2 text-xs font-semibold tabular-nums"
              style={{ width: `${(s.value / total) * 100}%`, background: s.color, color: s.on }}
              title={`${s.label} : ${fmt(s.value, locale)} (${pct(s.value)} %)`}
            >
              {s.value / total >= MIN_SHARE_FOR_LABEL ? `${pct(s.value)} %` : ''}
            </div>
          ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-[var(--text)]">
            <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: s.color }} aria-hidden="true" />
            {s.label}
            <span className="tabular-nums text-[var(--text-muted)]">{fmt(s.value, locale)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ------------------------------ Meter ------------------------------ */

export const Meter: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div>
      <p className="font-sans text-5xl font-semibold tabular-nums text-[var(--text-heading)]">{pct} %</p>
      <div
        className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--chart-track)]"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={label}
      >
        <div className="h-full rounded-full bg-[var(--chart-series)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
