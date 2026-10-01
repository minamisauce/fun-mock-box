import type { GetEntrySheetListResponse } from '@fun/api-schema';
import { prisma } from '../../../shared/prisma';
import { toEntrySheetModel } from '../entry-sheet.presenter';

export async function getEntrySheetList(
  userId: string,
): Promise<GetEntrySheetListResponse> {
  const rows = await prisma.entrySheet.findMany({
    where: { user_id: userId },
    orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
  });
  return rows.map(toEntrySheetModel);
}
