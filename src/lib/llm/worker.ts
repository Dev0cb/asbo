/// <reference lib="webworker" />
// Runs the language model off the main thread so the page never freezes.
// Everything happens on the device: the user's text never leaves it.
// Model weights come from Hugging Face and the ONNX runtime from jsDelivr,
// both cached by the browser after the first download.
import {
  env,
  pipeline,
  TextStreamer,
  InterruptableStoppingCriteria,
  type TextGenerationPipeline,
} from '@huggingface/transformers';
import { MODEL_ID, type ChatMessage, type WorkerIn, type WorkerOut } from './protocol';

env.allowLocalModels = false;
env.useBrowserCache = true;

const post = (msg: WorkerOut) => (self as unknown as DedicatedWorkerGlobalScope).postMessage(msg);

let generator: TextGenerationPipeline | null = null;
let loading: Promise<void> | null = null;
const stopper = new InterruptableStoppingCriteria();

/**
 * Gemma's 4-bit weights need WebGPU (WASM lacks the GatherBlockQuantized
 * op). fp16-capable GPUs get the smaller q4f16 files. The page checks
 * WebGPU before offering the download (engine.ts), so no fallback here.
 */
async function pickRuntime(): Promise<{ device: 'webgpu'; dtype: 'q4f16' | 'q4' }> {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<{ features: Set<string> } | null> } }).gpu;
  const adapter = gpu ? await gpu.requestAdapter() : null;
  if (!adapter) throw new Error('WebGPU unavailable');
  return { device: 'webgpu', dtype: adapter.features.has('shader-f16') ? 'q4f16' : 'q4' };
}

async function load() {
  if (generator) return post({ type: 'ready', device: 'cached' });
  if (!loading) {
    loading = (async () => {
      const { device, dtype } = await pickRuntime();
      const files = new Map<string, { loaded: number; total: number }>();
      generator = (await pipeline('text-generation', MODEL_ID, {
        device,
        dtype,
        progress_callback: (p: { status: string; file?: string; loaded?: number; total?: number }) => {
          if (p.status !== 'progress' || !p.file) return;
          files.set(p.file, { loaded: p.loaded ?? 0, total: p.total ?? 0 });
          let loaded = 0;
          let total = 0;
          for (const f of files.values()) {
            loaded += f.loaded;
            total += f.total;
          }
          post({ type: 'progress', loaded, total });
        },
      })) as TextGenerationPipeline;
      post({ type: 'ready', device });
    })();
  }
  await loading;
}

async function generate(id: number, messages: ChatMessage[], maxNewTokens: number) {
  if (!generator) await load();
  const g = generator!;
  stopper.reset();
  const streamer = new TextStreamer(g.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: (text: string) => post({ type: 'token', id, text }),
  });
  await g(messages, {
    max_new_tokens: maxNewTokens,
    do_sample: false,
    // Small models loop under greedy decoding (observed with 0.5B):
    // forbid repeated 3-word sequences and penalise reused tokens.
    repetition_penalty: 1.25,
    no_repeat_ngram_size: 3,
    streamer,
    stopping_criteria: stopper,
  });
  post({ type: 'done', id });
}

self.addEventListener('message', (event: MessageEvent<WorkerIn>) => {
  const msg = event.data;
  const fail = (e: unknown) =>
    post({ type: 'error', id: 'id' in msg ? msg.id : undefined, message: e instanceof Error ? e.message : String(e) });
  if (msg.type === 'load') {
    load().catch((e) => {
      loading = null;
      fail(e);
    });
  } else if (msg.type === 'generate') {
    generate(msg.id, msg.messages, msg.maxNewTokens).catch(fail);
  } else if (msg.type === 'interrupt') {
    stopper.interrupt();
  }
});
