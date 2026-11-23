import React, { useState } from 'react';
import type { Lang } from '../../i18n';
import { DETECTOR_TEXT, EXPOSURE_UI } from '../../data/exposure';
import { buildReport } from '../../lib/exposure/model';
import { MAX_SCAN_LENGTH, scanText, type ScanReport, type ScanSeverity } from '../../lib/exposure/textScan';
import { track } from '../../lib/stats';
import { fillCountry, useCountry } from '../../lib/country';
import { IconAlert } from '../icons';
import { Dashboard, ScenarioList, countActions } from './ExposureAudit';

const SEVERITY_COLOR: Record<ScanSeverity, string> = {
  low: 'var(--text-muted)',
  medium: 'var(--warn)',
  high: 'var(--bad)',
  critical: 'var(--bad)',
};

/** Mode 2: what does a text I am about to publish (or already did) reveal? */
export const ExposureScan: React.FC<{ lang: Lang }> = ({ lang }) => {
  const ui = EXPOSURE_UI[lang];
  const { country } = useCountry();
  const [text, setText] = useState('');
  const [scan, setScan] = useState<ScanReport | null>(null);

  const run = () => {
    const r = scanText(text);
    setScan(r);
    // Only the number of findings is counted — never the text.
    track('lab_complete', { lab: 'exposure_scan', score: r.findings.length, lang });
  };

  const report = scan ? buildReport(scan.access) : null;

  return (
    <div className="space-y-4">
      <div className="card p-5 sm:p-6">
        <p className="text-sm text-[var(--text-muted)]">{ui.scanIntro}</p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {ui.crossText}{' '}
          <a href="#/outils/detecteur" className="inline-flex min-h-11 items-center font-medium text-[var(--accent-text)] underline underline-offset-4">
            {ui.crossCta}
          </a>
        </p>
        <textarea
          aria-label={ui.scanBtn}
          rows={6}
          value={text}
          maxLength={MAX_SCAN_LENGTH}
          onChange={(e) => setText(e.target.value)}
          placeholder={ui.scanPlaceholder}
          className="input mt-3 resize-y text-sm"
        />
        <p className="mt-1 text-right text-xs text-[var(--text-muted)]">{ui.counter(text.length, MAX_SCAN_LENGTH)}</p>
        <button type="button" onClick={run} disabled={!text.trim()} className="btn-primary mt-3">
          {ui.scanBtn}
        </button>
      </div>

      {scan && report && (
        <>
          <div className="card p-5 sm:p-6" aria-live="polite">
            <h3 className="font-semibold text-[var(--text-heading)]">{ui.scanFound}</h3>
            {scan.findings.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--text-muted)]">{ui.scanNone}</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {scan.findings.map((f) => (
                  <li key={f.id} className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
                    <IconAlert className="mt-0.5 h-5 w-5 shrink-0" style={{ color: SEVERITY_COLOR[f.severity] } as React.CSSProperties} />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--text-heading)]">
                        {DETECTOR_TEXT[lang][f.id].label}
                        <span className="chip text-xs">{ui.found}</span>
                      </p>
                      <p className="mt-0.5 text-sm text-[var(--text-muted)]">{fillCountry(DETECTOR_TEXT[lang][f.id].why, country, lang)}</p>
                      <p className="mt-1 break-words font-mono text-xs text-[var(--text-muted)]">{f.examples.join(' · ')}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {scan.findings.length > 0 && (
            <>
              <Dashboard lang={lang} report={report} actions={countActions(report, lang)} />
              <ScenarioList lang={lang} scenarios={report.scenarios} access={scan.access} />
            </>
          )}
        </>
      )}
    </div>
  );
};
