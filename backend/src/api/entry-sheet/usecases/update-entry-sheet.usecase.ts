import type {
  UpdateEntrySheetRequest,
  UpdateEntrySheetResponse,
} from '@fun/api-schema';
import { notFound } from '../../../shared/errors';
import { prisma } from '../../../shared/prisma';
import { toEntrySheetModel } from '../entry-sheet.presenter';

export async function updateEntrySheet(
  userId: string,
  id: string,
  params: UpdateEntrySheetRequest,
): Promise<UpdateEntrySheetResponse> {
  const { count } = await prisma.entrySheet.updateMany({
    where: { id, user_id: userId },
    data: params,
  });
  if (count === 0) throw notFound('このESは見つかりませんでした。');

  const row = await prisma.entrySheet.findFirstOrThrow({
    where: { id, user_id: userId },
  });
  return toEntrySheetModel(row);
}
