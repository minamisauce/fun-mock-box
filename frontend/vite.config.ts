import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
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
