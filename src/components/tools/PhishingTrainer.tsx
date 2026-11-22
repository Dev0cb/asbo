import React, { useState } from 'react';
import type { Lang } from '../../i18n';
import { LAB_STR, PHISHING, type PhishingScenario } from '../../data/labs';
import { navigate } from '../../lib/router';
import { track } from '../../lib/stats';
import { IconAlert, IconChat, IconCheck, IconPhone, IconShield } from '../icons';

const CHANNEL_STYLE: Record<PhishingScenario['channel'], { color: string; Icon: typeof IconChat }> = {
  sms: { color: '#38bdf8', Icon: IconPhone },
  whatsapp: { color: '#25d366', Icon: IconChat },
  email: { color: '#a78bfa', Icon: IconShield },
};

/** "Vrai ou arnaque ?" — classify realistic messages, then see the clues. */
export const PhishingTrainer: React.FC<{ lang: Lang }> = ({ lang }) => {
  const s = LAB_STR[lang];
  const scenarios = PHISHING[lang];
  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = scenarios[idx];
  const answered = choice !== null;
  const correct = answered && choice === current.isScam;

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
        <p className="mt-2 text-6xl font-extrabold" style={{ color }}>
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

  const { color, Icon } = CHANNEL_STYLE[current.channel];

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-muted)]">{s.phish.intro}</p>
      <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
        <span>
          {s.phish.progress} {idx + 1} {s.phish.of} {scenarios.length}
        </span>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[var(--bg-elevated)] sm:w-48">
          <div
            className="h-full bg-[var(--color-accent)] transition-all"
            style={{ width: `${((idx + (answered ? 1 : 0)) / scenarios.length) * 100}%` }}
          />
        </div>
      </div>

      {/* The message, styled like a phone notification */}
      <article className="card overflow-hidden">
        <header className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
          <span className="icon-tile h-9 w-9" style={{ background: `${color}1f`, color }}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
              {s.channel[current.channel]}
            </p>
            <p className="truncate text-sm text-[var(--text-heading)]">
              <span className="text-[var(--text-muted)]">{s.phish.from} : </span>
              <span className="font-mono">{current.from}</span>
            </p>
          </div>
        </header>
        <div className="p-5">
          {current.subject && (
            <p className="mb-3 font-semibold text-[var(--text-heading)]">
              <span className="font-normal text-[var(--text-muted)]">{s.phish.subject} : </span>
              {current.subject}
            </p>
          )}
          <p className="whitespace-pre-line leading-relaxed text-[var(--text)]">{current.body}</p>
        </div>
      </article>

      {!answered ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => answer(true)}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-[var(--bad)]/60 p-4 font-semibold text-[var(--bad)] transition-colors hover:bg-[var(--bad)]/10"
          >
            <IconAlert className="h-7 w-7" />
            {s.phish.scam}
          </button>
          <button
            onClick={() => answer(false)}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-[var(--good)]/60 p-4 font-semibold text-[var(--good)] transition-colors hover:bg-[var(--good)]/10"
          >
            <IconCheck className="h-7 w-7" />
            {s.phish.legit}
          </button>
        </div>
      ) : (
        <div
          className="card p-5 sm:p-6"
          style={{ borderColor: correct ? 'var(--good)' : 'var(--bad)' }}
          aria-live="polite"
        >
          <p className="text-lg font-bold" style={{ color: correct ? 'var(--good)' : 'var(--bad)' }}>
            {correct ? s.phish.right : s.phish.wrong}{' '}
            <span className="text-[var(--text-heading)]">
              {current.isScam ? s.phish.wasScam : s.phish.wasLegit}
            </span>
          </p>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {s.phish.clues}
          </p>
          <ul className="mt-2 space-y-2">
            {current.clues.map((clue) => (
              <li key={clue} className="flex gap-2.5 text-sm leading-relaxed text-[var(--text)]">
                {current.isScam ? (
                  <IconAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--bad)]" />
                ) : (
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--good)]" />
                )}
                {clue}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm leading-relaxed text-[var(--text-muted)]">
            {current.explanation}
          </p>
          <button onClick={next} className="btn-primary mt-5">
            {idx + 1 >= scenarios.length ? s.phish.finish : s.phish.next}
          </button>
        </div>
      )}
    </div>
  );
};
