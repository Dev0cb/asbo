import React from 'react';
import { STR, type Lang } from '../i18n';
import { COUNTRIES, useCountry, type CountryCode } from '../lib/country';

interface Props {
  lang: Lang;
  /** Shows the one-line explanation under the select. */
  withHint?: boolean;
  className?: string;
}

/** Global country setting (remembered on this device only). */
export const CountryPicker: React.FC<Props> = ({ lang, withHint = false, className = '' }) => {
  const t = STR[lang].ui;
  const { country, setCountry } = useCountry();
  const id = React.useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--text-heading)]">
        {t.countryLabel}
      </label>
      <select
        id={id}
        value={country.code}
        onChange={(e) => setCountry(e.target.value as CountryCode)}
        className="input mt-1.5 max-w-xs"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name[lang]}
          </option>
        ))}
      </select>
      {withHint && <p className="mt-1.5 text-xs text-[var(--text-muted)]">{t.countryHint}</p>}
    </div>
  );
};
