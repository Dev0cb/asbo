// Page-side controller for the on-device language model.
// One shared worker for the whole app; React reads its state through
// useSyncExternalStore (see useLocalLLM in components/tools/LocalAI.tsx).
import type { ChatMessage, WorkerIn, WorkerOut } from './protocol';

export type LLMStatus = 'unsupported' | 'idle' | 'downloading' | 'ready' | 'generating' | 'error';

export interface LLMState {
  status: LLMStatus;
  /** 0–1 during the first download. */
  progress: number;
  loadedMB: number;
  totalMB: number;
  device: 'webgpu' | null;
  /** True once the model has been downloaded on this device (cached). */
  cached: boolean;
  /** Device has little memory: warn before downloading. */
  lowMemory: boolean;
  error: string | null;
}

const CACHED_KEY = 'asbo-llm-cached';
const MB = 1024 * 1024;
const LOW_MEMORY_GB = 4;

const readCached = () => {
  try {
    return localStorage.getItem(CACHED_KEY) === '1';
  } catch {
    return false;
  }
};

const baseSupport = typeof Worker !== 'undefined' && typeof WebAssembly !== 'undefined' && 'gpu' in navigator;
let supported = baseSupport;
const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;

let state: LLMState = {
  status: supported ? 'idle' : 'unsupported',
  progress: 0,
  loadedMB: 0,
  totalMB: 0,
  device: null,
  cached: readCached(),
  lowMemory: typeof deviceMemory === 'number' && deviceMemory < LOW_MEMORY_GB,
  error: null,
};

const listeners = new Set<() => void>();
const set = (patch: Partial<LLMState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

// The model needs a real WebGPU adapter: check before offering a download.
if (baseSupport) {
  (navigator as Navigator & { gpu: { requestAdapter(): Promise<unknown> } }).gpu
    .requestAdapter()
    .then((adapter) => {
      if (!adapter) {
        supported = false;
        set({ status: 'unsupported' });
      }
    })
    .catch(() => {
      supported = false;
      set({ status: 'unsupported' });
    });
}

export const llm = {
  getState: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

let worker: Worker | null = null;
let readyPromise: Promise<void> | null = null;
let nextId = 1;
const pending = new Map<number, { onToken: (t: string) => void; resolve: (text: string) => void; reject: (e: Error) => void; text: string }>();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  worker.addEventListener('message', (e: MessageEvent<WorkerOut>) => {
    const msg = e.data;
    if (msg.type === 'progress') {
      set({
        status: 'downloading',
        progress: msg.total ? msg.loaded / msg.total : 0,
        loadedMB: Math.round(msg.loaded / MB),
        totalMB: Math.round(msg.total / MB),
      });
    } else if (msg.type === 'ready') {
      try {
        localStorage.setItem(CACHED_KEY, '1');
      } catch {
        /* storage unavailable */
      }
      set({ status: 'ready', progress: 1, cached: true, device: msg.device === 'cached' ? state.device : msg.device });
    } else if (msg.type === 'token') {
      const job = pending.get(msg.id);
      if (job) {
        job.text += msg.text;
        job.onToken(job.text);
      }
    } else if (msg.type === 'done') {
      const job = pending.get(msg.id);
      pending.delete(msg.id);
      set({ status: 'ready' });
      job?.resolve(job.text.trim());
    } else if (msg.type === 'error') {
      const job = msg.id !== undefined ? pending.get(msg.id) : undefined;
      if (job) {
        pending.delete(msg.id!);
        job.reject(new Error(msg.message));
        set({ status: 'ready' });
      } else {
        readyPromise = null;
        set({ status: 'error', error: msg.message });
      }
    }
  });
  return worker;
}

const send = (msg: WorkerIn) => getWorker().postMessage(msg);

/** Downloads (first time) or loads from cache. Resolves when ready. */
export function loadModel(): Promise<void> {
  if (!supported) return Promise.reject(new Error('unsupported'));
  if (state.status === 'ready' || state.status === 'generating') return Promise.resolve();
  if (!readyPromise) {
    set({ status: 'downloading', error: null, progress: state.cached ? 1 : 0 });
    readyPromise = new Promise<void>((resolve, reject) => {
      const unsub = llm.subscribe(() => {
        if (state.status === 'ready') {
          unsub();
          resolve();
        } else if (state.status === 'error') {
          unsub();
          reject(new Error(state.error ?? 'error'));
        }
      });
    });
    send({ type: 'load' });
  }
  return readyPromise;
}

/** Streams a chat completion; `onToken` receives the full text so far. */
export async function generate(messages: ChatMessage[], onToken: (text: string) => void, maxNewTokens = 256): Promise<string> {
  await loadModel();
  const id = nextId++;
  set({ status: 'generating' });
  return new Promise<string>((resolve, reject) => {
    pending.set(id, { onToken, resolve, reject, text: '' });
    send({ type: 'generate', id, messages, maxNewTokens });
  });
}

export function interrupt() {
  if (worker) send({ type: 'interrupt' });
}
