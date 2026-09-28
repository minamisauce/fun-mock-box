import { DataError } from '~/data/errors';
import { readLocal, writeLocal } from '~/lib/storage';

/** 保存される全モデルの共通フィールド */
export type StoredEntity = {
  id: string;
  created_at: string;
  updated_at: string;
};

/** 自己PR・志望動機のように「タイトル + 本文」で表せる結果 */
export type ToolResultModel = StoredEntity & {
  title: string;
  content: string;
};

/**
 * localStorage を裏に持つコレクションストア。
 * ツールごとにキーと型を変えて呼ぶだけで使い回せる。
 *
 * インメモリの状態を持たず毎回 localStorage を読むので、
 * 同じキーで複数生成しても不整合は起きない。
 */
export function createLocalStore<T extends StoredEntity>(storageKey: string) {
  const readAll = (): T[] => readLocal<T[]>(storageKey, []);
  const writeAll = (items: T[]): void => writeLocal(storageKey, items);

  return {
    /** 新しいものが先頭 */
    list(): T[] {
      return [...readAll()].sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      );
    },

    get(id: string): T | undefined {
      return readAll().find((item) => item.id === id);
    },

    insert(data: Omit<T, keyof StoredEntity>): T {
      const now = new Date().toISOString();
      const created = {
        ...data,
        id: crypto.randomUUID(),
        created_at: now,
        updated_at: now,
      } as T;
      writeAll([...readAll(), created]);
      return created;
    },

    update(id: string, patch: Partial<Omit<T, keyof StoredEntity>>): T {
      const items = readAll();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        // HTTP 実装の 404 と同じ形に揃える（contract.ts の規約）
        throw new DataError('not_found', {
          message: `${storageKey}: not found (${id})`,
        });
      }
      const updated: T = {
        ...items[index],
        ...patch,
        updated_at: new Date().toISOString(),
      };
      items[index] = updated;
      writeAll(items);
      return updated;
    },
  };
}
