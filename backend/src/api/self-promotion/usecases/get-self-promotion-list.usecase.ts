import type { GetSelfPromotionListResponse } from '@fun/api-schema';
import { prisma } from '../../../shared/prisma';
import { toSelfPromotionModel } from '../self-promotion.presenter';

export async function getSelfPromotionList(
  userId: string,
): Promise<GetSelfPromotionListResponse> {
  const rows = await prisma.selfPromotion.findMany({
    where: { user_id: userId },
    // 同時刻でも順序が定まるよう id を第2キーにする
    orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
  });
  return rows.map(toSelfPromotionModel);
}
