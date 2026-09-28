import path from 'node:path';

// dotenv は入れない。Node 20.12+ の組み込み API で足りる
try {
  process.loadEnvFile(path.join(import.meta.dirname, '../.env'));
} catch {
  // .env が無ければ既定値で動く
}

// 就活BOX の NestJS が 3333 を使うので、両方を同時に起動できるよう1つずらす
export const PORT = Number(process.env.PORT ?? 3334);

export const CORS_ORIGINS = (
  process.env.CORS_ORIGIN ?? 'http://localhost:5173'
).split(',');

/**
 * SQLite のファイル位置。
 * 相対パスの基準が CLI と runtime でズレるので、絶対パスに正規化して封じる。
 */
export const DATABASE_URL =
  process.env.DATABASE_URL ??
  `file:${path.join(import.meta.dirname, '../prisma/dev.db')}`;
