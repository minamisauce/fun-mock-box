import type {
  UpdateMotivationRequest,
  UpdateMotivationResponse,
} from '@fun/api-schema';
import { notFound } from '../../../shared/errors';
import { prisma } from '../../../shared/prisma';
import { toMotivationModel } from '../motivation.presenter';

export async function updateMotivation(
  userId: string,
  id: string,
  params: UpdateMotivationRequest,
): Promise<UpdateMotivationResponse> {
  const { count } = await prisma.motivation.updateMany({
    where: { id, user_id: userId },
    data: params,
  });
  if (count === 0) throw notFound('この志望動機は見つかりませんでした。');

  const row = await prisma.motivation.findFirstOrThrow({
    where: { id, user_id: userId },
  });
  return toMotivationModel(row);
}
