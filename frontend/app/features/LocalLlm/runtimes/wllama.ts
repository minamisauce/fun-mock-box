import type { Wllama } from '@wllama/wllama/esm/index.js';
import wasmUrl from '@wllama/wllama/esm/wasm/wllama.wasm?url';
import type { LlmModel } from '~/features/LocalLlm/constants';
import {
  type LlmRuntimeAdapter,
  MAX_TOKENS,
} from '~/features/LocalLlm/runtimes/types';

/**
 * wllama（llama.cpp の WASM 版、GGUF 形式）。WebLLM 用のビルドが無いモデル
 * （LFM2.5 など）に使う。WebGPU があれば全層を GPU に載せる。
 *
 * - パッケージの main が実在しないので `esm/index.js` を直接 import する
 * - 重みは wllama の CacheManager（OPFS）に保存する
 * - 推論は wllama が内部で持つ Worker で回る
 * - 中断は AbortSignal。止めると例外になるので、中断なら stopped として返す
 */

let instance: Wllama | null = null;
let controller: AbortController | null = null;

async function getInstance(): Promise<Wllama> {
  if (!instance) {
    const { Wllama } = await import('@wllama/wllama/esm/index.js');
    instance = new Wllama({ default: wasmUrl });
  }
  return instance;
}

function ggufUrl(model: LlmModel): string {
  if (!model.gguf) throw new Error(`${model.id} has no gguf source`);
  return `https://huggingface.co/${model.gguf.repo}/resolve/main/${model.gguf.file}`;
}

function toMB(bytes: number): string {
  return `${Math.round(bytes / 1e6)}MB`;
}

export const wllamaRuntime: LlmRuntimeAdapter = {
  async isCached(model) {
    try {
      const w = await getInstance();
      return (await w.cacheManager.open(ggufUrl(model))) !== null;
    } catch {
      return false;
    }
  },

  async load(model, onProgress) {
    // 1インスタンスに1モデル。読み直すときは作り直す
    if (instance?.isModelLoaded()) {
      await instance.exit();
      instance = null;
    }
    const w = await getInstance();
    await w.loadModelFromUrl(ggufUrl(model), {
      progressCallback: ({ loaded, total }) =>
        onProgress({
          // ダウンロードを終えてから GPU に載せるまで少し間があるので 99% で止める
          progress: total > 0 ? Math.min(loaded / total, 0.99) : 0,
          text: `${model.gguf?.file}: ${toMB(loaded)} / ${toMB(total)}`,
        }),
    });
    onProgress({ progress: 1, text: `${model.gguf?.file}: loaded` });
  },

  async unload() {
    if (instance) {
      await instance.exit();
      instance = null;
    }
  },

  async stream(model, messages, onDelta) {
    if (!instance?.isModelLoaded()) {
      throw new Error('wllama model is not loaded');
    }
    const { temperature, top_p, top_k, repetition_penalty } = model.sampling;
    controller = new AbortController();
    const { signal } = controller;

    let text = '';
    try {
      const stream = await instance.createChatCompletion({
        messages,
        stream: true,
        abortSignal: signal,
        temperature,
        top_p,
        top_k,
        penalty_repeat: repetition_penalty,
        max_tokens: MAX_TOKENS,
      });
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        if (delta) {
          text += delta;
          onDelta(delta);
        }
      }
      return { text, stopped: signal.aborted };
    } catch (e) {
      if (signal.aborted) return { text, stopped: true };
      throw e;
    } finally {
      controller = null;
    }
  },

  interrupt() {
    controller?.abort();
  },
};
