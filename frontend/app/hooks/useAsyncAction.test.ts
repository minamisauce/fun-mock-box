import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataError } from '~/data/errors';
import { useAsyncAction } from '~/hooks/useAsyncAction';

describe('useAsyncAction', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('成功したら結果をそのまま返す', async () => {
    const { result } = renderHook(() =>
      useAsyncAction(async (value: string) => `${value}:ok`),
    );

    let returned: string | undefined;
    await act(async () => {
      returned = await result.current.run('a');
    });

    expect(returned).toBe('a:ok');
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('同一 tick に2回呼んでも1回しか走らない（ダブルタップ対策）', async () => {
    const action = vi.fn(async () => 'ok');
    const { result } = renderHook(() => useAsyncAction(action));

    let results: (string | undefined)[] = [];
    await act(async () => {
      // disabled={isPending} が効く前に2回発火するケース
      results = await Promise.all([result.current.run(), result.current.run()]);
    });

    expect(action).toHaveBeenCalledTimes(1);
    expect(results).toEqual(['ok', undefined]);
  });

  it('失敗したら error に載せ、undefined を返す（例外は投げない）', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() =>
      useAsyncAction(async () => {
        throw new DataError('not_found');
      }),
    );

    let returned: unknown = 'まだ';
    await act(async () => {
      returned = await result.current.run();
    });

    expect(returned).toBeUndefined();
    expect(result.current.error?.kind).toBe('not_found');
    expect(result.current.isPending).toBe(false);
  });

  it('clearError でエラーを消せる', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() =>
      useAsyncAction(async () => {
        throw new Error('失敗');
      }),
    );

    await act(async () => {
      await result.current.run();
    });
    expect(result.current.error).not.toBeNull();

    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();
  });
});
