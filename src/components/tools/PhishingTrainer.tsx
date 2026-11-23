import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Lang } from '../../i18n';
import { LAB_STR } from '../../data/labs';
import { phishingScenarios, type PhishingScenario } from '../../data/phishing';
import { navigate } from '../../lib/router';
import { track } from '../../lib/stats';
import { IconAlert, IconCheck } from '../icons';
import { Phone } from './phone/Phone';

/** Fisher–Yates shuffle (game order only — no security use). */
function shuffled<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** "Vrai ou arnaque ?" — realistic messages in a drawn phone, then the clues. */
export const PhishingTrainer: React.FC<{ lang: Lang }> = ({ lang }) => {
  const s = LAB_STR[lang];
  const [round, setRound] = useState(0);
  // Same order across a language switch; reshuffled on every new game.
  const order = useMemo(() => shuffled(phishingScenarios('fr').map((x) => x.id)), [round]);
  const byId = useMemo(() => new Map(phishingScenarios(lang).map((x) => [x.id, x])), [lang]);
  const scenarios = order.map((id) => byId.get(id)).filter(Boolean) as PhishingScenario[];

  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const feedbackRef = useRef<HTMLHeadingElement>(null);

  const current = scenarios[idx];
  const answered = choice !== null;
  const correct = answered && choice === current.isScam;

  useEffect(() => {
    if (answered) feedbackRef.current?.focus();
  }, [answered]);

  const answer = (saysScam: boolean) => {
    if (answered) return;
    setChoice(saysScam);
    if (saysScam === current.isScam) setScore((n) => n + 1);
  };

  const next = () => {
    if (idx + 1 >= scenarios.length) {
      setDone(true);
      track('lab_complete', { lab: 'phishing', score, max: scenarios.length, lang });
      return;
    }
    setIdx(idx + 1);
    setChoice(null);
  };

  const restart = () => {
    setRound((r) => r + 1);
    setIdx(0);
    setChoice(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    const pct = score / scenarios.length;
    const color = pct >= 0.85 ? 'var(--good)' : pct >= 0.5 ? 'var(--warn)' : 'var(--bad)';
    const msg = pct >= 0.85 ? s.phish.resultHigh : pct >= 0.5 ? s.phish.resultMid : s.phish.resultLow;
    return (
      <div className="card p-6 text-center sm:p-10">
        <p className="text-sm uppercase tracking-widest text-[var(--text-muted)]">{s.phish.result}</p>
        <p className="mt-2 font-sans text-6xl font-semibold" style={{ color }}>
          {score}
          <span className="text-2xl text-[var(--text-muted)]">/{scenarios.length}</span>
        </p>
        <p className="mx-auto mt-4 max-w-md text-[var(--text-muted)]">{msg}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={restart} className="btn-primary">{s.phish.restart}</button>
          <button onClick={() => navigate('/guides/hameconnage')} className="btn-ghost">{s.phish.readGuide}</button>
        </div>
      </div>
    );
  }

  const tone = current.isScam ? 'var(--bad)' : 'var(--good)';

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-[var(--text-muted)]">{s.phish.intro}</p>
      <div className="grid items-start gap-8 lg:grid-cols-[330px_minmax(0,1fr)]">
        <Phone scenario={current} lang={lang} reveal={answered} label={`${s.channel[current.channel]} — ${current.sender}`} />

        <div className="space-y-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
            <span>
              {s.phish.progress} {idx + 1} {s.phish.of} {scenarios.length}
            </span>
            <span className="font-mono text-xs uppercase tracking-wider">{s.channel[current.channel]}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-elevated)]" aria-hidden="true">
            <div
              className="h-full bg-[var(--brand)] transition-all"
              style={{ width: `${((idx + (answered ? 1 : 0)) / scenarios.length) * 100}%` }}
            />
          </div>

          {!answered ? (
            <>
              <p className="font-display text-2xl leading-snug text-[var(--text-heading)]">{s.phish.question}</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => answer(true)}
                  className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border-2 border-[var(--bad)]/60 p-4 font-semibold text-[var(--bad)] transition-colors hover:bg-[var(--bad)]/10"
                >
                  <IconAlert className="h-7 w-7" />
                  {s.phish.scam}
                </button>
                <button
                  onClick={() => answer(false)}
                  className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border-2 border-[var(--good)]/60 p-4 font-semibold text-[var(--good)] transition-colors hover:bg-[var(--good)]/10"
                >
                  <IconCheck className="h-7 w-7" />
                  {s.phish.legit}
                </button>
              </div>
            </>
          ) : (
            <div className="card p-5 sm:p-6" style={{ borderColor: tone }} aria-live="polite">
              <h3 ref={feedbackRef} tabIndex={-1} className="text-lg font-bold outline-none" style={{ color: correct ? 'var(--good)' : 'var(--bad)' }}>
                {correct ? s.phish.right : s.phish.wrong}{' '}
                <span className="text-[var(--text-heading)]">{current.isScam ? s.phish.wasScam : s.phish.wasLegit}</span>
              </h3>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">{s.phish.clues}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{s.phish.cluesHint}</p>
              <ol className="mt-3 space-y-2.5">
                {current.clues.map((clue, i) => (
                  <li key={clue.text} className="flex gap-2.5 text-sm leading-relaxed text-[var(--text)]">
                    <span
                      className="mt-0.5 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                      style={{ background: current.isScam ? '#d92d20' : '#067647' }}
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    {clue.text}
                  </li>
                ))}
              </ol>
              <p className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-sm leading-relaxed text-[var(--text)]">
                {current.explanation}
              </p>
              <button onClick={next} className="btn-primary mt-5">
                {idx + 1 >= scenarios.length ? s.phish.finish : s.phish.next}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
