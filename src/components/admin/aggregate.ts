// Pure aggregation of raw `events` rows into dashboard figures.
// Every number on the dashboard comes from these functions — nothing is
// hard-coded or simulated.
import type { Lang } from '../../i18n';
import { GUIDES } from '../../data/guides';
import { LETTER_KINDS, type LetterKind } from '../../data/letters';
import type { DashStrings } from './strings';

export interface EventRow {
  type: string;
  data: Record<string, unknown> | null;
  session_id: string | null;
  lang: string | null;
  created_at: string;
}

export type PeriodDays = 7 | 30 | 90 | 0; // 0 = all time

const DAY_MS = 86_400_000;
/** Quiz levels use the same thresholds as quizResult() in i18n.ts. */
const QUIZ_HIGH = 0.8;
const QUIZ_MID = 0.5;
/** Beyond this many days the visitors chart switches to weekly points. */
const WEEKLY_AFTER_DAYS = 120;

// Events created by the 2026-11-22 security audit (manual API checks).
const isAuditEvent = (r: EventRow) =>
  r.session_id === 'audit-0002' || String(r.data?.page ?? '').startsWith('audit-check');

export const cleanRows = (rows: EventRow[]) => rows.filter((r) => !isAuditEvent(r));

const ts = (r: EventRow) => new Date(r.created_at).getTime();
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const str = (v: unknown) => (typeof v === 'string' ? v : '');

export interface Window {
  start: number;
  end: number;
  prevStart: number | null;
}

export function periodWindow(days: PeriodDays, rows: EventRow[], now = Date.now()): Window {
  if (days === 0) {
    // reduce, not Math.min(...spread): spreading 100k+ rows overflows the stack.
    const first = rows.reduce((min, r) => Math.min(min, ts(r)), now);
    return { start: startOfDay(first), end: now, prevStart: null };
  }
  const start = startOfDay(now - (days - 1) * DAY_MS);
  return { start, end: now, prevStart: start - days * DAY_MS };
}

function startOfDay(t: number) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const inRange = (rows: EventRow[], a: number, b: number) => rows.filter((r) => ts(r) >= a && ts(r) < b);

/* ------------------------------ Headline figures ------------------------------ */

export interface Kpis {
  visitors: number;
  pages: number;
  guides: number;
  exercises: number;
}

/** The three modes of "Vos données parlent" (quiz form, self-audit, text scan). */
const FOOTPRINT_LABS = ['footprint', 'exposure', 'exposure_scan'];

function isExercise(r: EventRow) {
  if (r.type === 'quiz_complete' || r.type === 'checker_use') return true;
  return r.type === 'lab_complete' && ['phishing', ...FOOTPRINT_LABS].includes(str(r.data?.lab));
}

export function kpis(rows: EventRow[]): Kpis {
  const sessions = new Set(rows.map((r) => r.session_id).filter(Boolean));
  return {
    visitors: sessions.size,
    pages: rows.filter((r) => r.type === 'page_view').length,
    guides: rows.filter((r) => r.type === 'guide_view').length,
    exercises: rows.filter(isExercise).length,
  };
}

/** Relative change vs the previous period; null when there is no baseline. */
export function delta(current: number, previous: number | null): number | null {
  if (previous === null || previous === 0) return null;
  return (current - previous) / previous;
}

/* ------------------------------ Visitors over time ------------------------------ */

export interface Point {
  t: number;
  value: number;
}

export function visitorSeries(rows: EventRow[], win: Window): { points: Point[]; weekly: boolean } {
  const spanDays = Math.ceil((win.end - win.start) / DAY_MS);
  const weekly = spanDays > WEEKLY_AFTER_DAYS;
  const step = weekly ? 7 * DAY_MS : DAY_MS;
  const buckets: { t: number; sessions: Set<string> }[] = [];
  for (let t = win.start; t <= win.end; t += step) buckets.push({ t, sessions: new Set() });
  for (const r of rows) {
    const i = Math.floor((ts(r) - win.start) / step);
    if (r.session_id && buckets[i]) buckets[i].sessions.add(r.session_id);
  }
  return { points: buckets.map((b) => ({ t: b.t, value: b.sessions.size })), weekly };
}

/* ------------------------------ Rankings ------------------------------ */

export interface Ranked {
  key: string;
  label: string;
  value: number;
}

export function topGuides(rows: EventRow[], lang: Lang): Ranked[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    if (r.type !== 'guide_view') continue;
    const slug = str(r.data?.slug);
    if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([slug, value]) => ({ key: slug, label: GUIDES[lang].find((g) => g.slug === slug)?.title ?? slug, value }))
    .sort((a, b) => b.value - a.value);
}

export function toolUsage(rows: EventRow[], s: DashStrings): Ranked[] {
  const lab = (name: string) => rows.filter((r) => r.type === 'lab_complete' && str(r.data?.lab) === name);
  const checklistPeople = new Set(rows.filter((r) => r.type === 'checklist_update').map((r) => r.session_id)).size;
  return [
    { key: 'quiz', label: s.tools.quiz, value: rows.filter((r) => r.type === 'quiz_complete').length },
    { key: 'phishing', label: s.tools.phishing, value: lab('phishing').length },
    { key: 'checker', label: s.tools.checker, value: rows.filter((r) => r.type === 'checker_use').length },
    { key: 'footprint', label: s.tools.footprint, value: FOOTPRINT_LABS.reduce((n, name) => n + lab(name).length, 0) },
    { key: 'letter', label: s.tools.letter, value: lab('letter').length },
    { key: 'checklist', label: s.tools.checklist, value: checklistPeople },
  ].sort((a, b) => b.value - a.value);
}

/* ------------------------------ Quiz & phishing ------------------------------ */

export function quizLevels(rows: EventRow[]) {
  const levels = { low: 0, mid: 0, high: 0 };
  for (const r of rows) {
    if (r.type !== 'quiz_complete') continue;
    const max = num(r.data?.max) || 20;
    const pct = num(r.data?.score) / max;
    if (pct >= QUIZ_HIGH) levels.high++;
    else if (pct >= QUIZ_MID) levels.mid++;
    else levels.low++;
  }
  return levels;
}

export function phishingSuccess(rows: EventRow[]): { rate: number; games: number } {
  let score = 0;
  let max = 0;
  let games = 0;
  for (const r of rows) {
    if (r.type !== 'lab_complete' || str(r.data?.lab) !== 'phishing') continue;
    score += num(r.data?.score);
    max += num(r.data?.max);
    games++;
  }
  return { rate: max ? score / max : 0, games };
}

export function languages(rows: EventRow[]) {
  const bySession = new Map<string, string>();
  for (const r of rows) if (r.session_id && r.lang && !bySession.has(r.session_id)) bySession.set(r.session_id, r.lang);
  let fr = 0;
  let en = 0;
  for (const l of bySession.values()) (l === 'en' ? en++ : fr++);
  return { fr, en };
}

/* ------------------------------ Activity feed ------------------------------ */

export function describe(r: EventRow, lang: Lang, s: DashStrings): string {
  const d = r.data ?? {};
  const a = s.activity;
  switch (r.type) {
    case 'page_view': {
      const page = str(d.page);
      const [section, slug] = page.split('/');
      if (section === 'guides' && slug) return a.guide(GUIDES[lang].find((g) => g.slug === slug)?.title ?? slug);
      return a.page(s.pageNames[section] ?? (page || s.pageNames.home));
    }
    case 'guide_view':
      return a.guide(GUIDES[lang].find((g) => g.slug === str(d.slug))?.title ?? str(d.slug));
    case 'quiz_complete':
      return a.quiz(num(d.score), num(d.max));
    case 'checker_use':
      return a.checker(s.verdicts[str(d.verdict)] ?? str(d.verdict));
    case 'checklist_update':
      return a.checklist(num(d.done), num(d.total));
    case 'outbound_click':
      return a.outbound(str(d.target));
    case 'lab_complete': {
      const labName = str(d.lab);
      if (labName === 'phishing') return a.phishing(num(d.score), num(d.max));
      if (labName === 'footprint') return a.footprint;
      if (labName === 'letter') {
        const kind = LETTER_KINDS[str(d.kind) as LetterKind]?.label[lang];
        return `${a.letter(a.letterActions[str(d.action)] ?? '')}${kind ? ` · ${kind}` : ''}`;
      }
      return a.other;
    }
    default:
      return a.other;
  }
}

/* ------------------------------ CSV export ------------------------------ */

export function dailyCsv(rows: EventRow[], win: Window, s: DashStrings): string {
  const lines = [[s.csv.date, s.csv.visitors, s.csv.pages, s.csv.guides, s.csv.exercises].join(',')];
  for (let t = win.start; t <= win.end; t += DAY_MS) {
    const day = inRange(rows, t, t + DAY_MS);
    const k = kpis(day);
    const date = new Date(t);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    lines.push([iso, k.visitors, k.pages, k.guides, k.exercises].join(','));
  }
  return lines.join('\n');
}

export { inRange };
