import { readLocal, STORAGE_KEYS, writeLocal } from '~/lib/storage';

export const ANONYMOUS_ID_HEADER = 'X-Anonymous-Id';

/**
 * 端末を識別する匿名ID。認証は無く、これだけでデータの持ち主を決める。
 *
 * サーバー発行にしないのは、バックエンドを起動しないオフラインモードでも
 * 端末IDが確定している必要があるため。初期化の順序に依存しないよう、
 * アプリ起動時ではなく最初に必要になった時点で発行する。
 */
export function getAnonymousId(): string {
  const stored = readLocal<string | null>(STORAGE_KEYS.anonymousId, null);
  if (stored) return stored;

  const id = crypto.randomUUID();
  writeLocal(STORAGE_KEYS.anonymousId, id);
  return id;
}
