import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  optimizeDeps: {
    // web-llm / wllama は生成を始めたときに dynamic import する。起動時に事前バンドル
    // しておかないと、初回の生成で依存の最適化が走ってページごと再読み込みされる
    include: ['@mlc-ai/web-llm', '@wllama/wllama/esm/index.js'],
  },
  server: {
    proxy: {
      // .env.local で VITE_API_URL=/api を設定したときだけ実際に使われる。
      // ブラウザは常に 5173 としか話さないので開発中は CORS が発生しない
      '/api': {
        target: 'http://localhost:3334',
        changeOrigin: true,
      },
    },
  },
});
