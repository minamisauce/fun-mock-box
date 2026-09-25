import type { DataClient } from '~/data/contract';
import { createLocalStore } from '~/data/local/store';
import { STORAGE_KEYS } from '~/lib/storage';
import {
  extractSample,
  generateEntrySheetCreate,
  generateEntrySheetReview,
} from '~/mocks/templates/entrySheet';
import { generateMotivation } from '~/mocks/templates/motivation';
import { generateSelfPromotion } from '~/mocks/templates/selfPromotion';
import type { EntrySheetModel } from '~/types/entrySheet';
import type { MotivationModel } from '~/types/motivation';
import type { SelfPromotionModel } from '~/types/selfPromotion';

/**
 * localStorage だけで完結する実装。バックエンドを起動しないときに使う。
 *
 * これは「偽のバックエンド」ではなく単一デバイスのストアである。
 * 検索・ページネーション・入力検証は持たせない（契約に無いものは実装しない）。
 *
 * 擬似遅延は入れない。生成中の演出は GeneratingOverlay 側の
 * 最小表示時間として持つので、ここは HTTP 実装と同じく即座に解決する。
 */
export function createLocalClient(): DataClient {
  const selfPromotions = createLocalStore<SelfPromotionModel>(
    STORAGE_KEYS.selfPromotions,
  );
  const motivations = createLocalStore<MotivationModel>(
    STORAGE_KEYS.motivations,
  );
  const entrySheets = createLocalStore<EntrySheetModel>(
    STORAGE_KEYS.entrySheets,
  );

  return {
    selfPromotions: {
      async list() {
        return selfPromotions.list();
      },
      async get(id) {
        return selfPromotions.get(id) ?? null;
      },
      async create(req) {
        return selfPromotions.insert(generateSelfPromotion(req));
      },
      async update(id, patch) {
        return selfPromotions.update(id, patch);
      },
    },

    motivations: {
      async list() {
        return motivations.list();
      },
      async get(id) {
        return motivations.get(id) ?? null;
      },
      async create(req) {
        return motivations.insert(generateMotivation(req));
      },
      async update(id, patch) {
        return motivations.update(id, patch);
      },
    },

    entrySheets: {
      async list() {
        return entrySheets.list();
      },
      async get(id) {
        return entrySheets.get(id) ?? null;
      },
      async create(req) {
        const { content, ai_explanation_json } = generateEntrySheetCreate(req);
        return entrySheets.insert({
          type: 'CREATE',
          question: req.question,
          company_name: req.company_name,
          content,
          ai_explanation_schema_version: 'CREATE_V1',
          ai_explanation_json,
        });
      },
      async review(req) {
        const { content, ai_explanation_json } = generateEntrySheetReview(req);
        return entrySheets.insert({
          type: 'REVIEW',
          question: req.question,
          company_name: req.company_name,
          content,
          original_content: req.original_content,
          ai_explanation_schema_version: 'REVIEW_V1',
          ai_explanation_json,
        });
      },
      async update(id, patch) {
        return entrySheets.update(id, patch);
      },
      async extractFromImage(file) {
        // 画像のバイト列は読まない。実 OCR に差し替えるのは HTTP 実装側の仕事
        return extractSample(file.name);
      },
    },
  };
}
