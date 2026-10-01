import type { SelfPromotionModel } from '@fun/api-schema';
// Prisma 7 の行型も SelfPromotionModel という名前なので別名で受ける
import type { SelfPromotionModel as SelfPromotionRow } from '../../generated/prisma/models';

/**
 * DB の行を API レスポンスの形に直す。
 * 日時は Date で返ってくるので、フロントが期待する ISO8601 文字列にする。
 */
export function toSelfPromotionModel(
  row: SelfPromotionRow,
): SelfPromotionModel {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
