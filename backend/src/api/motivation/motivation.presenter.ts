import type { MotivationModel } from '@fun/api-schema';
// Prisma 7 の行型も MotivationModel という名前なので別名で受ける
import type { MotivationModel as MotivationRow } from '../../generated/prisma/models';

export function toMotivationModel(row: MotivationRow): MotivationModel {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
