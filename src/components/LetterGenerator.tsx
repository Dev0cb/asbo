import React, { useMemo, useState } from 'react';
import type { Lang } from '../i18n';
import {
  EMPTY_FIELDS,
  LETTER_KINDS,
  LETTER_STR,
  buildLetter,
  letterLanguage,
  RIGHT_OF,
  type LetterFields,
  type LetterKind,
} from '../data/letters';
import { track } from '../lib/stats';
import { useCountry } from '../lib/country';
import { IconCheck } from './icons';

const KINDS = Object.keys(LETTER_KINDS) as LetterKind[];

interface FieldProps {
  id: keyof LetterFields;
  label: string;
  value: string;
  onChange: (id: keyof LetterFields, value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  autoComplete?: string;
}

const Field: React.FC<FieldProps> = ({ id, label, value, onChange, placeholder, multiline, autoComplete }) => (
  <div>
    <label htmlFor={`letter-${id}`} className="block text-sm font-medium text-[var(--text-heading)]">
      {label}
    </label>
    {multiline ? (
      <textarea
        id={`letter-${id}`}
        rows={3}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(id, e.target.value)}
        className="input mt-1.5 resize-y"
      />
    ) : (
      <input
        id={`letter-${id}`}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(id, e.target.value)}
        className="input mt-1.5"
      />
    )}
  </div>
);

/**
 * Drafts a rights request letter, based on the selected country's law.
 * Personal details live only in component state: never tracked or stored.
 */
export const LetterGenerator: React.FC<{ lang: Lang }> = ({ lang }) => {
  const s = LETTER_STR[lang];
  const [kind, setKind] = useState<LetterKind>('acces');
  const [fields, setFields] = useState<LetterFields>(EMPTY_FIELDS);
  const [copied, setCopied] = useState(false);

  const { country } = useCountry();
  const letter = useMemo(() => buildLetter(kind, fields, country, lang), [kind, fields, country, lang]);
  const letterLang = letterLanguage(country, lang);
  const lawNote = s.lawNote(country.name[lang], country.authority ? country.authority.lawShort : null);
  const langNote = s.langNote(letterLang);
  const meta = LETTER_KINDS[kind];

  const update = (id: keyof LetterFields, value: string) => {
    setFields((prev) => ({ ...prev, [id]: value }));
    setCopied(false);
  };

  // Only the kind of letter is counted — never its content.
  const report = (action: string) => track('lab_complete', { lab: 'letter', kind, action, lang });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      report('copy');
    } catch {
      setCopied(false);
    }
  };

  const share = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ text: letter });
      report('share');
    } catch {
      /* user cancelled the share sheet */
    }
  };

  return (
    <section id="lettre" className="mt-16 scroll-mt-24">
      <p className="eyebrow">{s.eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-[var(--text-heading)] sm:text-4xl">{s.title}</h2>
      <p className="mt-3 max-w-2xl text-[var(--text-muted)]">{s.intro}</p>

      <fieldset className="mt-8">
        <legend className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">{s.kind}</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {KINDS.map((k) => {
            const active = k === kind;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                aria-pressed={active}
                className={`flex min-h-11 flex-col items-start rounded-lg border px-3.5 py-3 text-left transition-colors ${
                  active
                    ? 'border-[var(--rule)] bg-[var(--bg-card)] text-[var(--text-heading)]'
                    : 'border-[var(--border)] text-[var(--text)] hover:border-[var(--rule)]'
                }`}
              >
                <span className="flex w-full items-center justify-between gap-2 text-sm font-semibold">
                  {LETTER_KINDS[k].label[lang]}
                  {active && <IconCheck className="h-4 w-4 shrink-0 text-[var(--accent-text)]" />}
                </span>
                {country.articles && (
                  <span className="mt-1 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
                    {country.articles[RIGHT_OF[k]]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-[var(--text-muted)]">{meta.hint[lang]}</p>
      </fieldset>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="card space-y-5 p-5 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">{s.you}</p>
          <Field id="fullName" label={s.fullName} value={fields.fullName} onChange={update} autoComplete="name" />
          <Field id="address" label={s.address} value={fields.address} onChange={update} autoComplete="street-address" />
          <Field id="contact" label={s.contact} value={fields.contact} onChange={update} />
          <Field id="city" label={s.city} value={fields.city} onChange={update} placeholder={s.cityPlaceholder} autoComplete="address-level2" />
          <p className="border-t border-[var(--border)] pt-5 font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
            {s.org}
          </p>
          <Field id="orgName" label={s.orgName} value={fields.orgName} onChange={update} placeholder={s.orgPlaceholder} />
          <Field id="orgAddress" label={s.orgAddress} value={fields.orgAddress} onChange={update} />
          <Field id="reference" label={s.reference} value={fields.reference} onChange={update} />
          <Field
            id="details"
            label={meta.detailsLabel[lang]}
            value={fields.details}
            onChange={update}
            multiline
          />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">{s.preview}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copy} className="btn-primary">
                {copied ? <IconCheck className="h-4 w-4" /> : null}
                {copied ? s.copied : s.copy}
              </button>
              <button
                type="button"
                onClick={() => {
                  report('print');
                  window.print();
                }}
                className="btn-ghost"
              >
                {s.print}
              </button>
              <button type="button" onClick={share} className="btn-ghost">
                {s.share}
              </button>
            </div>
          </div>
          <pre
            className="print-area mt-3 max-h-[70vh] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 font-display text-[15px] leading-relaxed text-[var(--text-heading)] sm:p-7"
            aria-live="polite"
          >
            {letter}
          </pre>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{lawNote}</p>
          {langNote && <p className="mt-2 text-xs text-[var(--text-muted)]">{langNote}</p>}
        </div>
      </div>
    </section>
  );
};
