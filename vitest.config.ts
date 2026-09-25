import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // localStorage を使うモックストアのテストがあるため jsdom
    environment: 'jsdom',
    include: ['app/**/*.test.ts', 'app/**/*.test.tsx'],
  },
  resolve: {
    // tsconfig の paths（~/* -> ./app/*）と揃える
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
});
