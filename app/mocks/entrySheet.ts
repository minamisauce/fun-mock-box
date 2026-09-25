import { STORAGE_KEYS } from "~/lib/storage";
import { createMockStore, GENERATE_LATENCY_MS, sleep } from "~/mocks/store";
import {
  extractSample,
  generateEntrySheetCreate,
  generateEntrySheetReview,
} from "~/mocks/templates/entrySheet";
import type {
  CreateEntrySheetRequest,
  EntrySheetModel,
  ExtractedEntrySheet,
  ReviewEntrySheetRequest,
  UpdateEntrySheetRequest,
} from "~/types/entrySheet";

/**
 * ESの擬似API。
 * シグネチャは実APIと1:1。routes / features は必ずこのモジュール経由で触る。
 */
const store = createMockStore<EntrySheetModel>(STORAGE_KEYS.entrySheets);

export function listEntrySheets(): EntrySheetModel[] {
  return store.list();
}

export function getEntrySheet(id: string): EntrySheetModel | undefined {
  return store.get(id);
}

/** AIによるES作成 */
export async function createEntrySheet(
  req: CreateEntrySheetRequest,
): Promise<EntrySheetModel> {
  await sleep(GENERATE_LATENCY_MS);
  const { content, ai_explanation_json } = generateEntrySheetCreate(req);
  return store.insert({
    type: "CREATE",
    question: req.question,
    company_name: req.company_name,
    content,
    ai_explanation_schema_version: "CREATE_V1",
    ai_explanation_json,
  });
}

/** AIによるES添削 */
export async function reviewEntrySheet(
  req: ReviewEntrySheetRequest,
): Promise<EntrySheetModel> {
  await sleep(GENERATE_LATENCY_MS);
  const { content, ai_explanation_json } = generateEntrySheetReview(req);
  return store.insert({
    type: "REVIEW",
    question: req.question,
    company_name: req.company_name,
    content,
    original_content: req.original_content,
    ai_explanation_schema_version: "REVIEW_V1",
    ai_explanation_json,
  });
}

export function updateEntrySheet(
  id: string,
  patch: UpdateEntrySheetRequest,
): EntrySheetModel {
  return store.update(id, patch);
}

/** 画像アップロード〜テキスト抽出にかかる擬似時間 */
const EXTRACT_LATENCY_MS = 2000;

/**
 * 画像からの内容抽出。
 *
 * ES の画像には設問・企業名も写っていることが多いため、本文と合わせて
 * まとめて返す（読み取れなかった項目は undefined）。
 *
 * 本番は S3 へアップロード後にサーバー側で OCR している
 * （backend/src/api/entry-sheet/services/extract-text-from-image.service.ts）。
 * モックではサーバーを持たないため擬似的にサンプルを返す。
 * 実 OCR に差し替えるときはこの関数の中身だけを変えればよい。
 */
export async function extractEntrySheetFromImage(
  file: File,
): Promise<ExtractedEntrySheet> {
  await sleep(EXTRACT_LATENCY_MS);
  return extractSample(file.name);
}
