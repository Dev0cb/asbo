import React, { useEffect, useState } from 'react';
import type { Lang } from '../../i18n';
import {
  FOOTPRINT_FIELDS,
  FOOTPRINT_MAX_LENGTH,
  LAB_STR,
  footprintScam,
  guessablePasswords,
  validateFootprint,
  type FootprintAnswers,
  type FootprintErrors,
} from '../../data/labs';
import { fillCountry, useCountry } from '../../lib/country';
import { track } from '../../lib/stats';
import { IconAlert, IconCheck, IconEye } from '../icons';
import { EXPOSURE_UI } from '../../data/exposure';
import { ExposureAudit } from './ExposureAudit';
import { ExposureScan } from './ExposureScan';

type Phase = 'form' | 'analysing' | 'result';
type ResultTab = 'pw' | 'q' | 'scam';

const STEP_MS = 450;

/** The original game: 4 innocent answers become an attack plan. */
const FootprintGame: React.FC<{ lang: Lang }> = ({ lang }) => {
  const s = LAB_STR[lang].fp;
  const fields = FOOTPRINT_FIELDS[lang];
  const { country } = useCountry();
  const [answers, setAnswers] = useState<Partial<FootprintAnswers>>({});
  const [errors, setErrors] = useState<FootprintErrors>({});
  const [phase, setPhase] = useState<Phase>('form');
  const [logLines, setLogLines] = useState(0);
  const [tab, setTab] = useState<ResultTab>('pw');

  // Short "attacker at work" sequence; skipped for reduced-motion users.
  useEffect(() => {
    if (phase !== 'analysing') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || logLines >= s.log.length) {
      const id = window.setTimeout(() => setPhase('result'), reduced ? 0 : STEP_MS);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setLogLines((n) => n + 1), STEP_MS);
    return () => window.clearTimeout(id);
  }, [phase, logLines, s.log.length]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateFootprint(answers);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(`fp-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setPhase('analysing');
    // Only the fact that the lab was completed is counted — never the answers.
    track('lab_complete', { lab: 'footprint', lang });
  };

  const restart = () => {
    setAnswers({});
    setErrors({});
    setPhase('form');
    setLogLines(0);
    setTab('pw');
  };

  if (phase === 'form') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-muted)]">{s.intro}</p>
        <form className="card space-y-5 p-6 sm:p-8" onSubmit={submit} noValidate>
          {fields.map((f) => {
            const error = errors[f.id];
            return (
              <div key={f.id}>
                <label htmlFor={`fp-${f.id}`} className="block text-sm font-semibold text-[var(--text-heading)]">
                  {f.label}
                </label>
                <p id={`fp-${f.id}-hint`} className="mt-1 flex items-start gap-2 text-xs text-[var(--text-muted)]">
                  <IconEye className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {f.hint}
                </p>
                <input
                  id={`fp-${f.id}`}
                  value={answers[f.id] ?? ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [f.id]: e.target.value }))}
                  placeholder={f.placeholder}
                  inputMode={f.isYear ? 'numeric' : 'text'}
                  maxLength={f.isYear ? 4 : FOOTPRINT_MAX_LENGTH + 1}
                  autoComplete="off"
                  aria-invalid={!!error}
                  aria-describedby={`fp-${f.id}-hint${error ? ` fp-${f.id}-error` : ''}`}
                  className="input mt-2"
                  style={error ? { borderColor: 'var(--bad)' } : undefined}
                />
                {error && (
                  <p id={`fp-${f.id}-error`} className="mt-1 text-xs font-medium text-[var(--bad)]">
                    {s.errors[error]}
                  </p>
                )}
              </div>
            );
          })}
          <button type="submit" className="btn-primary">{s.submit}</button>
          <p className="text-xs text-[var(--text-muted)]">{s.privacy}</p>
        </form>
      </div>
    );
  }

  if (phase === 'analysing') {
    return (
      <div className="card p-6 sm:p-8" aria-live="polite">
        <p className="font-semibold text-[var(--warn)]">{s.analysing}</p>
        <ul className="mt-4 space-y-2 font-mono text-sm">
          {s.log.slice(0, logLines).map((line) => (
            <li key={line} className="flex gap-2 text-[var(--text)]">
              <span className="text-[var(--warn)]">›</span>
              {line}
            </li>
          ))}
          <li className="animate-pulse text-[var(--warn)]">_</li>
        </ul>
      </div>
    );
  }

  const full = answers as FootprintAnswers;
  const passwords = guessablePasswords(full);
  const secretAnswers = [full.city, full.name, full.passion];
  const tabs: { id: ResultTab; label: string }[] = [
    { id: 'pw', label: s.tabPw },
    { id: 'q', label: s.tabQ },
    { id: 'scam', label: s.tabScam },
  ];

  return (
    <div className="space-y-4">
      <div className="card border-[var(--bad)]/50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="icon-tile h-10 w-10 bg-[var(--bad)]/10 text-[var(--bad)]">
            <IconAlert className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-heading)]">{s.title}</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{s.subtitle}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2" role="tablist">
          {tabs.map((tb) => (
            <button
              key={tb.id}
              role="tab"
              aria-selected={tab === tb.id}
              onClick={() => setTab(tb.id)}
              className={`rounded-lg px-2 py-2 text-center text-xs font-medium leading-tight transition-colors sm:text-sm ${
                tab === tb.id
                  ? 'bg-[var(--bad)]/15 text-[var(--text-heading)] ring-1 ring-[var(--bad)]/60'
                  : 'border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)]'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        <div className="mt-5" role="tabpanel">
          {tab === 'pw' && (
            <>
              <p className="text-sm text-[var(--text-muted)]">{s.pwText}</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {passwords.map((p) => (
                  <li key={p} className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 font-mono text-sm text-[var(--bad)]">
                    {p}
                  </li>
                ))}
              </ul>
            </>
          )}
          {tab === 'q' && (
            <>
              <p className="text-sm text-[var(--text-muted)]">{s.qText}</p>
              <ul className="mt-3 space-y-2">
                {s.qList.map((question, i) => (
                  <li key={question} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm">
                    <span className="text-[var(--text)]">{question}</span>
                    <span className="font-mono font-semibold text-[var(--bad)]">{secretAnswers[i]}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {tab === 'scam' && (
            <>
              <p className="text-sm text-[var(--text-muted)]">{s.scamText}</p>
              <p className="mt-3 rounded-xl rounded-tl-sm border border-[#25d366]/40 bg-[#25d366]/10 p-4 text-sm leading-relaxed text-[var(--text-heading)]">
                {footprintScam(full, lang, fillCountry('{money1}', country, lang))}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <h3 className="font-semibold text-[var(--text-heading)]">{s.todoTitle}</h3>
        <ul className="mt-3 space-y-2.5">
          {s.todo.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed text-[var(--text)]">
              <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--good)]" />
              {item}
            </li>
          ))}
        </ul>
        <button onClick={restart} className="btn-ghost mt-5">{s.restart}</button>
      </div>
    </div>
  );
};

type Mode = 'game' | 'audit' | 'scan';
const MODES: Mode[] = ['game', 'audit', 'scan'];

/** URL slug of each mode: #/outils/vos-donnees/quiz | audit | texte. */
const MODE_SLUGS: Record<Mode, string> = { game: 'quiz', audit: 'audit', scan: 'texte' };
const modeFromSlug = (slug?: string): Mode => MODES.find((m) => MODE_SLUGS[m] === slug) ?? 'game';

/**
 * "Vos données parlent": a self-OSINT lab in three modes — the attacker
 * quiz, a declarative self-audit, and a local scan of a text the user wrote.
 */
export const FootprintLab: React.FC<{ lang: Lang; modeSlug?: string }> = ({ lang, modeSlug }) => {
  const ui = EXPOSURE_UI[lang];
  const [mode, setMode] = useState<Mode>(() => modeFromSlug(modeSlug));

  // Follow links such as #/outils/vos-donnees/texte from other tools.
  useEffect(() => {
    setMode(modeFromSlug(modeSlug));
  }, [modeSlug]);

  const selectMode = (m: Mode) => {
    setMode(m);
    // Shareable URL, without triggering a hashchange (no scroll jump).
    history.replaceState(null, '', `#/outils/vos-donnees/${MODE_SLUGS[m]}`);
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label={LAB_STR[lang].fp.title}>
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => selectMode(m)}
            className={`min-h-11 rounded-lg px-2 py-2 text-center text-xs font-medium leading-tight transition-colors sm:text-sm ${
              mode === m
                ? 'bg-[var(--color-accent)]/15 text-[var(--text-heading)] ring-1 ring-[var(--color-accent)]'
                : 'border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
          >
            {ui.modes[m]}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {mode === 'game' && <FootprintGame lang={lang} />}
        {mode === 'audit' && <ExposureAudit lang={lang} />}
        {mode === 'scan' && <ExposureScan lang={lang} />}
      </div>
    </div>
  );
};
