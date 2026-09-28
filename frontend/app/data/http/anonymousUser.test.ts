import { beforeEach, describe, expect, it } from 'vitest';
import { getAnonymousId } from '~/data/http/anonymousUser';
import { readLocal, STORAGE_KEYS } from '~/lib/storage';

describe('getAnonymousId', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('初回に発行して localStorage に保存する', () => {
    const id = getAnonymousId();

    expect(id).not.toBe('');
    expect(readLocal(STORAGE_KEYS.anonymousId, null)).toBe(id);
  });

  it('2回目以降は同じ値を返す（端末の同一性が保たれる）', () => {
    expect(getAnonymousId()).toBe(getAnonymousId());
  });
});
