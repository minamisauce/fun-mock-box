/**
 * 「LLM の代わり」の決定論的な生成器。入力のハッシュで文型を選ぶ純粋関数。
 * 出典: 旧 frontend/app/mocks/templates/（ロジックは無変更）
 *
 * backend の暫定生成ロジックと、frontend のオフラインモードが同じ文面を
 * 返せるよう、両者が参照できる api-schema に置いている。
 * LLM を入れたら backend 側の参照を services へ移し、
 * ここはオフラインモード専用に縮退させる。
 */
export * from './entry-sheet';
export * from './motivation';
export * from './self-promotion';
