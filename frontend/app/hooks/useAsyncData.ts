import { useCallback, useEffect, useRef, useState } from 'react';
import { type DataError, reportError, toDataError } from '~/data/errors';

type State<T> = {
  data: T | undefined;
  error: DataError | null;
  isLoading: boolean;
};

/**
 * マウント後にデータを取りに行くためのフック。
 *
 * 返り値の名前は React Query（useQuery）に揃えてある。将来キャッシュが必要に
 * なったら、このフックを消して useQuery に置き換えるだけで済むようにするため。
 *
 * @param fetcher signal を受け取る取得関数。毎レンダー作り直してよい
 * @param deps    再取得のきっかけ。fetcher の同一性には依存しないので、
 *                インライン関数を渡しても無限ループしない
 */
export function useAsyncData<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
) {
  const [state, setState] = useState<State<T>>({
    data: undefined,
    error: null,
    isLoading: true,
  });
  const [reloadCount, setReloadCount] = useState(0);

  // 取得の effect より前に宣言する。同じコミット内では宣言順に走るので、
  // 取得時には必ず最新の fetcher が入っている
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  // reloadCount は effect 内で読まないが、refetch から effect を
  // 再実行させるための引き金なので依存に必要
  // biome-ignore lint/correctness/useExhaustiveDependencies: 上記のとおり引き金として使う
  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    // 前の結果を残さない。id が変わったのに古い内容が見え続けるのを防ぐ
    setState({ data: undefined, error: null, isLoading: true });

    fetcherRef.current(controller.signal).then(
      (data) => {
        if (ignore) return;
        setState({ data, error: null, isLoading: false });
      },
      (error: unknown) => {
        // 中断は失敗ではない。ここでエラー状態にすると
        // 画面遷移のたびにエラーが一瞬出る
        if (ignore || controller.signal.aborted) return;
        if (error instanceof Error && error.name === 'AbortError') return;
        reportError(error);
        setState({
          data: undefined,
          error: toDataError(error),
          isLoading: false,
        });
      },
    );

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [...deps, reloadCount]);

  const refetch = useCallback(() => setReloadCount((prev) => prev + 1), []);

  return { ...state, refetch };
}
