import { readLocal, writeLocal } from "~/lib/storage";

/** 3ツールとも生成結果は同じ形（タイトル + 本文）なので共通の型にする */
export type ToolResultModel = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

/**
 * localStorage を裏に持つコレクションストア。
 * ツールごとにキーを変えて呼ぶだけで使い回せる。
 */
export function createMockStore<T extends ToolResultModel>(storageKey: string) {
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

    insert(data: Pick<T, "title" | "content">): T {
      const now = new Date().toISOString();
      const created = {
        id: crypto.randomUUID(),
        title: data.title,
        content: data.content,
        created_at: now,
        updated_at: now,
      } as T;
      writeAll([...readAll(), created]);
      return created;
    },

    update(id: string, patch: Pick<T, "title" | "content">): T {
      const items = readAll();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new Error(`${storageKey}: not found (${id})`);
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

/** 生成中ローディングを見せるための擬似遅延 */
export const GENERATE_LATENCY_MS = 2500;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
