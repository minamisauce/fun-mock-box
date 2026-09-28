import { app } from '../app';
import { prisma } from '../shared/prisma';

export const USER_A = '11111111-1111-4111-8111-111111111111';
export const USER_B = '22222222-2222-4222-8222-222222222222';

/** 匿名IDヘッダ付きで app を直接叩く（HTTP サーバーを立てない） */
export function request(
  path: string,
  anonymousId: string | null,
  init: { method?: string; json?: unknown } = {},
) {
  const headers: Record<string, string> = {};
  if (anonymousId) headers['X-Anonymous-Id'] = anonymousId;
  if (init.json) headers['Content-Type'] = 'application/json';

  return app.request(path, {
    method: init.method ?? 'GET',
    headers,
    body: init.json ? JSON.stringify(init.json) : undefined,
  });
}

/** Response.json() は unknown なので、テスト側で期待する型を与える */
export async function requestJson<T>(
  path: string,
  anonymousId: string | null,
  init: { method?: string; json?: unknown } = {},
): Promise<T> {
  const res = await request(path, anonymousId, init);
  return (await res.json()) as T;
}

/** users を消せば Cascade で全部消える */
export async function resetDatabase() {
  await prisma.user.deleteMany();
}
