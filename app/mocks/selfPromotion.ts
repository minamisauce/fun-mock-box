import { readLocal, STORAGE_KEYS, writeLocal } from "~/lib/storage";
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
 * ~/mocks/templates や ~/lib/storage を直接呼ばないこと。
 */

/** 生成中ローディングを見せるための擬似遅延 */
const GENERATE_LATENCY_MS = 2500;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function readAll(): SelfPromotionModel[] {
  return readLocal<SelfPromotionModel[]>(STORAGE_KEYS.selfPromotions, []);
}

function writeAll(items: SelfPromotionModel[]): void {
  writeLocal(STORAGE_KEYS.selfPromotions, items);
}

export function listSelfPromotions(): SelfPromotionModel[] {
  // 新しいものを先頭に
  return [...readAll()].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
}

export function getSelfPromotion(id: string): SelfPromotionModel | undefined {
  return readAll().find((item) => item.id === id);
}

export async function createSelfPromotion(
  req: CreateSelfPromotionRequest,
): Promise<SelfPromotionModel> {
  await sleep(GENERATE_LATENCY_MS);

  const { title, content } = generateSelfPromotion(req);
  const now = new Date().toISOString();
  const created: SelfPromotionModel = {
    id: crypto.randomUUID(),
    title,
    content,
    created_at: now,
    updated_at: now,
  };

  writeAll([...readAll(), created]);
  return created;
}

export function updateSelfPromotion(
  id: string,
  patch: UpdateSelfPromotionRequest,
): SelfPromotionModel {
  const items = readAll();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error(`self promotion not found: ${id}`);
  }

  const updated: SelfPromotionModel = {
    ...items[index],
    ...patch,
    updated_at: new Date().toISOString(),
  };
  items[index] = updated;
  writeAll(items);
  return updated;
}

export function deleteSelfPromotion(id: string): void {
  writeAll(readAll().filter((item) => item.id !== id));
}
