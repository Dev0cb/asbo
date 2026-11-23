import React from 'react';
import type { Lang } from '../i18n';
import { COUNTRIES, useCountry, type CountryCode } from '../lib/country';

interface Props {
  lang: Lang;
  /** Contextual label, e.g. "Pays de l'organisation" in the letter generator. */
  label: string;
  hint?: string;
  className?: string;
}

/** Senegal / other-country setting (remembered on this device only). */
export const CountryPicker: React.FC<Props> = ({ lang, label, hint, className = '' }) => {
  const { country, setCountry } = useCountry();
  const id = React.useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--text-heading)]">
        {label}
      </label>
      <select
        id={id}
        value={country.code}
        onChange={(e) => setCountry(e.target.value as CountryCode)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="input mt-1.5 max-w-xs"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name[lang]}
          </option>
        ))}
      </select>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-[var(--text-muted)]">
          {hint}
        </p>
      )}
    </div>
  );
};
