# CLAUDE.md

## これは何

就活BOXの「自己PR作成」「志望動機作成」「ES作成」ツールの **モック** リポジトリ。
バックエンドは無く、`app/mocks/` の擬似APIと localStorage で動く。
本番実装は `../shukatsu-box` を参照（型・ステップ定義・デザイントークンの出典）。

## コマンド

パッケージマネージャは **pnpm**。npm / yarn を使わない。
Node は `.node-version`（24.15.0）に従う。React Router v8 は Node > 22.22.0 が必須。

```bash
pnpm dev         # http://localhost:5173
pnpm build

# CI で検証している3つ（PR を出す前にこの3つを通す）
pnpm format      # biome check（フォーマット + lint）
pnpm typecheck   # react-router typegen && tsc
pnpm test        # vitest run

pnpm format:fix  # biome check --write（自動修正）
```

CI は `.github/workflows/check.yml`。1つ落ちても残りを実行するので、
PR 上で3つぶんの結果がまとめて見える。

## ハマりどころ（必読）

### 1. ルートはファイルを置いても認識されない

`remix-flat-routes` は未導入。**必ず `app/routes.ts` の配列に
`index()` / `route()` / `layout()` / `prefix()` で登録する。**
ファイル名の `$` や `+` には何の意味も無いので使わない。

`/self-promotions/new` は `route(":id")` に食われるため、
`route("new", ...)` の明示が必要（登録順ではなく具体性で解決されるが、
そもそもルートが存在しないと `:id` にマッチする）。

### 2. パスエイリアスは `~/`（`@/` ではない）

`~/*` → `./app/*`。shukatsu-box のコードを移植するときは `@/` を `~/` に置換する。

### 3. 型は必ず `import type`

`verbatimModuleSyntax: true`。値と型を同じ import 文に混ぜない。
ルートモジュールの型は `import type { Route } from "./+types/<ファイル名>"`。
`.react-router/types/` は自動生成なので直接編集しない。

### 4. Tailwind は v4（CSS-first）。`tailwind.config.ts` は存在しない

トークンは `app/app.css` の `@theme` に CSS 変数で定義する。

| 種別 | 名前空間 | 例 |
|---|---|---|
| 色 | `--color-*` | `bg-primary-self-promotion` |
| 余白 | `--spacing-*` | `p-md`, `gap-xs` |
| 文字サイズ | `--text-*` | `text-sm` |
| 行間 | `--leading-*` | `leading-md` |
| 角丸 | `--radius-*` | `rounded-md` |
| 影 | `--shadow-*` | `shadow-all-sides` |
| 幅 | `--container-*` | `w-tool`（375px） |

- カスタムユーティリティは `@utility` ディレクティブで定義する。
- **生の hex（`bg-[#5557e4]`）を書かない。** 必ずトークン名を使う。
- **クラス名を動的生成しない。** `` `bg-primary-${toolId}` `` は Tailwind が
  ソースをスキャンしても見つけられず CSS が生成されない。
  ツール色は `app/lib/toolTheme.ts` に完全なクラス文字列で持ち、
  `theme={TOOL_THEME["self-promotion"]}` の形でコンポーネントに渡す。
- `--text-*` は対になる `--text-X--line-height` を持つ。値だけ上書きすると
  デフォルトの行間が残るため、`--text-*: initial` でリセットしてからペアで定義する。
- **ダークモードは使わない**（`dark:` を書かない）。就活BOXは light 固定のスマホUI。

### 5. SPA モード（`react-router.config.ts` の `ssr: false`）

サーバーは無い。`loader` / `action` はサーバーで動かないので書かない。
データ取得は `app/mocks/` の関数を `useEffect` / イベントハンドラから呼ぶ。
localStorage / sessionStorage は `app/lib/storage.ts` のラッパ経由で触る。

### 6. モックAPIは `app/mocks/selfPromotion.ts` 経由でのみ呼ぶ

`app/mocks/templates/` や `app/lib/storage.ts` を routes / features から
直接 import しない。関数シグネチャは実APIと1:1に保ち、
型のフィールド名は本番（`@box/api-schema`）に揃える（snake_case 含む）。

### 7. ステップ定義とコンポーネントの循環参照に注意

`constants/steps.ts` はステップコンポーネントを import する。
コンポーネント側からステップ ID を参照したいときは
`constants/stepIds.ts`（コンポーネントを import しない）を使う。

## ディレクトリ規約

| 置き場所 | 何を置くか |
|---|---|
| `app/routes/` | ルートモジュールのみ。薄く保つ |
| `app/components/<PascalCase>/index.tsx` | 3ツールで使い回す汎用UI |
| `app/features/ToolWizard/` | **3ツール共通**のウィザード機構（型 + `useStepNavigation`）。ツール固有の型を持ち込まない |
| `app/features/<PascalCase>/` | ツール固有の components / constants / hooks |
| `app/mocks/` | 擬似API。差し替え境界 |
| `app/types/` | ドメイン型（本番 api-schema 相当） |
| `app/lib/` | cn / paths / storage / toolTheme |

**共通コンポーネントにツール名をハードコードしない。** 色は props で渡す。
これを守っている限り、志望動機・ES は `features/` の追加だけで載る。

## コードスタイル / テスト

Biome（`biome.jsonc`）に従う。shukatsu-box と同じ設定にしてあるので、
両リポジトリ間でコードをそのまま行き来させられる。

- **シングルクォート**（JSX も）、スペース2つ
- import の自動整列、未使用 import はエラー
- Tailwind クラスの並べ替え（`useSortedClasses`）は nursery のため一旦 off

テストは Vitest（`vitest.config.ts`、jsdom 環境）。`app/**/*.test.ts` を拾う。
現状カバーしているのは擬似APIの中核だけ:

- `app/mocks/templates/*.test.ts` — 生成文の決定性・入力の反映・段落数・文字数上限
- `app/mocks/store.test.ts` — localStorage ストアの CRUD と壊れたJSONの扱い

UI のテストはまだ無い。追加するなら `@testing-library/react` を入れる。

## アイコン

`lucide-react` を使う。SVG を手書きしない。
Design System のアイコンは 24px 指定なので `size={24}` を基本にする
（チップやバッジなど小さい要素では 12〜14px）。

## 参考実装の所在

- 自己PR: `../shukatsu-box/frontend/app/src/features/SelfPromotion/`
- ステップ遷移: `../shukatsu-box/frontend/app/src/features/Motivation/hooks/useStepNavigation.ts`
- デザイントークン: `../shukatsu-box/frontend/tailwind.config.ts`
- API型: `../shukatsu-box/api-schema/src/api/self-promotion/self-promotion.ts`
