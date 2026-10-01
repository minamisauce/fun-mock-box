import type { GetEntrySheetResponse } from '@fun/api-schema';
import { notFound } from '../../../shared/errors';
import { prisma } from '../../../shared/prisma';
import { toEntrySheetModel } from '../entry-sheet.presenter';

export async function getEntrySheet(
  userId: string,
  id: string,
): Promise<GetEntrySheetResponse> {
  const row = await prisma.entrySheet.findFirst({
    where: { id, user_id: userId },
  });
  if (!row) throw notFound('このESは見つかりませんでした。');

  return toEntrySheetModel(row);
}
