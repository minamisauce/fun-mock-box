import path from 'node:path';

const backendDir = path.join(import.meta.dirname, '../..');

/** 開発用の dev.db とは別ファイル。混ざると pnpm test が開発データを消す */
export const TEST_DB_PATH = path.join(backendDir, 'prisma/test.db');

export const TEST_DATABASE_URL = `file:${TEST_DB_PATH}`;

export const BACKEND_DIR = backendDir;
