import React, { useState } from 'react';
import { STR, type Lang } from '../../i18n';
import { ADVICE_TEXT, CHECKER_UI, COMBO_TEXT, SIGNAL_TEXT, VERDICT_TEXT } from '../../data/scamText';
import { analyzeMessage, MAX_MESSAGE_LENGTH, type Analysis, type Signal, type Verdict } from '../../lib/scam/engine';
import { track } from '../../lib/stats';
import { IconAlert, IconCheck } from '../icons';
import { CheckerAI } from './CheckerAI';

const VERDICT_COLOR: Record<Verdict, string> = {
  low: 'var(--good)',
  moderate: 'var(--warn)',
  high: 'var(--bad)',
  critical: 'var(--bad)',
};

/** Weight thresholds for the colour of a signal's icon. */
const STRONG_SIGNAL = 25;
const MEDIUM_SIGNAL = 10;

function signalColor(s: Signal): string {
  if (s.weight < 0) return 'var(--good)';
  if (s.weight >= STRONG_SIGNAL) return 'var(--bad)';
  if (s.weight >= MEDIUM_SIGNAL) return 'var(--warn)';
  return 'var(--text-muted)';
}

interface Props {
  lang: Lang;
  /** Shows the optional on-device AI second opinion. */
  aiPreview: boolean;
}

/** Rule-based scam detector: everything runs on the device. */
export const ScamChecker: React.FC<Props> = ({ lang, aiPreview }) => {
  const t = STR[lang].tools;
  const ui = CHECKER_UI[lang];
  const [text, setText] = useState('');
  const [result, setResult] = useState<Analysis | null>(null);

  const run = () => {
    const r = analyzeMessage(text);
    setResult(r);
    // Only the score and verdict are counted — never the message.
    track('checker_use', { score: r.score, verdict: r.verdict });
  };

  return (
    <div className="space-y-4">
      <div className="card p-5 sm:p-6">
        <label htmlFor="msg" className="text-sm font-semibold text-[var(--text-heading)]">
          {t.checkerTitle}
        </label>
        <textarea
          id="msg"
          rows={5}
          value={text}
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.checkerPlaceholder}
          className="input mt-3 resize-y font-mono text-sm"
        />
        <p className="mt-1 text-right text-xs text-[var(--text-muted)]">{ui.counter(text.length, MAX_MESSAGE_LENGTH)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button onClick={run} className="btn-primary" disabled={!text.trim()}>
            {t.checkerBtn}
          </button>
          <span className="text-xs text-[var(--text-muted)]">{ui.privacy}</span>
        </div>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          {ui.crossText}{' '}
          <a href="#/outils/vos-donnees/texte" className="inline-flex min-h-11 items-center font-medium text-[var(--accent-text)] underline underline-offset-4">
            {ui.crossCta}
          </a>
        </p>
      </div>

      {result && <Result lang={lang} result={result} />}
      {result && aiPreview && <CheckerAI key={`${result.score}-${text.length}`} lang={lang} text={text} analysis={result} />}
    </div>
  );
};

const Result: React.FC<{ lang: Lang; result: Analysis }> = ({ lang, result }) => {
  const ui = CHECKER_UI[lang];
  const verdict = VERDICT_TEXT[lang][result.verdict];
  const color = VERDICT_COLOR[result.verdict];

  return (
    <div className="card p-5 sm:p-6" aria-live="polite">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-lg font-bold" style={{ color }}>{verdict.label}</p>
        <p className="text-2xl font-extrabold" style={{ color }}>
          {result.score}
          <span className="text-sm font-semibold text-[var(--text-muted)]">/100</span>
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--bg)]" aria-hidden="true">
        <div className="h-full transition-all" style={{ width: `${result.score}%`, background: color }} />
      </div>
      <p className="mt-3 text-sm text-[var(--text-muted)]">{verdict.detail}</p>

      {result.combos.length > 0 && (
        <div className="mt-5 rounded-xl border border-[var(--bad)]/50 bg-[var(--bad)]/5 p-4">
          <p className="text-sm font-semibold text-[var(--text-heading)]">{ui.combos}</p>
          <ul className="mt-2 space-y-1.5">
            {result.combos.map((c) => (
              <li key={c} className="flex gap-2 text-sm text-[var(--text)]">
                <IconAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--bad)]" />
                {COMBO_TEXT[lang][c]}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">{ui.signals}</p>
      {result.signals.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--text-muted)]">{ui.noSignal}</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {result.signals.map((s) => (
            <SignalItem key={s.id} lang={lang} signal={s} />
          ))}
        </ul>
      )}

      {result.urls.length > 0 && (
        <>
          <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">{ui.links}</p>
          <ul className="mt-2 space-y-2">
            {result.urls.map((u) => (
              <li key={u.url} className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm">
                <span className="break-all font-mono text-[var(--text-heading)]">{u.host}</span>
                {u.flags.includes('official') && (
                  <span className="chip" style={{ color: 'var(--good)', borderColor: 'var(--good)' }}>{ui.officialLink}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-5 rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-4">
        <p className="text-sm font-semibold text-[var(--text-heading)]">{ui.advice}</p>
        <ul className="mt-2 space-y-1.5">
          {result.advice.map((a) => (
            <li key={a} className="flex gap-2 text-sm text-[var(--text-muted)]">
              <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--good)]" />
              {ADVICE_TEXT[lang][a]}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-xs text-[var(--text-muted)]">{ui.method}</p>
    </div>
  );
};

const SignalItem: React.FC<{ lang: Lang; signal: Signal }> = ({ lang, signal }) => {
  const text = SIGNAL_TEXT[lang][signal.id];
  const Icon = signal.weight < 0 ? IconCheck : IconAlert;
  return (
    <li className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: signalColor(signal) } as React.CSSProperties} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--text-heading)]">{text.label}</p>
        <p className="mt-0.5 text-sm text-[var(--text-muted)]">{text.detail}</p>
        {signal.evidence && (
          <p className="mt-1 break-words font-mono text-xs text-[var(--text-muted)]">
            {CHECKER_UI[lang].evidence} : « {signal.evidence} »
          </p>
        )}
      </div>
    </li>
  );
};
