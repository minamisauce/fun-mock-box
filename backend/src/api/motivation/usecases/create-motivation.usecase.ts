import type {
  CreateMotivationRequest,
  CreateMotivationResponse,
} from '@fun/api-schema';
import { generateMotivation } from '@fun/api-schema/generators';
import { prisma } from '../../../shared/prisma';
import { toMotivationModel } from '../motivation.presenter';

/**
 * 本番が LLM を呼ぶ箇所。ブラウザ内LLMの生成結果（generated）があればそれを保存し、
 * 無ければ決定論的なテンプレート生成で作る
 */
export async function createMotivation(
  userId: string,
  params: CreateMotivationRequest,
): Promise<CreateMotivationResponse> {
  const { title, content } = params.generated ?? generateMotivation(params);

  const row = await prisma.motivation.create({
    data: {
      user_id: userId,
      title,
      content,
      inflow_source: params.inflow_source,
    },
  });
  return toMotivationModel(row);
}
