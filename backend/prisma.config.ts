import path from 'node:path';
import { defineConfig } from 'prisma/config';

try {
  process.loadEnvFile(path.join(import.meta.dirname, '.env'));
} catch {
  // .env が無ければ既定値で動く
}

/**
 * file:./dev.db が「どこ基準か」は CLI と runtime でズレる。
 * src/env.ts と同じく絶対パスへ正規化して封じる。
 */
const defaultDatabaseUrl = `file:${path.join(import.meta.dirname, 'prisma/dev.db')}`;

export default defineConfig({
  schema: 'prisma/schema',
  datasource: {
    url: process.env.DATABASE_URL ?? defaultDatabaseUrl,
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
});
