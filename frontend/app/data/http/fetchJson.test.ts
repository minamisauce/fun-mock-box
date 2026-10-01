import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataError } from '~/data/errors';
import { fetchJson } from '~/data/http/fetchJson';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/** 引数の型を明示しないと mock.calls が空タプルに推論される */
function createFetchMock() {
  return vi.fn(async (_url: string, _init?: RequestInit) => jsonResponse({}));
}

function headersOf(init?: RequestInit): Record<string, string> {
  return (init?.headers ?? {}) as Record<string, string>;
}

describe('fetchJson', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('2xx は JSON をそのまま返す', async () => {
    vi.stubGlobal('fetch', async () => jsonResponse({ id: 'a' }));
    expect(await fetchJson('/api/x')).toEqual({ id: 'a' });
  });

  it('204 は本文を読まない', async () => {
    vi.stubGlobal('fetch', async () => new Response(null, { status: 204 }));
    expect(await fetchJson('/api/x')).toBeUndefined();
  });

  it('json を渡すと Content-Type が付く', async () => {
    const fetchMock = createFetchMock();
    vi.stubGlobal('fetch', fetchMock);

    await fetchJson('/api/x', { method: 'POST', json: { a: 1 } });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.body).toBe('{"a":1}');
    expect(headersOf(init)['Content-Type']).toBe('application/json');
  });

  it('FormData のときは Content-Type を付けない（境界をブラウザに任せる）', async () => {
    const fetchMock = createFetchMock();
    vi.stubGlobal('fetch', fetchMock);

    await fetchJson('/api/x', { method: 'POST', formData: new FormData() });

    expect(
      headersOf(fetchMock.mock.calls[0]?.[1])['Content-Type'],
    ).toBeUndefined();
  });

  it('error_details の user_message をそのまま userMessage にする', async () => {
    vi.stubGlobal('fetch', async () =>
      jsonResponse(
        {
          status: 'bad_request',
          error_details: [
            {
              field: 'title',
              message: 'too_long',
              user_message: 'タイトルが長すぎます。',
            },
          ],
        },
        400,
      ),
    );

    await expect(fetchJson('/api/x')).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof DataError &&
        e.kind === 'validation' &&
        e.userMessage === 'タイトルが長すぎます。' &&
        e.status === 400,
    );
  });

  it('404 は not_found にする', async () => {
    vi.stubGlobal('fetch', async () => jsonResponse({}, 404));
    await expect(fetchJson('/api/x')).rejects.toSatisfy(
      (e: unknown) => e instanceof DataError && e.kind === 'not_found',
    );
  });

  it('JSON で返らないエラーでも既定の日本語文言が入る', async () => {
    vi.stubGlobal(
      'fetch',
      async () => new Response('<html>502</html>', { status: 502 }),
    );

    await expect(fetchJson('/api/x')).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof DataError && e.kind === 'server' && e.userMessage !== '',
    );
  });

  it('通信自体の失敗は network にする', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new TypeError('Failed to fetch');
    });

    await expect(fetchJson('/api/x')).rejects.toSatisfy(
      (e: unknown) => e instanceof DataError && e.kind === 'network',
    );
  });

  it('中断はラップせずそのまま投げる（失敗と区別するため）', async () => {
    vi.stubGlobal('fetch', async () => {
      throw Object.assign(new Error('aborted'), { name: 'AbortError' });
    });

    await expect(fetchJson('/api/x')).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof Error &&
        e.name === 'AbortError' &&
        !(e instanceof DataError),
    );
  });
});
