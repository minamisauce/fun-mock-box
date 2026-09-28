/**
 * 生成中オーバーレイの最小表示時間(ms)。
 *
 * データ層（localStorage 実装 / HTTP 実装）には擬似遅延を持たせない。
 * 一瞬で消えるとオーバーレイが点滅して見えるので、演出はここで持つ。
 */
export const GENERATING_MIN_DURATION_MS = 2500;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 最低でも ms だけ待ってから解決する。
 * 失敗したときは待たずに reject するので、エラーはすぐ画面に出る。
 */
export async function withMinimumDuration<T>(
  promise: Promise<T>,
  ms: number,
): Promise<T> {
  const [result] = await Promise.all([promise, sleep(ms)]);
  return result;
}
