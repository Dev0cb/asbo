import React, { useEffect, useRef, useState } from 'react';
import type { Lang } from '../../i18n';
import type { Guide } from '../../data/guides';
import { generate, interrupt } from '../../lib/llm/engine';
import { assistantMessages } from '../../lib/llm/prompts';
import type { ChatMessage } from '../../lib/llm/protocol';
import { navigate } from '../../lib/router';
import { track } from '../../lib/stats';
import { AIStatusLine, AI_STR, LocalAIGate, useLocalLLM } from './LocalAI';

const STR = {
  fr: {
    intro: 'Posez votre question de sécurité en langage simple. L\'assistant répond à partir des guides ASBO, directement sur votre appareil.',
    placeholder: 'Ex : J\'ai donné mon code Wave à quelqu\'un, que faire ?',
    send: 'Envoyer',
    suggestions: [
      'J\'ai donné mon code à quelqu\'un, que faire ?',
      'Comment reconnaître un faux SMS Wave ?',
      'Comment protéger mon compte WhatsApp ?',
      'Mon enfant veut un compte TikTok, que faire ?',
    ],
    sources: 'D\'après les guides :',
    you: 'Vous',
    assistant: 'Assistant ASBO',
    thinking: 'L\'assistant réfléchit…',
    failed: 'L\'assistant n\'a pas pu répondre. Réessayez.',
    clear: 'Nouvelle conversation',
  },
  en: {
    intro: 'Ask your safety question in plain words. The assistant answers from ASBO\'s guides, right on your device.',
    placeholder: 'E.g. I gave my Wave code to someone, what should I do?',
    send: 'Send',
    suggestions: [
      'I gave my code to someone, what should I do?',
      'How do I spot a fake Wave SMS?',
      'How do I protect my WhatsApp account?',
      'My child wants a TikTok account, what should I do?',
    ],
    sources: 'Based on the guides:',
    you: 'You',
    assistant: 'ASBO assistant',
    thinking: 'The assistant is thinking…',
    failed: 'The assistant could not answer. Try again.',
    clear: 'New conversation',
  },
};

interface Turn {
  role: 'user' | 'assistant';
  content: string;
  sources?: Guide[];
  failed?: boolean;
}

const MAX_QUESTION = 500;

export const AssistantLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const s = STR[lang];
  const ai = AI_STR[lang];
  const st = useLocalLLM();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const busy = st.status === 'generating' || (st.status === 'downloading' && turns.at(-1)?.role === 'assistant' && !turns.at(-1)?.content);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [turns]);

  const ask = async (question: string) => {
    const q = question.trim().slice(0, MAX_QUESTION);
    if (!q || busy) return;
    const history: ChatMessage[] = turns.filter((t) => !t.failed).map(({ role, content }) => ({ role, content }));
    const { messages, sources } = assistantMessages(q, history, lang);
    setDraft('');
    setTurns((prev) => [...prev, { role: 'user', content: q }, { role: 'assistant', content: '', sources }]);
    const update = (patch: Partial<Turn>) =>
      setTurns((prev) => prev.map((t, i) => (i === prev.length - 1 ? { ...t, ...patch } : t)));
    try {
      const answer = await generate(messages, (text) => update({ content: text }), 220);
      update({ content: answer });
      track('lab_complete', { lab: 'assistant', lang });
    } catch {
      update({ content: s.failed, failed: true });
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--text-muted)]">{s.intro}</p>
      <LocalAIGate lang={lang}>
        <div className="card flex flex-col p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <AIStatusLine lang={lang} />
            {turns.length > 0 && !busy && (
              <button type="button" onClick={() => setTurns([])} className="min-h-11 text-sm font-medium text-[var(--accent-text)]">
                {s.clear}
              </button>
            )}
          </div>

          {turns.length === 0 ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {s.suggestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void ask(q)}
                  className="min-h-11 rounded-lg border border-[var(--border)] px-3.5 py-2.5 text-left text-sm text-[var(--text)] transition-colors hover:border-[var(--rule)]"
                >
                  {q}
                </button>
              ))}
            </div>
          ) : (
            <ol className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-1" aria-live="polite">
              {turns.map((t, i) => (
                <li key={i} className={t.role === 'user' ? 'flex justify-end' : ''}>
                  <div
                    className={
                      t.role === 'user'
                        ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-[var(--text-heading)] px-4 py-2.5 text-[15px] text-[var(--bg)]'
                        : 'max-w-[95%]'
                    }
                  >
                    {t.role === 'assistant' && (
                      <p className="mb-1 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">{s.assistant}</p>
                    )}
                    <p className={`whitespace-pre-line text-[15px] leading-relaxed ${t.role === 'assistant' ? (t.failed ? 'text-[var(--bad)]' : 'text-[var(--text)]') : ''}`}>
                      {t.content || (t.role === 'assistant' ? <span className="text-[var(--text-muted)]">{s.thinking}</span> : null)}
                    </p>
                    {t.role === 'assistant' && t.content && !t.failed && t.sources && t.sources.length > 0 && (
                      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--text-muted)]">
                        {s.sources}
                        {t.sources.map((g) => (
                          <a
                            key={g.slug}
                            href={`#/guides/${g.slug}`}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/guides/${g.slug}`);
                            }}
                            className="inline-flex min-h-11 items-center font-medium text-[var(--accent-text)] underline-offset-4 hover:underline"
                          >
                            {g.title}
                          </a>
                        ))}
                      </p>
                    )}
                  </div>
                </li>
              ))}
              <div ref={endRef} />
            </ol>
          )}

          <form
            className="mt-4 flex gap-2 border-t border-[var(--border)] pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              void ask(draft);
            }}
          >
            <label htmlFor="assistant-q" className="sr-only">{s.placeholder}</label>
            <input
              id="assistant-q"
              value={draft}
              maxLength={MAX_QUESTION}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={s.placeholder}
              className="input flex-1"
              autoComplete="off"
            />
            {busy ? (
              <button type="button" onClick={interrupt} className="btn-ghost shrink-0">{ai.stop}</button>
            ) : (
              <button type="submit" disabled={!draft.trim()} className="btn-primary shrink-0">{s.send}</button>
            )}
          </form>
          <p className="mt-2 text-xs text-[var(--text-muted)]">{ai.disclaimer}</p>
        </div>
      </LocalAIGate>
    </div>
  );
};
