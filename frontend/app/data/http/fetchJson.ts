import type { ErrorResponse } from '@fun/api-schema';
import { DataError, type DataErrorKind } from '~/data/errors';

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH';
  /** JSON ボディ。Content-Type は自動で付く */
  json?: unknown;
  /** multipart ボディ。Content-Type はブラウザが境界付きで付けるので触らない */
  formData?: FormData;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

function kindFromStatus(status: number): DataErrorKind {
  if (status === 404) return 'not_found';
  if (status === 400 || status === 422) return 'validation';
  if (status >= 500) return 'server';
  return 'unknown';
}

async function toResponseError(response: Response): Promise<DataError> {
  let body: ErrorResponse | undefined;
  try {
    body = (await response.json()) as ErrorResponse;
  } catch {
    // JSON で返ってこないケース（プロキシのエラーページなど）
  }

  const details = body?.error_details;
  return new DataError(kindFromStatus(response.status), {
    status: response.status,
    details,
    message: `${response.status} ${body?.status ?? response.statusText}`,
    // サーバーが日本語をくれたらそれを、無ければ kind の既定文言を使う
    userMessage: details?.[0]?.user_message,
  });
}

/**
 * fetch の薄いラッパ。
 * 成功なら JSON を返し、失敗なら DataError を投げる。
 * 中断（AbortError）は包まずそのまま投げる（呼び出し側が失敗と区別するため）。
 */
export async function fetchJson<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', json, formData, signal, headers = {} } = options;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      signal,
      headers: json
        ? { 'Content-Type': 'application/json', ...headers }
        : headers,
      body: json ? JSON.stringify(json) : formData,
    });
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') throw e;
    throw new DataError('network', {
      message: e instanceof Error ? e.message : String(e),
    });
  }

  if (!response.ok) throw await toResponseError(response);

  if (
    response.status === 204 ||
    response.headers.get('content-length') === '0'
  ) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
