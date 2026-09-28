import * as z from 'zod';

/**
 * 志望動機作成ツールの API スキーマ。
 * 構造は自己PRと同一。本番同様 adjust（AIで調整）API は存在しない。
 */

const motivationModel = z.object({
  id: z.uuid(),
  title: z.string().min(1).max(40),
  content: z.string().min(1),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});
export type MotivationModel = z.infer<typeof motivationModel>;

// GET /api/motivations
export type GetMotivationListResponse = MotivationModel[];

// GET /api/motivations/:id
export type GetMotivationResponse = MotivationModel;

// POST /api/motivations
export const createMotivationRequest = z.strictObject({
  /** 志望業界 例: 金融 */
  industry: z.string().min(1),
  /** 志望業種 例: 銀行 */
  sector: z.string().min(1),
  /** 志望理由 例: 企業の理念やビジョンへの共感 */
  reason: z.string().min(1),
  /** どんな経験から働きたいと思ったか 例: リーグ優勝に導いた経験 */
  experience: z.string().min(1),
  inflow_source: z.string().optional(),
});
export type CreateMotivationRequest = z.infer<typeof createMotivationRequest>;
export type CreateMotivationResponse = MotivationModel;

// PATCH /api/motivations/:id
export const updateMotivationRequest = z.strictObject({
  title: motivationModel.shape.title,
  content: motivationModel.shape.content,
});
export type UpdateMotivationRequest = z.infer<typeof updateMotivationRequest>;
export type UpdateMotivationResponse = MotivationModel;
