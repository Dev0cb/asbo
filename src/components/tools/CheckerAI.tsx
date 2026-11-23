import React, { useState } from 'react';
import type { Lang } from '../../i18n';
import type { Analysis } from '../../lib/scamCheck';
import { generate, interrupt } from '../../lib/llm/engine';
import { checkerMessages } from '../../lib/llm/prompts';
import { track } from '../../lib/stats';
import { AIStatusLine, AI_STR, LocalAIGate, useLocalLLM } from './LocalAI';

const STR = {
  fr: {
    title: 'Analyse approfondie par l\'IA',
    help: 'L\'IA lit le message comme une personne attentive et explique son avis, en s\'appuyant sur les signaux détectés ci-dessus.',
    run: 'Analyser avec l\'IA',
    again: 'Relancer l\'analyse',
    thinking: 'L\'IA lit le message…',
    failed: 'L\'analyse n\'a pas abouti. Réessayez.',
  },
  en: {
    title: 'In-depth AI analysis',
    help: 'The AI reads the message like a careful person and explains its view, building on the signals detected above.',
    run: 'Analyse with AI',
    again: 'Run again',
    thinking: 'The AI is reading the message…',
    failed: 'The analysis did not complete. Try again.',
  },
};

/** Second opinion on a pasted message, generated on-device. */
export const CheckerAI: React.FC<{ lang: Lang; text: string; analysis: Analysis }> = ({ lang, text, analysis }) => {
  const s = STR[lang];
  const ai = AI_STR[lang];
  const st = useLocalLLM();
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [failed, setFailed] = useState(false);

  const run = async () => {
    setRunning(true);
    setFailed(false);
    setOutput('');
    try {
      const answer = await generate(checkerMessages(text, analysis, lang), setOutput, 180);
      setOutput(answer);
      track('lab_complete', { lab: 'checker_ai', lang });
    } catch {
      setFailed(true);
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="card p-5 sm:p-6" aria-labelledby="checker-ai-title">
      <h3 id="checker-ai-title" className="font-sans text-base font-semibold text-[var(--text-heading)]">{s.title}</h3>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{s.help}</p>
      <div className="mt-4">
        <LocalAIGate lang={lang}>
          <AIStatusLine lang={lang} />
          {(output || running) && (
            <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4" aria-live="polite">
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-[var(--text)]">
                {output || <span className="text-[var(--text-muted)]">{s.thinking}</span>}
              </p>
            </div>
          )}
          {failed && <p className="mt-3 text-sm text-[var(--bad)]">{s.failed}</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            {running && st.status === 'generating' ? (
              <button type="button" onClick={interrupt} className="btn-ghost">{ai.stop}</button>
            ) : (
              <button type="button" onClick={() => void run()} disabled={running} className="btn-primary">
                {output ? s.again : s.run}
              </button>
            )}
          </div>
          <p className="mt-3 text-xs text-[var(--text-muted)]">{ai.disclaimer}</p>
        </LocalAIGate>
      </div>
    </section>
  );
};
