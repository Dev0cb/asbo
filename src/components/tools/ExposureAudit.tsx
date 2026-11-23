import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Lang } from '../../i18n';
import { ANSWER_TEXT, EXPOSURE_UI, ITEM_LABEL, ITEM_TEXT, LEVEL_TEXT, MODULE_TEXT, SCENARIO_TEXT } from '../../data/exposure';
import {
  ACCESS,
  ITEMS,
  accessFromAnswers,
  buildReport,
  type Access,
  type Answer,
  type Answers,
  type ExposureReport,
  type ItemMeta,
  type Level,
  type ModuleId,
  type Scenario,
  type Severity,
} from '../../lib/exposure/model';
import { track } from '../../lib/stats';
import { fillCountry, useCountry } from '../../lib/country';
import { IconAlert, IconCheck } from '../icons';

export const LEVEL_COLOR: Record<Level | Severity, string> = {
  low: 'var(--good)',
  moderate: 'var(--warn)',
  high: 'var(--bad)',
  critical: 'var(--bad)',
};

const ANSWERS: Answer[] = ['high', 'mid', 'none'];
const MODULES = Array.from(new Set(ITEMS.map((m) => m.module))) as ModuleId[];

/** Self-audit: declared exposures → index, correlations, what-if. */
export const ExposureAudit: React.FC<{ lang: Lang }> = ({ lang }) => {
  const ui = EXPOSURE_UI[lang];
  // Answers live only in memory: nothing is stored or sent.
  const [answers, setAnswers] = useState<Answers>({});
  const access = useMemo(() => accessFromAnswers(answers), [answers]);
  const report = useMemo(() => buildReport(access), [access]);
  const answered = Object.keys(answers).length;

  const completed = useRef(false);

  // Count one completion per session of the audit (score only, never answers).
  useEffect(() => {
    if (answered === ITEMS.length && !completed.current) {
      completed.current = true;
      track('lab_complete', { lab: 'exposure', score: report.index, max: 100, lang });
    }
  }, [answered, report.index, lang]);

  const answer = (id: ItemMeta['id'], value: Answer) => setAnswers((prev) => ({ ...prev, [id]: value }));

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-muted)]">{ui.auditIntro}</p>
      <Dashboard lang={lang} report={report} actions={countActions(report, lang)} pending={answered === 0} />

      <div className="card p-5 sm:p-6">
        <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{ui.progress(answered, ITEMS.length)}</p>
        {MODULES.map((module) => (
          <fieldset key={module} className="mt-5">
            <legend className="font-sans text-base font-semibold text-[var(--text-heading)]">{MODULE_TEXT[lang][module]}</legend>
            <div className="mt-3 space-y-4">
              {ITEMS.filter((m) => m.module === module).map((m) => (
                <Question key={m.id} lang={lang} meta={m} value={answers[m.id]} onChange={(v) => answer(m.id, v)} />
              ))}
            </div>
          </fieldset>
        ))}
        {answered > 0 && <ResetAnswers lang={lang} count={answered} onConfirm={() => setAnswers({})} />}
      </div>

      <ScenarioList lang={lang} scenarios={report.scenarios} access={access} />
      {report.quickWins.length > 0 && <QuickWins lang={lang} report={report} />}
      {report.exposed.length > 0 && <Fixes lang={lang} report={report} />}
    </div>
  );
};

/** One fix per exposed item + the actions of every scenario found. */
export function countActions(report: ExposureReport, lang: Lang): number {
  return report.exposed.length + report.scenarios.reduce((n, s) => n + SCENARIO_TEXT[lang][s.id].actions.length, 0);
}

/** Two-step clear: a destructive action is never one tap away. */
const ResetAnswers: React.FC<{ lang: Lang; count: number; onConfirm: () => void }> = ({ lang, count, onConfirm }) => {
  const ui = EXPOSURE_UI[lang];
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} className="btn-ghost mt-6 text-xs">
        {ui.reset}
      </button>
    );
  }
  return (
    <div className="mt-6 rounded-lg border border-[var(--bad)]/50 bg-[var(--bad)]/5 p-4" role="group" aria-label={ui.reset}>
      <p className="text-sm text-[var(--text-heading)]">{ui.resetQuestion(count)}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            onConfirm();
            setAsking(false);
          }}
          className="btn-ghost text-xs"
          style={{ color: 'var(--bad)', borderColor: 'var(--bad)' }}
        >
          {ui.resetConfirm}
        </button>
        <button type="button" onClick={() => setAsking(false)} className="btn-ghost text-xs" autoFocus>
          {ui.resetCancel}
        </button>
      </div>
    </div>
  );
};

const Question: React.FC<{ lang: Lang; meta: ItemMeta; value?: Answer; onChange: (v: Answer) => void }> = ({ lang, meta, value, onChange }) => {
  const { country } = useCountry();
  const text = ITEM_TEXT[lang][meta.id];
  const labels = ANSWER_TEXT[lang][meta.kind];
  // Native radio group: one Tab stop per question, arrow keys move between
  // answers, and screen readers announce "1 of 3, selected" by themselves.
  return (
    <fieldset>
      <legend className="text-sm leading-relaxed text-[var(--text)]">{fillCountry(text.q, country, lang)}</legend>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {ANSWERS.map((a, i) => {
          const selected = value === a;
          const color = ACCESS[a] === 1 ? 'var(--bad)' : ACCESS[a] > 0 ? 'var(--warn)' : 'var(--good)';
          return (
            <label
              key={a}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium leading-tight transition-colors sm:text-sm"
              style={
                selected
                  ? { borderColor: color, color: 'var(--text-heading)', background: 'var(--bg-elevated)' }
                  : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
              }
            >
              <input
                type="radio"
                name={`audit-${meta.id}`}
                value={a}
                checked={selected}
                onChange={() => onChange(a)}
                className="h-4 w-4 shrink-0"
                style={{ accentColor: selected ? color : undefined }}
              />
              {labels[i]}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

interface DashboardProps {
  lang: Lang;
  report: ExposureReport;
  actions: number;
  /** Nothing answered yet: show a neutral "—" instead of a reassuring "0 · Low". */
  pending?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ lang, report, actions, pending = false }) => {
  const ui = EXPOSURE_UI[lang];
  const color = pending ? 'var(--text-muted)' : LEVEL_COLOR[report.level];
  const highRisk = report.scenarios.filter((s) => s.severity !== 'moderate').length;
  const stats: [number, string][] = [
    [report.exposed.length, ui.exposed],
    [report.scenarios.length, ui.correlations],
    [highRisk, ui.highRisk],
    [actions, ui.actions],
  ];
  return (
    <div className="card p-5 sm:p-6">
      {/* One short phrase for screen readers, instead of re-reading the whole card. */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {pending ? '' : ui.liveIndex(report.index, LEVEL_TEXT[lang][report.level])}
      </p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{ui.index}</p>
          <p className="text-4xl font-extrabold" style={{ color }}>
            {pending ? '—' : report.index}
            <span className="text-base font-semibold text-[var(--text-muted)]">/100</span>
          </p>
        </div>
        {!pending && <span className="chip" style={{ color, borderColor: color }}>{LEVEL_TEXT[lang][report.level]}</span>}
      </div>
      {pending && <p className="mt-2 text-sm text-[var(--text-muted)]">{ui.pendingHint}</p>}
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--bg)]" aria-hidden="true">
        <div className="h-full transition-all" style={{ width: `${report.index}%`, background: color }} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-[var(--border)] sm:grid-cols-4">
        {stats.map(([n, label]) => (
          <div key={label} className="bg-[var(--bg-card)] p-3">
            <dt className="text-xs text-[var(--text-muted)]">{label}</dt>
            <dd className="text-2xl font-bold text-[var(--text-heading)]">{n}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-[var(--text-muted)]">{ui.disclaimer}</p>
    </div>
  );
};

/** Correlation scenarios, each with the exposed items that triggered it. */
export const ScenarioList: React.FC<{ lang: Lang; scenarios: Scenario[]; access: Access }> = ({ lang, scenarios, access }) => {
  const ui = EXPOSURE_UI[lang];
  const { country } = useCountry();
  const fill = (t: string) => fillCountry(t, country, lang);
  return (
    <div className="card p-5 sm:p-6">
      <h2 className="font-sans text-base font-semibold text-[var(--text-heading)]">{ui.scenariosTitle}</h2>
      {scenarios.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--text-muted)]">{ui.scenariosNone}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {scenarios.map((s) => {
            const text = SCENARIO_TEXT[lang][s.id];
            const color = LEVEL_COLOR[s.severity];
            const causes = s.require.flat().filter((id) => (access[id] ?? 0) > 0);
            return (
              <li key={s.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
                <div className="flex items-start gap-2">
                  <IconAlert className="mt-0.5 h-4 w-4 shrink-0" style={{ color } as React.CSSProperties} />
                  <p className="text-sm font-semibold text-[var(--text-heading)]">{text.title}</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="chip text-xs" style={{ color, borderColor: color }}>{LEVEL_TEXT[lang][s.severity]}</span>
                  <span className="chip text-xs">{ui.potential}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{fill(text.how)}</p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  {ui.because} {causes.map((id) => ITEM_LABEL[lang][id]).join(' + ')}
                </p>
                <ul className="mt-2 space-y-1">
                  {text.actions.map((a) => (
                    <li key={a} className="flex gap-2 text-sm text-[var(--text)]">
                      <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--good)]" />
                      {fill(a)}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const QuickWins: React.FC<{ lang: Lang; report: ExposureReport }> = ({ lang, report }) => {
  const ui = EXPOSURE_UI[lang];
  return (
    <div className="card p-5 sm:p-6">
      <h2 className="font-sans text-base font-semibold text-[var(--text-heading)]">{ui.quickWinsTitle}</h2>
      <ul className="mt-3 space-y-2">
        {report.quickWins.map((w) => (
          <li key={w.id} className="flex items-start justify-between gap-3 text-sm">
            <span className="text-[var(--text)]">{ITEM_TEXT[lang][w.id].fix}</span>
            <span className="shrink-0 font-mono font-semibold text-[var(--good)]">{ui.quickWin(w.gain)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Fixes: React.FC<{ lang: Lang; report: ExposureReport }> = ({ lang, report }) => {
  const ui = EXPOSURE_UI[lang];
  const { country } = useCountry();
  return (
    <div className="card p-5 sm:p-6">
      <h2 className="font-sans text-base font-semibold text-[var(--text-heading)]">{ui.fixTitle}</h2>
      <ul className="mt-3 space-y-3">
        {report.exposed.map((id) => (
          <li key={id} className="text-sm">
            <p className="flex flex-wrap items-center gap-2 font-semibold text-[var(--text-heading)]">
              {ITEM_LABEL[lang][id]}
              <span className="chip text-xs">{ui.declared}</span>
            </p>
            <p className="mt-1 text-[var(--text-muted)]">{fillCountry(ITEM_TEXT[lang][id].why, country, lang)}</p>
            <p className="mt-1 flex gap-2 text-[var(--text)]">
              <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--good)]" />
              {ITEM_TEXT[lang][id].fix}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
