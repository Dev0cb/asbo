import React, { useEffect, useState } from 'react';
import type { Lang } from '../../i18n';
import {
  FOOTPRINT_QUESTIONS,
  LAB_STR,
  footprintScam,
  guessablePasswords,
  type FootprintAnswers,
  type FootprintQuestion,
} from '../../data/labs';
import { track } from '../../lib/stats';
import { IconAlert, IconCheck, IconEye } from '../icons';

type Phase = 'questions' | 'analysing' | 'result';
type ResultTab = 'pw' | 'q' | 'scam';

const STEP_MS = 450;

/** "Vos données parlent" — 4 innocent answers become an attack plan. */
export const FootprintLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const s = LAB_STR[lang].fp;
  const questions = FOOTPRINT_QUESTIONS[lang];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<FootprintAnswers>>({});
  const [phase, setPhase] = useState<Phase>('questions');
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

  const answer = (q: FootprintQuestion, value: string) => {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (step + 1 < questions.length) {
      setStep(step + 1);
      return;
    }
    setPhase('analysing');
    track('lab_complete', { lab: 'footprint', lang });
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setPhase('questions');
    setLogLines(0);
    setTab('pw');
  };

  if (phase === 'questions') {
    const q = questions[step];
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-muted)]">{s.intro}</p>
        <div className="card p-6 sm:p-8">
          <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
            <span>
              {s.step} {step + 1}/{questions.length}
            </span>
            <div className="flex gap-1.5" aria-hidden="true">
              {questions.map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 w-8 rounded-full"
                  style={{ background: i <= step ? 'var(--color-accent)' : 'var(--bg-elevated)' }}
                />
              ))}
            </div>
          </div>
          <h2 className="mt-6 text-xl font-bold leading-snug text-[var(--text-heading)] sm:text-2xl">{q.q}</h2>
          <p className="mt-2 flex items-start gap-2 text-sm text-[var(--text-muted)]">
            <IconEye className="mt-0.5 h-4 w-4 shrink-0" />
            {q.hint}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => answer(q, opt)}
                className="rounded-xl border border-[var(--border)] p-3.5 text-sm font-medium text-[var(--text)] transition-all hover:border-[var(--color-accent)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-heading)]"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
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
                {footprintScam(full, lang)}
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
