import React, { useMemo, useState } from 'react';
import type { Lang } from '../../i18n';
import { LAB_STR, PASSPHRASE_WORDS } from '../../data/labs';
import { analyzePassword, generatePassphrase, humanTime, type FindingKey } from '../../lib/password';
import { IconAlert, IconCheck, IconEye, IconKey, IconLock } from '../icons';

const LEVEL_COLORS = ['var(--bad)', '#fb923c', 'var(--warn)', '#a3e635', 'var(--good)'];
const POSITIVE: FindingKey[] = ['passphrase'];

/**
 * Password strength tester. The value lives only in component state:
 * it is never tracked, stored or sent anywhere.
 */
export const PasswordTester: React.FC<{ lang: Lang }> = ({ lang }) => {
  const s = LAB_STR[lang].pw;
  const [pw, setPw] = useState('');
  const [visible, setVisible] = useState(false);
  const [phrase, setPhrase] = useState('');

  const report = useMemo(() => analyzePassword(pw), [pw]);
  const time = humanTime(report.seconds);
  const color = LEVEL_COLORS[report.level];
  const timeLabel =
    time.unit === 'instant' || time.unit === 'centuries'
      ? s.units[time.unit]
      : `${time.value.toLocaleString(lang)} ${s.units[time.unit]}`;

  return (
    <div className="space-y-4">
      <div className="card p-5 sm:p-6">
        <p className="text-sm text-[var(--text-muted)]">{s.intro}</p>
        <label htmlFor="pw-test" className="mt-4 block text-sm font-semibold text-[var(--text-heading)]">
          {s.label}
        </label>
        <div className="relative mt-2">
          <input
            id="pw-test"
            type={visible ? 'text' : 'password'}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder={s.placeholder}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="input pr-24 font-mono text-base"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-1.5 right-1.5 flex items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-heading)]"
            aria-pressed={visible}
          >
            <IconEye className="h-4 w-4" />
            {visible ? s.hide : s.show}
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)]">{s.advice}</p>

        {pw && (
          <div className="mt-6" aria-live="polite">
            <div className="grid grid-cols-5 gap-1.5" aria-hidden="true">
              {LEVEL_COLORS.map((_, i) => (
                <div
                  key={i}
                  className="h-2 rounded-full transition-colors"
                  style={{ background: i <= report.level ? color : 'var(--bg-elevated)' }}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{s.time}</p>
                <p className="text-3xl font-extrabold" style={{ color }}>{timeLabel}</p>
              </div>
              <span className="chip" style={{ color, borderColor: color }}>
                {s.levels[report.level]}
              </span>
            </div>
            <p className="mt-2 text-xs text-[var(--text-muted)]">{s.basis}</p>

            {report.findings.length > 0 && (
              <>
                <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {s.findings}
                </p>
                <ul className="mt-2 space-y-2">
                  {report.findings.map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm leading-relaxed text-[var(--text)]">
                      {POSITIVE.includes(f) ? (
                        <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--good)]" />
                      ) : (
                        <IconAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warn)]" />
                      )}
                      {s.findingText[f]}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      <div className="card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="icon-tile h-10 w-10 bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
            <IconKey className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold text-[var(--text-heading)]">{s.genTitle}</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{s.genText}</p>
          </div>
        </div>
        {phrase && (
          <p className="mt-4 break-words rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-center font-mono text-lg text-[var(--text-heading)]">
            {phrase}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={() => setPhrase(generatePassphrase(PASSPHRASE_WORDS, 5))} className="btn-primary">
            {s.genBtn}
          </button>
          {phrase && (
            <button onClick={() => setPw(phrase)} className="btn-ghost">
              {s.genTry}
            </button>
          )}
        </div>
      </div>

      <ul className="card space-y-2.5 p-5 sm:p-6">
        {s.tips.map((tip) => (
          <li key={tip} className="flex gap-3 text-sm leading-relaxed text-[var(--text)]">
            <IconLock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
};
