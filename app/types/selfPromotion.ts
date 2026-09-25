/**
 * 自己PR作成ツールのドメイン型。
 *
 * shukatsu-box の api-schema/src/api/self-promotion/self-promotion.ts と
 * フィールド名（snake_case 含む）を完全に揃えている。将来ここを
 * `import type { ... } from "@box/api-schema"` に差し替えるだけで
 * 実 API に繋げられるようにするため。
 */

/** AI生成リクエスト */
export type CreateSelfPromotionRequest = {
  /** 長所 例: 問題解決力 */
  strength: string;
  /** 長所を発揮した場面 例: 音楽バンドの活動 */
  situation: string;
  /** 大変だったこと 例: メンバーとの意見の違い */
  difficulty: string;
  /** どう解決したか 例: 話し合い */
  solution: string;
  inflow_source?: string;
};

/** 生成結果 */
export type SelfPromotionModel = {
  id: string;
  /** 40文字以内 */
  title: string;
  content: string;
  /** ISO8601 */
  created_at: string;
  /** ISO8601 */
  updated_at: string;
};

export type UpdateSelfPromotionRequest = {
  title: string;
  content: string;
};

/** 結果画面の「AIで調整」用。UI は今回スコープ外だが型だけ先に用意する */
export type AdjustSelfPromotionRequest = {
  /** 1..100 */
  text_length: number;
  /** です・ます調 / だ・である調 */
  tone: 'plain' | 'polite';
  composition_style: 'concise' | 'detailed';
  strength?: string;
};
