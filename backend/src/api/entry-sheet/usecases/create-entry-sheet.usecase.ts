import type {
  CreateEntrySheetRequest,
  CreateEntrySheetResponse,
} from '@fun/api-schema';
import { generateEntrySheetCreate } from '@fun/api-schema/generators';
import { prisma } from '../../../shared/prisma';
import { toEntrySheetModel } from '../entry-sheet.presenter';

/** 本番が LLM を呼ぶ箇所。いまは決定論的なテンプレート生成 */
export async function createEntrySheet(
  userId: string,
  params: CreateEntrySheetRequest,
): Promise<CreateEntrySheetResponse> {
  const { content, ai_explanation_json } = generateEntrySheetCreate(params);

  const row = await prisma.entrySheet.create({
    data: {
      user_id: userId,
      type: 'CREATE',
      question: params.question,
      company_name: params.company_name,
      content,
      ai_explanation_schema_version: 'CREATE_V1',
      ai_explanation_json,
      inflow_source: params.inflow_source,
    },
  });
  return toEntrySheetModel(row);
}
