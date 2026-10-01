import type {
  CreateSelfPromotionRequest,
  CreateSelfPromotionResponse,
} from '@fun/api-schema';
import { generateSelfPromotion } from '@fun/api-schema/generators';
import { prisma } from '../../../shared/prisma';
import { toSelfPromotionModel } from '../self-promotion.presenter';

/**
 * 本番（就活BOX）が LLM を呼ぶ箇所。
 * いまは決定論的なテンプレート生成に差し替えてある。
 */
export async function createSelfPromotion(
  userId: string,
  params: CreateSelfPromotionRequest,
): Promise<CreateSelfPromotionResponse> {
  const { title, content } = generateSelfPromotion(params);

  const row = await prisma.selfPromotion.create({
    data: {
      user_id: userId,
      title,
      content,
      inflow_source: params.inflow_source,
    },
  });
  return toSelfPromotionModel(row);
}
