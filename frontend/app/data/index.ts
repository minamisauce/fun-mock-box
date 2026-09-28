import type { DataClient } from '~/data/contract';
import { createHttpClient } from '~/data/http/client';
import { createLocalClient } from '~/data/local/client';

/**
 * データアクセスの唯一の切り替え地点。
 *
 * routes / features はここから `dataClient` だけを import する。
 * `~/data/local` や `~/data/http` を直接触らないこと。
 *
 * VITE_API_URL が無ければ localStorage だけで完結するオフラインモードで動く。
 * ビルド時にリテラル置換されるので、使わない側の実装はバンドルから落ちる。
 *
 * 「fetch に失敗したら黙って localStorage に落ちる」フォールバックは作らない。
 * どちらのモードで動いているか分からなくなり、DB に入るはずのデータが
 * 静かに端末内に残るのがいちばん困るため。
 */
const baseUrl = import.meta.env.VITE_API_URL;

export const dataClient: DataClient = baseUrl
  ? createHttpClient(baseUrl)
  : createLocalClient();
