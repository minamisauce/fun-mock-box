/**
 * ツール色のスコープ。
 *
 * ツール色は CSS 変数（`--color-primary` / `--color-primary-soft`）の差し替えで
 * 表現する。実体は `app.css` の `[data-tool='...']` ブロックにあり、この属性を
 * 付けた要素の配下では `bg-primary` などが自動でそのツールの色になる。
 *
 * そのためコンポーネントはツール色を props で受け取らない。共通コンポーネントは
 * 自分がどのツールに居るかを知らないまま `bg-primary` と書けばよい。
 *
 * 付ける場所は各ツールの layout に1回だけ。ホームや作成履歴のように3ツールを
 * 並べる画面では、行やカードの単位で付ける。
 *
 * ```tsx
 * <div {...toolScope('motivation')}>
 *   <Outlet />
 * </div>
 * ```
 */
export type ToolId = 'self-promotion' | 'motivation' | 'entry-sheet';

/** `data-tool` を手書きせずに付けるためのヘルパー。要素を増やさない */
export function toolScope(toolId: ToolId) {
  return { 'data-tool': toolId } as const;
}
