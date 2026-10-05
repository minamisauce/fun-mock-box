import type { WebWorkerMLCEngine } from '@mlc-ai/web-llm';
import {
  type LlmRuntimeAdapter,
  MAX_TOKENS,
} from '~/features/LocalLlm/runtimes/types';

/**
 * WebLLM（MLC 形式）。推論は Web Worker で回す（worker.ts）。
 *
 * - `@mlc-ai/web-llm` は dynamic import で別チャンクに分ける。生成を始めるまで
 *   数MBの JS を読み込ませないため
 * - 重みは WebLLM が Cache Storage に保存する
 * - Qwen3 系は `enable_thinking: false` で思考を止める。JSON モード
 *   （response_format）とは併用しない（文法制約とぶつかって `<think>` や空白しか返らない）
 */

let engine: WebWorkerMLCEngine | null = null;

function loadWebLlm() {
  return import('@mlc-ai/web-llm');
}

export const webllmRuntime: LlmRuntimeAdapter = {
  async isCached(model) {
    const { hasModelInCache } = await loadWebLlm();
    try {
      return await hasModelInCache(model.id);
    } catch {
      return false;
    }
  },

  async load(model, onProgress) {
    const { WebWorkerMLCEngine } = await loadWebLlm();
    if (!engine) {
      engine = new WebWorkerMLCEngine(
        new Worker(new URL('../worker.ts', import.meta.url), {
          type: 'module',
        }),
      );
    }
    engine.setInitProgressCallback(({ progress, text }) =>
      onProgress({ progress, text }),
    );
    await engine.reload(model.id);
  },

  async unload() {
    await engine?.unload();
  },

  async stream(model, messages, onDelta) {
    if (!engine) throw new Error('webllm engine is not loaded');
    const { temperature, top_p, repetition_penalty } = model.sampling;

    const stream = await engine.chat.completions.create({
      messages,
      stream: true,
      temperature,
      top_p,
      repetition_penalty,
      max_tokens: MAX_TOKENS,
      ...(model.disableThinking && {
        extra_body: { enable_thinking: false },
      }),
    });

    let text = '';
    let stopped = false;
    for await (const chunk of stream) {
      const choice = chunk.choices[0];
      const delta = choice?.delta?.content ?? '';
      if (delta) {
        text += delta;
        onDelta(delta);
      }
      if (choice?.finish_reason === 'abort') stopped = true;
    }
    return { text, stopped };
  },

  interrupt() {
    engine?.interruptGenerate();
  },
};
