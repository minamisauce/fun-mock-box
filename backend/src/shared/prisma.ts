import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { DATABASE_URL } from '../env';
import { PrismaClient } from '../generated/prisma/client';

// Prisma 7 は driver adapter 必須。@prisma/client からではなく生成先から import する
const adapter = new PrismaBetterSqlite3({ url: DATABASE_URL });

export const prisma = new PrismaClient({ adapter });

/**
 * SQLite の既定は journal_mode=delete / foreign_keys=OFF。
 * そのままだと dev サーバと vitest / studio が同じファイルを触ったときに
 * SQLITE_BUSY で落ち、onDelete: Cascade も黙って効かない。
 */
export async function tunePragmas(): Promise<void> {
  await prisma.$executeRawUnsafe('PRAGMA journal_mode = WAL');
  await prisma.$executeRawUnsafe('PRAGMA busy_timeout = 5000');
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON');
}
