import {
  findModel,
  type LlmModelId,
  type LlmRuntime,
} from '~/features/LocalLlm/constants';
import type {
  ChatMessage,
  LlmRuntimeAdapter,
  LoadProgress,
  StreamResult,
} from '~/features/LocalLlm/runtimes/types';
import { webllmRuntime } from '~/features/LocalLlm/runtimes/webllm';
import { wllamaRuntime } from '~/features/LocalLlm/runtimes/wllama';

/**
 * ブラウザ内LLMの窓口。モデルに合わせて実行エンジン（WebLLM / wllama）を選ぶ。
 *
 * 読み込むモデルはアプリ全体で1つだけ。別のエンジンのモデルに切り替えるときは、
 * 先に今のエンジンを unload して GPU メモリを空ける。
 */

export type { ChatMessage, LoadProgress, StreamResult };

const RUNTIMES: Record<LlmRuntime, LlmRuntimeAdapter> = {
  webllm: webllmRuntime,
  wllama: wllamaRuntime,
};

let loadedModelId: LlmModelId | null = null;
let loading: Promise<void> | null = null;

function runtimeOf(modelId: LlmModelId): LlmRuntimeAdapter {
  return RUNTIMES[findModel(modelId).runtime];
}

export async function isModelCached(modelId: LlmModelId): Promise<boolean> {
  return runtimeOf(modelId).isCached(findModel(modelId));
}

export function isModelLoaded(modelId: LlmModelId): boolean {
  return loadedModelId === modelId;
}

/**
 * モデルを読み込む。読み込み済みならすぐ返る。
 * 読み込み中に呼ばれたら、前の読み込みが終わるのを待ってから判断する。
 */
export async function loadModel(
  modelId: LlmModelId,
  onProgress: (report: LoadProgress) => void,
): Promise<void> {
  if (loadedModelId === modelId) return;
  if (loading) await loading.catch(() => undefined);
  if (loadedModelId === modelId) return;

  loading = (async () => {
    const previous = loadedModelId;
    loadedModelId = null;
    if (
      previous &&
      findModel(previous).runtime !== findModel(modelId).runtime
    ) {
      await runtimeOf(previous).unload();
    }
    await runtimeOf(modelId).load(findModel(modelId), onProgress);
    loadedModelId = modelId;
  })();

  try {
    await loading;
  } finally {
    loading = null;
  }
}

/** 途中で止める。止めたところまでの文字列はストリームの呼び出し側に残る */
export function interrupt(): void {
  if (loadedModelId) runtimeOf(loadedModelId).interrupt();
}

type StreamOptions = {
  onDelta: (delta: string) => void;
};

/**
 * 1回ぶんの生成。1トークン（数文字）ずつ onDelta に流し、最後に全文を返す。
 * 会話の履歴は持たない（毎回 messages を全部渡す）。
 */
export async function streamChat(
  modelId: LlmModelId,
  messages: ChatMessage[],
  { onDelta }: StreamOptions,
): Promise<StreamResult> {
  if (loadedModelId !== modelId) {
    throw new Error(`model ${modelId} is not loaded`);
  }
  return runtimeOf(modelId).stream(findModel(modelId), messages, onDelta);
}
