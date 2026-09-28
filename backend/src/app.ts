import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { entrySheets } from './api/entry-sheet/entry-sheets.route';
import { motivations } from './api/motivation/motivations.route';
import { selfPromotions } from './api/self-promotion/self-promotions.route';
import { CORS_ORIGINS } from './env';
import { AppError, errorBody, internalServerErrorBody } from './shared/errors';
import { anonymousUser } from './shared/middleware/anonymous-user';
import type { AppEnv } from './shared/types';

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

// 以降 c.get('userId') が必ず入っている
app.use('/api/*', anonymousUser);

app.route('/api/self-promotions', selfPromotions);
app.route('/api/motivations', motivations);
app.route('/api/entry-sheets', entrySheets);

app.notFound((c) =>
  c.json(errorBody('not_found', 'エンドポイントが見つかりません。'), 404),
);

app.onError((err, c) => {
  if (err instanceof AppError) return c.json(err.body, err.status);
  console.error(err);
  return c.json(internalServerErrorBody(), 500);
});
