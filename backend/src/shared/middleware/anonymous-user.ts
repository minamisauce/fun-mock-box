import { createMiddleware } from 'hono/factory';
import * as z from 'zod';
import { badRequest } from '../errors';
import { prisma } from '../prisma';
import type { AppEnv } from '../types';

export const ANONYMOUS_ID_HEADER = 'x-anonymous-id';

const anonymousIdSchema = z.uuid();

/**
 * 匿名ユーザーの解決。
 *
 * ID はクライアントが発行する（サーバー発行にすると、バックエンドを起動しない
 * オフラインモードで端末IDが確定しないため）。
 * 認証の概念が無いので、欠落・不正は 401 ではなく 400 にする。
 */
export const anonymousUser = createMiddleware<AppEnv>(async (c, next) => {
  const parsed = anonymousIdSchema.safeParse(c.req.header(ANONYMOUS_ID_HEADER));

  if (!parsed.success) {
    throw badRequest([
      {
        field: ANONYMOUS_ID_HEADER,
        message: 'invalid_anonymous_id',
        user_message: '端末IDが不正です。ページを再読み込みしてください。',
      },
    ]);
  }

  // 「初回訪問＝行が無い」を upsert で吸収する
  const user = await prisma.user.upsert({
    where: { anonymous_id: parsed.data },
    create: { anonymous_id: parsed.data },
    update: {},
    select: { id: true },
  });

  c.set('userId', user.id);
  await next();
});
