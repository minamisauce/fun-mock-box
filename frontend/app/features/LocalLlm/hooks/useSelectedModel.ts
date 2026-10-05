import { useCallback, useState } from 'react';
import {
  DEFAULT_MODEL_ID,
  LLM_MODELS,
  type LlmModelId,
} from '~/features/LocalLlm/constants';
import { readLocal, STORAGE_KEYS, writeLocal } from '~/lib/storage';

function isModelId(value: unknown): value is LlmModelId {
  return LLM_MODELS.some((m) => m.id === value);
}

/**
 * 使うモデルの選択。端末ごとの好み（GPU の性能に合わせて選ぶもの）なので、
 * データ層ではなく localStorage に直接持つ。
 */
export function useSelectedModel() {
  const [modelId, setModelIdState] = useState<LlmModelId>(() => {
    const stored = readLocal<unknown>(STORAGE_KEYS.llmModel, null);
    return isModelId(stored) ? stored : DEFAULT_MODEL_ID;
  });

  const setModelId = useCallback((id: LlmModelId) => {
    setModelIdState(id);
    writeLocal(STORAGE_KEYS.llmModel, id);
  }, []);

  return [modelId, setModelId] as const;
}
