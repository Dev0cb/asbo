// Shared UI for the on-device AI: opt-in download, progress, states.
// The model is never downloaded without an explicit tap (it weighs ~500 MB).
import React, { useSyncExternalStore } from 'react';
import type { Lang } from '../../i18n';
import { llm, loadModel, type LLMState } from '../../lib/llm/engine';
import { MODEL_SIZE_MB } from '../../lib/llm/protocol';
import { IconAlert, IconLock } from '../icons';

export function useLocalLLM(): LLMState {
  return useSyncExternalStore(llm.subscribe, llm.getState, llm.getState);
}

export const AI_STR = {
  fr: {
    badge: 'IA locale',
    title: 'Activer l\'intelligence artificielle sur cet appareil',
    text: `Une petite IA (≈ ${MODEL_SIZE_MB} Mo) se télécharge une seule fois dans votre navigateur. Ensuite, elle fonctionne même sans connexion, et vos messages ne quittent jamais votre téléphone.`,
    wifi: `Conseillé : utilisez le Wi-Fi, le téléchargement consomme environ ${MODEL_SIZE_MB} Mo de données.`,
    saveData: 'Votre navigateur est en mode « économie de données » : le téléchargement est déconseillé sur ce réseau.',
    lowMemory: 'Votre appareil dispose de peu de mémoire : l\'IA peut être lente ou ne pas démarrer.',
    activate: `Télécharger l'IA (${MODEL_SIZE_MB} Mo)`,
    downloading: 'Téléchargement de l\'IA…',
    preparing: 'Préparation de l\'IA…',
    keepOpen: 'Gardez cette page ouverte. Le téléchargement ne se fait qu\'une fois.',
    ready: 'IA prête',
    readyDevice: { webgpu: 'accélérée par la carte graphique' },
    unsupported: 'Cet appareil ou ce navigateur ne peut pas faire tourner l\'IA locale (il faut WebGPU, présent dans Chrome récent sur ordinateur et sur les téléphones Android récents). L\'analyse automatique ci-dessus et tous les autres outils restent disponibles.',
    error: 'Le téléchargement de l\'IA a échoué. Vérifiez votre connexion puis réessayez.',
    retry: 'Réessayer',
    privacy: 'Tout est calculé sur votre appareil : rien n\'est envoyé à un serveur.',
    disclaimer: 'L\'IA peut se tromper : en cas de doute, vérifiez toujours auprès des canaux officiels.',
    stop: 'Arrêter',
  },
  en: {
    badge: 'On-device AI',
    title: 'Turn on artificial intelligence on this device',
    text: `A small AI (≈ ${MODEL_SIZE_MB} MB) downloads once into your browser. Then it works even offline, and your messages never leave your phone.`,
    wifi: `Recommended: use Wi-Fi, the download uses about ${MODEL_SIZE_MB} MB of data.`,
    saveData: 'Your browser is in "data saver" mode: downloading is not recommended on this network.',
    lowMemory: 'Your device has little memory: the AI may be slow or fail to start.',
    activate: `Download the AI (${MODEL_SIZE_MB} MB)`,
    downloading: 'Downloading the AI…',
    preparing: 'Preparing the AI…',
    keepOpen: 'Keep this page open. The download only happens once.',
    ready: 'AI ready',
    readyDevice: { webgpu: 'accelerated by the graphics chip' },
    unsupported: 'This device or browser cannot run the on-device AI (it needs WebGPU, found in recent Chrome on computers and recent Android phones). The automatic analysis above and every other tool remain available.',
    error: 'The AI download failed. Check your connection and try again.',
    retry: 'Try again',
    privacy: 'Everything runs on your device: nothing is sent to a server.',
    disclaimer: 'The AI can be wrong: when in doubt, always check with official channels.',
    stop: 'Stop',
  },
};

const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

/**
 * Renders the activation card until the model is usable, then `children`.
 * When the model is already cached, children render immediately: the first
 * generation loads it from cache transparently.
 */
export const LocalAIGate: React.FC<{ lang: Lang; children: React.ReactNode }> = ({ lang, children }) => {
  const s = AI_STR[lang];
  const st = useLocalLLM();

  if (st.status === 'unsupported') {
    return <p className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4 text-sm text-[var(--text-muted)]">{s.unsupported}</p>;
  }

  if (st.status === 'downloading') {
    const pct = Math.round(st.progress * 100);
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5" aria-live="polite">
        <p className="font-semibold text-[var(--text-heading)]">{st.cached ? s.preparing : s.downloading}</p>
        <div
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--chart-track)]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div className="h-full rounded-full bg-[var(--brand)] transition-[width]" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-sm tabular-nums text-[var(--text-muted)]">
          {pct} %{st.totalMB > 0 && ` · ${st.loadedMB} / ${st.totalMB} Mo`}
        </p>
        {!st.cached && <p className="mt-2 text-xs text-[var(--text-muted)]">{s.keepOpen}</p>}
      </div>
    );
  }

  if (st.status === 'error') {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-[var(--bad)]/40 bg-[var(--bad)]/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-[var(--text)]">{s.error}</p>
          {st.error && (
            <details className="mt-1 text-xs text-[var(--text-muted)]">
              <summary className="cursor-pointer">{lang === 'fr' ? 'Détail technique' : 'Technical detail'}</summary>
              <code className="mt-1 block break-all" data-llm-error>{st.error}</code>
            </details>
          )}
        </div>
        <button type="button" onClick={() => void loadModel().catch(() => {})} className="btn-ghost shrink-0">
          {s.retry}
        </button>
      </div>
    );
  }

  if (st.status === 'idle' && !st.cached) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6">
        <span className="chip border-[var(--brand)]/40 text-[var(--accent-text)]">{s.badge}</span>
        <h3 className="mt-3 font-sans text-lg font-semibold text-[var(--text-heading)]">{s.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text)]">{s.text}</p>
        <ul className="mt-3 space-y-1.5 text-sm text-[var(--text-muted)]">
          <li className="flex gap-2">
            <IconLock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-text)]" />
            {s.privacy}
          </li>
          <li className="flex gap-2">
            <IconAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warn)]" />
            {saveData ? s.saveData : s.wifi}
          </li>
          {st.lowMemory && (
            <li className="flex gap-2">
              <IconAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warn)]" />
              {s.lowMemory}
            </li>
          )}
        </ul>
        <button type="button" onClick={() => void loadModel().catch(() => {})} className="btn-primary mt-5">
          {s.activate}
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

/** Small status line shown above AI output. */
export const AIStatusLine: React.FC<{ lang: Lang }> = ({ lang }) => {
  const s = AI_STR[lang];
  const st = useLocalLLM();
  if (st.status !== 'ready' && st.status !== 'generating') return null;
  return (
    <p className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
      <span className="h-2 w-2 rounded-full bg-[var(--good)]" aria-hidden="true" />
      {s.ready}
      {st.device && ` · ${s.readyDevice[st.device]}`}
    </p>
  );
};
