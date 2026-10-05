import type { LlmModel } from '~/features/LocalLlm/constants';

/** 実行エンジンに依らないメッセージ。WebLLM も wllama も OpenAI 互換の形で受け取る */
export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type LoadProgress = {
  /** 0〜1 */
  progress: number;
  /** 開発者向けの進捗の文言 */
  text: string;
};

export type StreamResult = { text: string; stopped: boolean };

/**
 * 実行エンジン（WebLLM / wllama）の共通の形。engine.ts がモデルに合わせて選ぶ。
 * どちらもアプリ全体で1つだけ持ち、同時に読み込むモデルは1つまで。
 */
export type LlmRuntimeAdapter = {
  /** 重みが端末に保存済みか。済みならダウンロードの確認を出さない */
  isCached(model: LlmModel): Promise<boolean>;
  load(model: LlmModel, onProgress: (p: LoadProgress) => void): Promise<void>;
  /** GPU メモリを空ける。もう一方のエンジンに切り替える前に呼ぶ */
  unload(): Promise<void>;
  stream(
    model: LlmModel,
    messages: ChatMessage[],
    onDelta: (delta: string) => void,
  ): Promise<StreamResult>;
  /** 生成中なら止める。止めたところまでの文字列は stream の戻り値に残る */
  interrupt(): void;
};

/** 1回の生成の上限。日本語の自己PR・ES に十分で、崩れて繰り返したときの歯止めになる */
export const MAX_TOKENS = 1024;
