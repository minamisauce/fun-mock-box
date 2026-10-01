import type { GetMotivationListResponse } from '@fun/api-schema';
import { prisma } from '../../../shared/prisma';
import { toMotivationModel } from '../motivation.presenter';

export async function getMotivationList(
  userId: string,
): Promise<GetMotivationListResponse> {
  const rows = await prisma.motivation.findMany({
    where: { user_id: userId },
    orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
  });
  return rows.map(toMotivationModel);
}
