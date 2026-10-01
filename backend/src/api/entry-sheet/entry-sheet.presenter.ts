import type {
  AiExplanationCreateV1,
  AiExplanationReviewV1,
  EntrySheetModel,
} from '@fun/api-schema';
// Prisma 7 の行型も EntrySheetModel という名前なので別名で受ける
import type { EntrySheetModel as EntrySheetRow } from '../../generated/prisma/models';

/**
 * DB の行を API レスポンスの形に直す。
 *
 * ai_explanation_json は Json 列なので型が付かない。
 * ai_explanation_schema_version で判別して discriminated union を組み直す。
 */
export function toEntrySheetModel(row: EntrySheetRow): EntrySheetModel {
  const base = {
    id: row.id,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
    question: row.question,
    company_name: row.company_name,
    content: row.content,
    // null → undefined。JSON 化したときにキーごと消える
    original_content: row.original_content ?? undefined,
  };

  if (row.ai_explanation_schema_version === 'CREATE_V1') {
    return {
      ...base,
      type: 'CREATE',
      character_limit: row.character_limit ?? undefined,
      ai_explanation_schema_version: 'CREATE_V1',
      ai_explanation_json: row.ai_explanation_json as AiExplanationCreateV1,
    };
  }

  return {
    ...base,
    type: 'REVIEW',
    ai_explanation_schema_version: 'REVIEW_V1',
    ai_explanation_json: row.ai_explanation_json as AiExplanationReviewV1,
  };
}
