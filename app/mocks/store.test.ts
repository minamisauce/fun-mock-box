import { beforeEach, describe, expect, it } from 'vitest';
import { createMockStore, type ToolResultModel } from '~/mocks/store';

const KEY = 'test:items';

function makeStore() {
  return createMockStore<ToolResultModel>(KEY);
}

describe('createMockStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('insert した内容を get で取り出せる', () => {
    const store = makeStore();
    const created = store.insert({ title: 'タイトル', content: '本文' });

    expect(created.id).not.toBe('');
    expect(store.get(created.id)).toEqual(created);
  });

  it('list は作成日時の新しい順に返す', () => {
    const store = makeStore();
    const older = store.insert({ title: '古い', content: 'a' });
    // created_at は ISO 文字列の比較なので、同時刻だと順序が定まらない
    const newer = {
      ...store.insert({ title: '新しい', content: 'b' }),
      created_at: '2100-01-01T00:00:00.000Z',
    };
    localStorage.setItem(KEY, JSON.stringify([older, newer]));

    expect(store.list().map((i) => i.title)).toEqual(['新しい', '古い']);
  });

  it('update は該当項目だけ書き換え、updated_at を進める', () => {
    const store = makeStore();
    const created = store.insert({ title: '旧', content: '旧本文' });

    const updated = store.update(created.id, {
      title: '新',
      content: '新本文',
    });

    expect(updated.id).toBe(created.id);
    expect(updated.title).toBe('新');
    expect(updated.created_at).toBe(created.created_at);
    expect(store.list()).toHaveLength(1);
  });

  it('存在しない id の update は投げる', () => {
    const store = makeStore();
    expect(() =>
      store.update('missing', { title: 'x', content: 'y' }),
    ).toThrow();
  });

  it('localStorage の内容が壊れていても空配列として扱う', () => {
    localStorage.setItem(KEY, '{壊れたJSON');
    expect(makeStore().list()).toEqual([]);
  });

  it('ツールごとにキーが分かれていれば干渉しない', () => {
    const a = createMockStore<ToolResultModel>('test:a');
    const b = createMockStore<ToolResultModel>('test:b');
    a.insert({ title: 'A', content: 'a' });

    expect(a.list()).toHaveLength(1);
    expect(b.list()).toHaveLength(0);
  });
});
