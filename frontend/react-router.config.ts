import type { Config } from '@react-router/dev/config';

export default {
  // バックエンドを持たないモックのため SPA モードで動かす。
  // データは localStorage / sessionStorage に持つので、SSR を有効にすると
  // 全画面でハイドレーション不整合の対策が必要になり、モックの本質と無関係な
  // 複雑さが増える。実 API を繋ぐ段になったら `true` に戻す。
  ssr: false,
} satisfies Config;
