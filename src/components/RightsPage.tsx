import React, { useEffect } from 'react';
import { STR, type Lang } from '../i18n';
import { track } from '../lib/stats';
import { IconScale, IconAlert, IconExternal } from './icons';

interface Props {
  lang: Lang;
}

const RIGHT_KEYS = ['r1', 'r2', 'r3', 'r4'] as const;

export const RightsPage: React.FC<Props> = ({ lang }) => {
  const t = STR[lang];

  useEffect(() => {
    track('page_view', { page: 'rights' });
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <IconScale className="h-9 w-9 text-[var(--color-accent)]" />
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-heading)] sm:text-4xl">
          {t.rights.title}
        </h1>
      </div>
      <p className="mt-4 max-w-2xl text-lg text-[var(--text-muted)]">{t.rights.intro}</p>

      <section className="card mt-8 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-[var(--text-heading)]">{t.rights.lawTitle}</h2>
        <p className="mt-2 leading-relaxed text-[var(--text-muted)]">{t.rights.lawText}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-[var(--text-heading)]">{t.rights.rightsTitle}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {RIGHT_KEYS.map((k) => (
            <div key={k} className="card p-5">
              <h3 className="font-semibold text-[var(--color-accent)]">{t.rights[`${k}t` as const]}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                {t.rights[`${k}d` as const]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="card mt-8 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-[var(--text-heading)]">{t.rights.howTitle}</h2>
        <ol className="mt-4 space-y-3">
          {t.rights.howSteps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 font-mono text-sm font-bold text-[var(--color-accent)]">
                {i + 1}
              </span>
              <span className="leading-relaxed text-[var(--text-muted)]">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="card mt-8 border-[var(--color-accent)]/30 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-[var(--text-heading)]">{t.rights.cdpTitle}</h2>
        <p className="mt-2 leading-relaxed text-[var(--text-muted)]">{t.rights.cdpText}</p>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="text-[var(--text-muted)]">
            <span className="font-medium text-[var(--text-heading)]">{lang === 'fr' ? 'Adresse' : 'Address'} :</span>{' '}
            {t.rights.cdpAddr}
          </li>
          <li className="text-[var(--text-muted)]">
            <span className="font-medium text-[var(--text-heading)]">Tél :</span> {t.rights.cdpPhone}
          </li>
          <li>
            <a
              href="https://www.cdp.sn"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('outbound_click', { target: 'cdp' })}
              className="inline-flex items-center gap-1 font-medium text-[var(--color-accent)] hover:underline"
            >
              {t.rights.cdpSite} <IconExternal className="h-3.5 w-3.5" />
            </a>
          </li>
        </ul>
        <a
          href="https://www.cdp.sn"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('outbound_click', { target: 'cdp' })}
          className="btn-primary mt-5"
        >
          {t.rights.cdpCta} <IconExternal className="h-4 w-4" />
        </a>
      </section>

      <div className="mt-8 flex gap-3 rounded-xl border border-[var(--bad)]/40 bg-[var(--bad)]/5 p-4">
        <IconAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--bad)]" />
        <div>
          <p className="text-sm font-semibold text-[var(--text-heading)]">{t.rights.warnTitle}</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t.rights.warnText}</p>
        </div>
      </div>
    </div>
  );
};
