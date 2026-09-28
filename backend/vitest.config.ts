import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // DATABASE_URL の差し替えは setupFiles / globalSetup 側で行う。
    // ここで src/ を import すると Vite の native config loader が警告を出すため
    setupFiles: ['./src/test/setup-env.ts'],
    globalSetup: ['./src/test/global-setup.ts'],
    // SQLite に同時書き込みすると SQLITE_BUSY で落ちるので直列に流す
    fileParallelism: false,
  },
});
