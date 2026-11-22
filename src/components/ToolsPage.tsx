import React, { useEffect, useMemo, useState } from 'react';
import { STR, QUIZ, CHECKLIST, quizResult, type Lang } from '../i18n';
import { LAB_STR, QUIZ_WHY } from '../data/labs';
import { analyzeMessage, type Analysis } from '../lib/scamCheck';
import { track } from '../lib/stats';
import { IconCheck, IconAlert, IconArrow } from './icons';
import { PhishingTrainer } from './tools/PhishingTrainer';
import { PasswordTester } from './tools/PasswordTester';
import { FootprintLab } from './tools/FootprintLab';

interface Props {
  lang: Lang;
  slug?: string;
}

// URL slug for each tool, e.g. #/outils/mot-de-passe (shareable links).
const TOOL_SLUGS = {
  quiz: 'quiz',
  phishing: 'vrai-ou-arnaque',
  checker: 'detecteur',
  password: 'mot-de-passe',
  footprint: 'vos-donnees',
  checklist: 'checklist',
} as const;

type Tab = keyof typeof TOOL_SLUGS;

function tabFromSlug(slug?: string): Tab {
  const found = (Object.keys(TOOL_SLUGS) as Tab[]).find((k) => TOOL_SLUGS[k] === slug);
  return found ?? 'quiz';
}

export const ToolsPage: React.FC<Props> = ({ lang, slug }) => {
  const t = STR[lang];
  const [tab, setTab] = useState<Tab>(() => tabFromSlug(slug));

  // Follow external navigation (e.g. a link to #/outils/mot-de-passe).
  useEffect(() => {
    setTab(tabFromSlug(slug));
  }, [slug]);

  const selectTab = (id: Tab) => {
    setTab(id);
    // Update the URL without triggering a hashchange (no scroll jump).
    history.replaceState(null, '', `#/outils/${TOOL_SLUGS[id]}`);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'quiz', label: t.tools.quizTab },
    { id: 'phishing', label: t.tools.phishTab },
    { id: 'checker', label: t.tools.checkerTab },
    { id: 'password', label: t.tools.pwTab },
    { id: 'footprint', label: t.tools.fpTab },
    { id: 'checklist', label: t.tools.checkTab },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-heading)] sm:text-4xl">
        {t.tools.title}
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--text-muted)]">{t.tools.intro}</p>

      <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6" role="tablist">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            role="tab"
            aria-selected={tab === tb.id}
            onClick={() => selectTab(tb.id)}
            className={`rounded-lg px-2 py-2.5 text-center text-xs font-medium leading-tight transition-colors sm:px-2 sm:text-sm ${
              tab === tb.id
                ? 'bg-[var(--color-accent)] text-[#1a1207]'
                : 'border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'quiz' && <Quiz lang={lang} />}
        {tab === 'phishing' && <PhishingTrainer lang={lang} />}
        {tab === 'checker' && <Checker lang={lang} />}
        {tab === 'password' && <PasswordTester lang={lang} />}
        {tab === 'footprint' && <FootprintLab lang={lang} />}
        {tab === 'checklist' && <Checklist lang={lang} />}
      </div>
    </div>
  );
};

/* ---------------- Quiz ---------------- */

const Quiz: React.FC<{ lang: Lang }> = ({ lang }) => {
  const t = STR[lang];
  const questions = QUIZ[lang];
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const score = useMemo(
    () => answers.reduce((sum, a, i) => sum + (questions[i]?.options[a]?.score ?? 0), 0),
    [answers, questions],
  );

  const answered = answers[idx] !== undefined;

  // Pick an option: show feedback + explanation, wait for "Next".
  const answer = (optIdx: number) => {
    if (answered) return;
    const next = [...answers];
    next[idx] = optIdx;
    setAnswers(next);
  };

  const goNext = () => {
    if (idx + 1 >= questions.length) {
      setDone(true);
      track('quiz_complete', { score, max: questions.length * 2, lang });
    } else {
      setIdx(idx + 1);
    }
  };

  const restart = () => {
    setIdx(0);
    setAnswers([]);
    setDone(false);
  };

  if (done) {
    const res = quizResult(score, lang);
    const max = questions.length * 2;
    return (
      <div className="card p-6 text-center sm:p-10">
        <p className="text-sm uppercase tracking-widest text-[var(--text-muted)]">
          {t.tools.quizResult}
        </p>
        <p className="mt-2 text-6xl font-extrabold" style={{ color: res.color }}>
          {score}<span className="text-2xl text-[var(--text-muted)]">/{max}</span>
        </p>
        <p className="mt-2 text-xl font-bold" style={{ color: res.color }}>
          {res.level}
        </p>
        <p className="mx-auto mt-4 max-w-md text-[var(--text-muted)]">{res.msg}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={restart} className="btn-primary">
            {t.tools.quizRestart}
          </button>
          <button
            onClick={() => {
              const text = `Sécurité — ${t.tools.quizResult} : ${score}/${max} (${res.level})`;
              if (navigator.share) {
                navigator.share({ text }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(text).catch(() => {});
              }
              track('outbound_click', { target: 'quiz-share' });
            }}
            className="btn-ghost"
          >
            {t.tools.quizShare}
          </button>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
        <span>
          {t.tools.quizQuestion} {idx + 1} {t.tools.quizOf} {questions.length}
        </span>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[var(--bg)] sm:w-48">
          <div
            className="h-full bg-[var(--color-accent)] transition-all"
            style={{ width: `${((idx + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>
      <h2 className="mt-6 text-xl font-bold leading-snug text-[var(--text-heading)] sm:text-2xl">
        {q.q}
      </h2>
      <div className="mt-6 space-y-3">
        {q.options.map((o, i) => {
          const picked = answers[idx] === i;
          const isBest = o.score === 2;
          let style = 'border-[var(--border)] text-[var(--text)] hover:border-[var(--color-accent)] hover:bg-[var(--bg-elevated)]';
          if (answered && isBest) style = 'border-[var(--good)] bg-[var(--good)]/10 text-[var(--text-heading)]';
          else if (answered && picked) style = 'border-[var(--bad)] bg-[var(--bad)]/10 text-[var(--text-heading)]';
          else if (answered) style = 'border-[var(--border)] text-[var(--text-muted)] opacity-60';
          return (
            <button
              key={i}
              onClick={() => answer(i)}
              disabled={answered}
              className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm leading-relaxed transition-all ${style}`}
            >
              <span className="flex-1">{o.text}</span>
              {answered && isBest && <IconCheck className="h-5 w-5 shrink-0 text-[var(--good)]" />}
              {answered && picked && !isBest && <IconAlert className="h-5 w-5 shrink-0 text-[var(--bad)]" />}
            </button>
          );
        })}
      </div>
      {answered && <QuizFeedback lang={lang} score={q.options[answers[idx]].score} why={QUIZ_WHY[lang][idx]} last={idx + 1 >= questions.length} onNext={goNext} />}
    </div>
  );
};

const QuizFeedback: React.FC<{
  lang: Lang;
  score: number;
  why?: string;
  last: boolean;
  onNext: () => void;
}> = ({ lang, score, why, last, onNext }) => {
  const s = LAB_STR[lang];
  const verdict = score === 2 ? s.quizGood : score === 1 ? s.quizPartial : s.quizBad;
  const color = score === 2 ? 'var(--good)' : score === 1 ? 'var(--warn)' : 'var(--bad)';
  return (
    <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4" aria-live="polite">
      <p className="font-bold" style={{ color }}>{verdict}</p>
      {why && <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{why}</p>}
      <button onClick={onNext} className="btn-primary mt-4">
        {last ? s.quizSeeResult : s.quizNext}
        <IconArrow className="h-4 w-4" />
      </button>
    </div>
  );
};

/* ---------------- Scam Checker ---------------- */

const verdictConfig: Record<Analysis['verdict'], { color: string; labelKey: string }> = {
  danger: { color: 'var(--bad)', labelKey: 'checkerVerdictDanger' },
  suspect: { color: 'var(--warn)', labelKey: 'checkerVerdictSuspect' },
  unclear: { color: 'var(--text-muted)', labelKey: 'checkerVerdictUnclear' },
  'probably-ok': { color: 'var(--good)', labelKey: 'checkerVerdictOk' },
};

const Checker: React.FC<{ lang: Lang }> = ({ lang }) => {
  const t = STR[lang];
  const [text, setText] = useState('');
  const [result, setResult] = useState<Analysis | null>(null);

  const run = () => {
    const r = analyzeMessage(text);
    setResult(r);
    track('checker_use', { score: r.score, verdict: r.verdict });
  };

  const vc = result ? verdictConfig[result.verdict] : null;

  return (
    <div className="space-y-4">
      <div className="card p-5 sm:p-6">
        <label htmlFor="msg" className="text-sm font-semibold text-[var(--text-heading)]">
          {t.tools.checkerTitle}
        </label>
        <textarea
          id="msg"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.tools.checkerPlaceholder}
          className="input mt-3 resize-y font-mono text-sm"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={run} className="btn-primary" disabled={!text.trim()}>
            {t.tools.checkerBtn}
          </button>
          <span className="text-xs text-[var(--text-muted)]">{t.tools.checkerLocal}</span>
        </div>
      </div>

      {result && vc && (
        <div className="card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-lg font-bold" style={{ color: vc.color }}>
              {t.tools[vc.labelKey as keyof typeof t.tools] as string}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-muted)]">{t.tools.checkerScore}</span>
              <span className="text-2xl font-extrabold" style={{ color: vc.color }}>
                {result.score}
              </span>
            </div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--bg)]">
            <div
              className="h-full transition-all"
              style={{ width: `${result.score}%`, background: vc.color }}
            />
          </div>
          {result.findings.length > 0 && (
            <ul className="mt-5 space-y-3">
              {result.findings.map((f, i) => (
                <li key={i} className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
                  <IconAlert
                    className="mt-0.5 h-5 w-5 shrink-0"
                    style={{ color: f.severity === 'high' ? 'var(--bad)' : f.severity === 'medium' ? 'var(--warn)' : 'var(--text-muted)' } as React.CSSProperties}
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-heading)]">{f.label}</p>
                    <p className="mt-0.5 text-sm text-[var(--text-muted)]">{f.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-4">
            <p className="text-sm font-semibold text-[var(--text-heading)]">{t.tools.checkerTip}</p>
            <ul className="mt-2 space-y-1.5">
              {result.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-[var(--text-muted)]">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--good)]" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------- Checklist ---------------- */

const Checklist: React.FC<{ lang: Lang }> = ({ lang }) => {
  const t = STR[lang];
  const items = CHECKLIST[lang];
  const key = `securite-checklist-${lang}`;
  const [checked, setChecked] = useState<boolean[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      return items.map((_, i) => Boolean(saved[i]));
    } catch {
      return items.map(() => false);
    }
  });

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      const done = next.filter(Boolean).length;
      track('checklist_update', { done, total: items.length, lang });
      return next;
    });
  };

  const done = checked.filter(Boolean).length;
  const pct = Math.round((done / items.length) * 100);

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-heading)]">{t.tools.checkTitle}</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t.tools.checkIntro}</p>
        </div>
        <span className="chip">
          {done}/{items.length} {t.tools.checkDone} — {pct}%
        </span>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[var(--bg)]">
        <div
          className="h-full bg-[var(--good)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="mt-5 space-y-2">
        {items.map((item, i) => (
          <li key={i}>
            <button
              onClick={() => toggle(i)}
              className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                checked[i]
                  ? 'border-[var(--good)]/50 bg-[var(--good)]/5'
                  : 'border-[var(--border)] hover:border-[var(--color-accent)]'
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                  checked[i]
                    ? 'border-[var(--good)] bg-[var(--good)] text-[#06281c]'
                    : 'border-[var(--border)] text-transparent'
                }`}
              >
                <IconCheck className="h-3.5 w-3.5" />
              </span>
              <span
                className={`text-sm leading-relaxed ${
                  checked[i] ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text)]'
                }`}
              >
                {item}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            setChecked(items.map(() => true));
            localStorage.setItem(key, JSON.stringify(items.map(() => true)));
          }}
          className="btn-ghost text-xs"
        >
          {t.tools.checkAll}
        </button>
        <button
          onClick={() => {
            setChecked(items.map(() => false));
            localStorage.setItem(key, JSON.stringify(items.map(() => false)));
          }}
          className="btn-ghost text-xs"
        >
          {t.tools.checkNone}
        </button>
        <button
          onClick={() => {
            setChecked(items.map(() => false));
            localStorage.removeItem(key);
          }}
          className="btn-ghost ml-auto text-xs"
        >
          {t.tools.checkReset}
        </button>
      </div>
    </div>
  );
};
