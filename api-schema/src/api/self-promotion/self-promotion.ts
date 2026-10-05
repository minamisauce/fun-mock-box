import * as z from 'zod';

/**
 * 自己PR作成ツールの API スキーマ。
 *
 * 就活BOX の api-schema/src/api/self-promotion/self-promotion.ts と
 * フィールド名（snake_case 含む）を揃えている。
 * 相違点は id の型だけ（本番は number、こちらは UUID 文字列）。
 * オフラインモードではクライアントが採番するため連番にできない。
 *
 * OpenAPI は生成しないので zod-openapi / .meta() は持ち込まない。
 */

const selfPromotionModel = z.object({
  id: z.uuid(),
  /** 40文字以内 */
  title: z.string().min(1).max(40),
  content: z.string().min(1),
  /** ISO8601 */
  created_at: z.iso.datetime(),
  /** ISO8601 */
  updated_at: z.iso.datetime(),
});
export type SelfPromotionModel = z.infer<typeof selfPromotionModel>;

// GET /api/self-promotions
export type GetSelfPromotionListResponse = SelfPromotionModel[];

// GET /api/self-promotions/:id
export type GetSelfPromotionResponse = SelfPromotionModel;

// POST /api/self-promotions
export const createSelfPromotionRequest = z.strictObject({
  /** 長所 例: 問題解決力 */
  strength: z.string().min(1),
  /** 長所を発揮した場面 例: 音楽バンドの活動 */
  situation: z.string().min(1),
  /** 大変だったこと 例: メンバーとの意見の違い */
  difficulty: z.string().min(1),
  /** どう解決したか 例: 話し合い */
  solution: z.string().min(1),
  /** 流入元 例: mypage */
  inflow_source: z.string().optional(),
  /**
   * ブラウザ内LLMで生成済みの本文。あればそのまま保存し、無ければ
   * サーバー側の決定論的生成器で作る。生成は端末で行い保存だけ送る構成のため
   */
  generated: z
    .strictObject({
      title: selfPromotionModel.shape.title,
      content: selfPromotionModel.shape.content,
    })
    .optional(),
});
export type CreateSelfPromotionRequest = z.infer<
  typeof createSelfPromotionRequest
>;
export type CreateSelfPromotionResponse = SelfPromotionModel;

// PATCH /api/self-promotions/:id
export const updateSelfPromotionRequest = z.strictObject({
  title: selfPromotionModel.shape.title,
  content: selfPromotionModel.shape.content,
});
export type UpdateSelfPromotionRequest = z.infer<
  typeof updateSelfPromotionRequest
>;
export type UpdateSelfPromotionResponse = SelfPromotionModel;
