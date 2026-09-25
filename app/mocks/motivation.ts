import { STORAGE_KEYS } from '~/lib/storage';
import { createMockStore, GENERATE_LATENCY_MS, sleep } from '~/mocks/store';
import { generateMotivation } from '~/mocks/templates/motivation';
import type {
  CreateMotivationRequest,
  MotivationModel,
  UpdateMotivationRequest,
} from '~/types/motivation';

/**
 * 志望動機の擬似API。
 * シグネチャは実APIと1:1。routes / features は必ずこのモジュール経由で触る。
 */
const store = createMockStore<MotivationModel>(STORAGE_KEYS.motivations);

export function listMotivations(): MotivationModel[] {
  return store.list();
}

export function getMotivation(id: string): MotivationModel | undefined {
  return store.get(id);
}

export async function createMotivation(
  req: CreateMotivationRequest,
): Promise<MotivationModel> {
  await sleep(GENERATE_LATENCY_MS);
  return store.insert(generateMotivation(req));
}

export function updateMotivation(
  id: string,
  patch: UpdateMotivationRequest,
): MotivationModel {
  return store.update(id, patch);
}
