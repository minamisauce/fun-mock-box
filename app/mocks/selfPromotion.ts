import { STORAGE_KEYS } from "~/lib/storage";
import {
  createMockStore,
  GENERATE_LATENCY_MS,
  sleep,
} from "~/mocks/store";
import { generateSelfPromotion } from "~/mocks/templates/selfPromotion";
import type {
  CreateSelfPromotionRequest,
  SelfPromotionModel,
  UpdateSelfPromotionRequest,
} from "~/types/selfPromotion";

/**
 * 自己PRの擬似API。
 *
 * 関数シグネチャは実APIクライアントと1:1で揃えてある。本番接続時は
 * このファイルの中身を fetch に差し替えるだけで、呼び出し側は無変更で済む。
 * routes / features からは必ずこのモジュール経由で触り、
 * ~/mocks/store や ~/mocks/templates を直接呼ばないこと。
 */
const store = createMockStore<SelfPromotionModel>(STORAGE_KEYS.selfPromotions);

export function listSelfPromotions(): SelfPromotionModel[] {
  return store.list();
}

export function getSelfPromotion(id: string): SelfPromotionModel | undefined {
  return store.get(id);
}

export async function createSelfPromotion(
  req: CreateSelfPromotionRequest,
): Promise<SelfPromotionModel> {
  await sleep(GENERATE_LATENCY_MS);
  return store.insert(generateSelfPromotion(req));
}

export function updateSelfPromotion(
  id: string,
  patch: UpdateSelfPromotionRequest,
): SelfPromotionModel {
  return store.update(id, patch);
}
