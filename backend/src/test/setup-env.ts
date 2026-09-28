import { TEST_DATABASE_URL } from './test-database';

/**
 * テストファイルが app / prisma を import する前に DATABASE_URL を差し替える。
 * src/env.ts は明示的な process.env を .env より優先するので、
 * これで必ずテスト用DBに向く。
 */
process.env.DATABASE_URL = TEST_DATABASE_URL;
