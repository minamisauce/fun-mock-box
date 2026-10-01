import type { GetMotivationResponse } from '@fun/api-schema';
import { notFound } from '../../../shared/errors';
import { prisma } from '../../../shared/prisma';
import { toMotivationModel } from '../motivation.presenter';

export async function getMotivation(
  userId: string,
  id: string,
): Promise<GetMotivationResponse> {
  const row = await prisma.motivation.findFirst({
    where: { id, user_id: userId },
  });
  if (!row) throw notFound('この志望動機は見つかりませんでした。');

  return toMotivationModel(row);
}
