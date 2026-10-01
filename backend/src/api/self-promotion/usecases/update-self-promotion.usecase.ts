import type {
  UpdateSelfPromotionRequest,
  UpdateSelfPromotionResponse,
} from '@fun/api-schema';
import { notFound } from '../../../shared/errors';
import { prisma } from '../../../shared/prisma';
import { toSelfPromotionModel } from '../self-promotion.presenter';

export async function updateSelfPromotion(
  userId: string,
  id: string,
  params: UpdateSelfPromotionRequest,
): Promise<UpdateSelfPromotionResponse> {
  // updateMany なら where に user_id を混ぜられる（update は unique 条件のみ）
  const { count } = await prisma.selfPromotion.updateMany({
    where: { id, user_id: userId },
    data: params,
  });
  if (count === 0) throw notFound('この自己PRは見つかりませんでした。');

  const row = await prisma.selfPromotion.findFirstOrThrow({
    where: { id, user_id: userId },
  });
  return toSelfPromotionModel(row);
}
