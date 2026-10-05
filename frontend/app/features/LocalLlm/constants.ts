/**
 * ブラウザ内で動かすモデルの一覧。
 *
 * 実行エンジン（runtime）は2種類ある。
 * - webllm: WebLLM（MLC 形式）。ID は WebLLM 0.2.85 の prebuiltAppConfig にあるもの
 * - wllama:  llama.cpp の WASM 版（GGUF 形式）。WebLLM 用のビルドが無いモデルに使う
 *
 * downloadMB は Hugging Face 上の配布ファイルの合計（2026-10 時点）。
 * 確認ダイアログの文言と、メモリ不足のときに勧める「より軽いモデル」の判定に使う。
 */
export type LlmRuntime = 'webllm' | 'wllama';

export type LlmSampling = {
  temperature: number;
  top_p: number;
  top_k?: number;
  repetition_penalty: number;
};

export type LlmModel = {
  id: string;
  /** 画面に出す短い名前 */
  label: string;
  /** 選択肢の補足 */
  note: string;
  runtime: LlmRuntime;
  downloadMB: number;
  /** Qwen3 系は既定で思考（<think>）を出すので、生成時に止める */
  disableThinking: boolean;
  /** wllama で読む GGUF の場所 */
  gguf?: { repo: string; file: string };
  /**
   * モデルごとの推奨値に寄せる。高すぎると 2B 以下は日本語が崩れて同じ文を繰り返し、
   * 低すぎると再生成しても同じ文しか出ない（揺れを見せられない）
   */
  sampling: LlmSampling;
};

const QWEN_SAMPLING: LlmSampling = {
  temperature: 0.7,
  top_p: 0.8,
  repetition_penalty: 1.05,
};

export const LLM_MODELS = [
  {
    // 日本語向けに追加学習した版。速く、です・ます調が崩れにくい。
    // 文章は短め（自己PRで150〜200字ほど）
    id: 'LFM2.5-1.2B-JP-Q4_K_M',
    label: 'LFM2.5 1.2B JP',
    note: '標準・日本語特化',
    runtime: 'wllama',
    downloadMB: 730,
    disableThinking: false,
    gguf: {
      repo: 'LiquidAI/LFM2.5-1.2B-JP-GGUF',
      file: 'LFM2.5-1.2B-JP-Q4_K_M.gguf',
    },
    // Liquid AI の推奨は 0.1 だが、それだと再生成しても毎回同じ文になる
    sampling: {
      temperature: 0.3,
      top_p: 0.9,
      top_k: 50,
      repetition_penalty: 1.05,
    },
  },
  {
    // 長さと段落構成を一番よく守る。そのぶん重く、生成に10秒ほどかかる
    id: 'Qwen3.5-4B-q4f16_1-MLC',
    label: 'Qwen3.5 4B',
    note: '高品質',
    runtime: 'webllm',
    downloadMB: 2390,
    disableThinking: true,
    sampling: QWEN_SAMPLING,
  },
  {
    id: 'Qwen3.5-2B-q4f16_1-MLC',
    label: 'Qwen3.5 2B',
    note: '比較用',
    runtime: 'webllm',
    downloadMB: 1080,
    disableThinking: true,
    sampling: QWEN_SAMPLING,
  },
  {
    id: 'Qwen3.5-0.8B-q4f16_1-MLC',
    label: 'Qwen3.5 0.8B',
    note: '軽量・崩れやすい',
    runtime: 'webllm',
    downloadMB: 450,
    disableThinking: true,
    sampling: QWEN_SAMPLING,
  },
] as const satisfies readonly LlmModel[];

export type LlmModelId = (typeof LLM_MODELS)[number]['id'];

export const DEFAULT_MODEL_ID: LlmModelId = 'LFM2.5-1.2B-JP-Q4_K_M';

export function findModel(id: string): LlmModel {
  return LLM_MODELS.find((m) => m.id === id) ?? LLM_MODELS[0];
}

/** 「約1.1GB」「約730MB」 */
export function formatMB(mb: number): string {
  return mb >= 1000 ? `約${(mb / 1000).toFixed(1)}GB` : `約${mb}MB`;
}
