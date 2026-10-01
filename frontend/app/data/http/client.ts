import type { DataClient } from '~/data/contract';
import { DataError } from '~/data/errors';
import { ANONYMOUS_ID_HEADER, getAnonymousId } from '~/data/http/anonymousUser';
import { fetchJson, type RequestOptions } from '~/data/http/fetchJson';
import type { EntrySheetModel, ExtractedEntrySheet } from '~/types/entrySheet';
import type { MotivationModel } from '~/types/motivation';
import type { SelfPromotionModel } from '~/types/selfPromotion';

/**
 * バックエンドに繋ぐ実装。
 * 匿名IDヘッダはこの関数の内側で必ず付くので、呼び出し側が付け忘れようがない。
 */
export function createHttpClient(baseUrl: string): DataClient {
  const request = <T>(path: string, options: RequestOptions = {}) =>
    fetchJson<T>(`${baseUrl}${path}`, {
      ...options,
      headers: {
        [ANONYMOUS_ID_HEADER]: getAnonymousId(),
        ...options.headers,
      },
    });

  /** 契約どおり「見つからない」は throw せず null にする */
  const getOrNull = async <T>(
    path: string,
    signal?: AbortSignal,
  ): Promise<T | null> => {
    try {
      return await request<T>(path, { signal });
    } catch (e) {
      if (e instanceof DataError && e.kind === 'not_found') return null;
      throw e;
    }
  };

  return {
    selfPromotions: {
      list: (signal) =>
        request<SelfPromotionModel[]>('/self-promotions', { signal }),
      get: (id, signal) =>
        getOrNull<SelfPromotionModel>(`/self-promotions/${id}`, signal),
      create: (json) =>
        request<SelfPromotionModel>('/self-promotions', {
          method: 'POST',
          json,
        }),
      update: (id, json) =>
        request<SelfPromotionModel>(`/self-promotions/${id}`, {
          method: 'PATCH',
          json,
        }),
    },

    motivations: {
      list: (signal) => request<MotivationModel[]>('/motivations', { signal }),
      get: (id, signal) =>
        getOrNull<MotivationModel>(`/motivations/${id}`, signal),
      create: (json) =>
        request<MotivationModel>('/motivations', { method: 'POST', json }),
      update: (id, json) =>
        request<MotivationModel>(`/motivations/${id}`, {
          method: 'PATCH',
          json,
        }),
    },

    entrySheets: {
      list: (signal) => request<EntrySheetModel[]>('/entry-sheets', { signal }),
      get: (id, signal) =>
        getOrNull<EntrySheetModel>(`/entry-sheets/${id}`, signal),
      create: (json) =>
        request<EntrySheetModel>('/entry-sheets', { method: 'POST', json }),
      review: (json) =>
        request<EntrySheetModel>('/entry-sheets/review', {
          method: 'POST',
          json,
        }),
      update: (id, json) =>
        request<EntrySheetModel>(`/entry-sheets/${id}`, {
          method: 'PATCH',
          json,
        }),
      extractFromImage: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return request<ExtractedEntrySheet>('/entry-sheets/extract-text', {
          method: 'POST',
          formData,
        });
      },
    },
  };
}
