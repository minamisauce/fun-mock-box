import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAsyncData } from '~/hooks/useAsyncData';

/** 解決のタイミングをテストから制御するための Promise */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('useAsyncData', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('解決した値を data に載せる', async () => {
    const { result } = renderHook(() =>
      useAsyncData(() => Promise.resolve('値'), []),
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBe('値');
    expect(result.current.error).toBeNull();
  });

  it('deps が変わったあとに届いた先行リクエストの結果は捨てる', async () => {
    const first = deferred<string>();
    const second = deferred<string>();

    const { result, rerender } = renderHook(
      ({ id }: { id: string }) =>
        useAsyncData(() => (id === 'a' ? first.promise : second.promise), [id]),
      { initialProps: { id: 'a' } },
    );

    rerender({ id: 'b' });

    await act(async () => {
      second.resolve('B');
    });
    expect(result.current.data).toBe('B');

    // 遅れて届いた 'a' の結果で 'B' を上書きしない
    await act(async () => {
      first.resolve('A');
    });
    expect(result.current.data).toBe('B');
  });

  it('失敗したら error に載せ、data は空のままにする', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() =>
      useAsyncData(() => Promise.reject(new Error('落ちた')), []),
    );

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error?.userMessage).not.toBe('');
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('中断（AbortError）はエラー扱いにしない', async () => {
    const aborted = deferred<string>();
    const { result, unmount } = renderHook(() =>
      useAsyncData(() => aborted.promise, []),
    );

    unmount();
    await act(async () => {
      aborted.reject(
        Object.assign(new Error('aborted'), { name: 'AbortError' }),
      );
    });

    expect(result.current.error).toBeNull();
  });

  it('refetch で取り直す', async () => {
    const fetcher = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce('1回目')
      .mockResolvedValueOnce('2回目');

    const { result } = renderHook(() => useAsyncData(() => fetcher(), []));
    await waitFor(() => expect(result.current.data).toBe('1回目'));

    act(() => result.current.refetch());
    await waitFor(() => expect(result.current.data).toBe('2回目'));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
