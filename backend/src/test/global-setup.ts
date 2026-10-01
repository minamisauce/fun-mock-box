import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { BACKEND_DIR, TEST_DATABASE_URL, TEST_DB_PATH } from './test-database';

/**
 * テスト用DBを毎回マイグレーションから作り直す。
 *
 * `prisma migrate reset` は使わない。本番DBを壊しうる危険な操作として
 * 明示的な同意を要求されるため CI で通らない。
 * テスト専用ファイルを消してから migrate deploy すれば、
 * 同じマイグレーションを通った空のDBが手に入る。
 *
 * ⚠ vitest の test.env は globalSetup には効かない（テストワーカー側だけ）。
 *   ここで DATABASE_URL を明示しないと dev.db を触ってしまう。
 */
export default function setup() {
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    rmSync(`${TEST_DB_PATH}${suffix}`, { force: true });
  }

  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    cwd: BACKEND_DIR,
    stdio: 'ignore',
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
  });
}
