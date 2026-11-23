// Messages exchanged between the page and the LLM worker.

/**
 * Gemma 3 1B instruct, ONNX, WebGPU only: ~760 MB (q4f16) or ~860 MB (q4).
 * Qwen2.5-0.5B was tried first and rejected: incoherent, looping French.
 */
export const MODEL_ID = 'onnx-community/gemma-3-1b-it-ONNX-GQA';
export const MODEL_SIZE_MB = 800;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type WorkerIn =
  | { type: 'load' }
  | { type: 'generate'; id: number; messages: ChatMessage[]; maxNewTokens: number }
  | { type: 'interrupt' };

export type WorkerOut =
  | { type: 'progress'; loaded: number; total: number }
  | { type: 'ready'; device: 'webgpu' | 'cached' }
  | { type: 'token'; id: number; text: string }
  | { type: 'done'; id: number }
  | { type: 'error'; id?: number; message: string };

const PREVIEW_KEY = 'asbo-ai-preview';

/**
 * The on-device AI is in preview until its answers are validated on real
 * devices: hidden unless the site was opened once with `?ia=1`
 * (`?ia=0` turns it off again).
 */
export function aiPreviewEnabled(): boolean {
  try {
    const flag = new URLSearchParams(window.location.search).get('ia');
    if (flag === '1') localStorage.setItem(PREVIEW_KEY, '1');
    if (flag === '0') localStorage.removeItem(PREVIEW_KEY);
    return localStorage.getItem(PREVIEW_KEY) === '1';
  } catch {
    return false;
  }
}
