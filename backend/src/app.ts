import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { CORS_ORIGINS } from '~/env';
import {
  AppError,
  errorBody,
  internalServerErrorBody,
} from '~/shared/errors';
import type { AppEnv } from '~/shared/types';

export const app = new Hono<AppEnv>();

app.use('*', logger());
app.use(
  '/api/*',
  cors({
    origin: CORS_ORIGINS,
    // 独自ヘッダはここに入れないとプリフライトで全 POST が落ちる。
    // 症状が「原因不明の CORS エラー」になるので消さないこと
    allowHeaders: ['Content-Type', 'X-Anonymous-Id'],
  }),
);

/** 疎通確認用。匿名IDを要求しない */
app.get('/health', (c) => c.json({ status: 'ok' }));

app.notFound((c) =>
  c.json(errorBody('not_found', 'エンドポイントが見つかりません。'), 404),
);

app.onError((err, c) => {
  if (err instanceof AppError) return c.json(err.body, err.status);
  console.error(err);
  return c.json(internalServerErrorBody(), 500);
});
