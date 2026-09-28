import type { GetSelfPromotionResponse } from '@fun/api-schema';
import { notFound } from '../../../shared/errors';
import { prisma } from '../../../shared/prisma';
import { toSelfPromotionModel } from '../self-promotion.presenter';

export async function getSelfPromotion(
  userId: string,
  id: string,
): Promise<GetSelfPromotionResponse> {
  // 他人のレコードを引けないよう user_id を必ず AND する
  const row = await prisma.selfPromotion.findFirst({
    where: { id, user_id: userId },
  });
  if (!row) throw notFound('この自己PRは見つかりませんでした。');

  return toSelfPromotionModel(row);
}
