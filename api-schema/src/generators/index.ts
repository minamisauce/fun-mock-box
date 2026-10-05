/**
 * 「LLM の代わり」の決定論的な生成器。入力のハッシュで文型を選ぶ純粋関数。
 * 出典: 旧 frontend/app/mocks/templates/（ロジックは無変更）
 *
 * backend の暫定生成ロジックと、frontend のオフラインモードが同じ文面を
 * 返せるよう、両者が参照できる api-schema に置いている。
 * 画面からの生成はブラウザ内LLM（frontend/app/features/LocalLlm）に移ったので、
 * ここが使われるのはリクエストに generated が無いとき（テスト・API の直叩き）だけ。
 */
export * from './entry-sheet';
export * from './motivation';
export * from './self-promotion';
