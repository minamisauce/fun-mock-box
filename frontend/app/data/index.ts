import type { DataClient } from '~/data/contract';
import { createLocalClient } from '~/data/local/client';

/**
 * データアクセスの唯一の切り替え地点。
 *
 * routes / features はここから `dataClient` だけを import する。
 * `~/data/local` や `~/data/http` を直接触らないこと。
 *
 * バックエンドを繋いだ段階で、`VITE_API_URL` の有無で HTTP 実装と
 * 切り替える形にする（未設定ならこれまでどおり localStorage で完結する）。
 */
export const dataClient: DataClient = createLocalClient();
