import type {
  ReviewEntrySheetRequest,
  ReviewEntrySheetResponse,
} from '@fun/api-schema';
import { generateEntrySheetReview } from '@fun/api-schema/generators';
import { prisma } from '../../../shared/prisma';
import { toEntrySheetModel } from '../entry-sheet.presenter';

/** 添削。作成と同じ一覧に並ぶ */
export async function reviewEntrySheet(
  userId: string,
  params: ReviewEntrySheetRequest,
): Promise<ReviewEntrySheetResponse> {
  const { content, ai_explanation_json } = generateEntrySheetReview(params);

  const row = await prisma.entrySheet.create({
    data: {
      user_id: userId,
      type: 'REVIEW',
      question: params.question,
      company_name: params.company_name,
      content,
      original_content: params.original_content,
      ai_explanation_schema_version: 'REVIEW_V1',
      ai_explanation_json,
      inflow_source: params.inflow_source,
    },
  });
  return toEntrySheetModel(row);
}
