import { useCallback, useEffect, useRef, useState } from 'react';
import { type DataError, reportError, toDataError } from '~/data/errors';

/**
 * 保存・生成のような「押したら走る」非同期処理のためのフック。
 *
 * 失敗しても例外は投げず、`error` に載せて `undefined` を返す。
 * 呼び出し側は戻り値の有無で成否を判定できるので、try/catch を書かずに済む。
 */
export function useAsyncAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<DataError | null>(null);

  const actionRef = useRef(action);
  useEffect(() => {
    actionRef.current = action;
  });

  // state ではなく ref で見る。disabled={isPending} だけでは防げない
  // （モバイルのダブルタップは同一 tick で2回発火し、両方とも false を見る）
  const pendingRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      if (pendingRef.current) return undefined;
      pendingRef.current = true;
      setIsPending(true);
      setError(null);

      try {
        return await actionRef.current(...args);
      } catch (e) {
        reportError(e);
        if (mountedRef.current) setError(toDataError(e));
        return undefined;
      } finally {
        pendingRef.current = false;
        if (mountedRef.current) setIsPending(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => setError(null), []);

  return { run, isPending, error, clearError };
}
