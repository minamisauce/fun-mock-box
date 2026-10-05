# CLAUDE.md

## これは何

就活BOXの「自己PR作成」「志望動機作成」「ES作成」ツールの **プロトタイプ** リポジトリ。
本番実装は `../shukatsu-box` を参照（型・ステップ定義・デザイントークンの出典）。

pnpm workspace の3パッケージ構成。依存の向きは `api-schema → frontend / backend` で、
frontend と backend は相互に依存しない。

| パッケージ | 中身 |
|---|---|
| `frontend/` | React Router v8 の SPA（`ssr: false`） |
| `backend/` | Hono + Prisma + SQLite の JSON API |
| `api-schema/` | Zod スキーマ・型・決定論的な生成器。FE/BE が共有する |

**バックエンドを起動しなくても動く**のが設計の中心要件。`VITE_API_URL` が無ければ
localStorage だけで完結する（詳細は「データアクセス層」）。

文章の生成は **ブラウザ内LLM（WebGPU 上の WebLLM / wllama）** で行う。どちらのモードでも生成は端末で、
保存だけが localStorage / backend に分かれる（詳細は §10）。

## コマンド

パッケージマネージャは **pnpm**。npm / yarn を使わない。
Node は `.node-version`（24.15.0）に従う。React Router v8 は Node > 22.22.0 が必須で、
グローバルが古いと `pnpm dev` が起動時に弾かれるので `mise exec -- pnpm ...` で実行する。

```bash
pnpm install                    # postinstall で prisma generate まで走る
pnpm -F @fun/backend db:migrate # 初回のみ。backend/prisma/dev.db が作られる

pnpm dev            # FE:5173 + BE:3334 を同時起動
pnpm dev:frontend   # バックエンド無しで起動（オフラインモード）

# CI で検証しているもの（PR を出す前に通す）
pnpm format         # biome check（ルート1本で3パッケージを見る）
pnpm typecheck      # pnpm -r
pnpm test           # pnpm -r
pnpm build          # 環境変数あり/なしの2回ぶんを CI で回している

pnpm format:fix
pnpm -F @fun/backend db:studio
```

CI は `.github/workflows/check.yml`。1つ落ちても残りを実行する。

## ハマりどころ（必読）

### 1. データアクセスは `~/data` の `dataClient` 経由でのみ

`frontend/app/data/` に契約（`contract.ts`）が1つあり、それを
**localStorage 実装（`local/`）と HTTP 実装（`http/`）の両方**が満たす。
routes / features は `~/data` の `dataClient` だけを import し、
`~/data/local` や `~/data/http` を直接触らない。

切り替えは `frontend/.env.local` の `VITE_API_URL` の**有無だけ**。
無ければオフライン、あれば HTTP。ビルド時に畳まれるので使わない側は
バンドルから落ちる。**「fetch に失敗したら黙って localStorage に落ちる」
フォールバックは作らない**（どちらのモードで動いているか分からなくなるため）。

2実装がズレないよう `data/contract.test.ts` が同じテストを両方に流している。
契約を増やすときは必ず両実装とこのテストを同時に直す。
ローカル実装は意図的に貧弱に保つ（検索・ページネーション・入力検証を持たせない）。

**モード間でデータは移行しない。** オフラインで作ったものは接続モードでは見えない。

### 2. パスエイリアスはパッケージごとに違う

- `frontend`: `~/*` → `frontend/app/*`
- `backend`: **エイリアス無し。相対 import に統一**（tsx が baseUrl 無しに
  paths を解決できず、その baseUrl は TS7 で廃止予定のため）
- パッケージ間は `@fun/api-schema` で参照する

### 3. 型は必ず `import type`

`verbatimModuleSyntax: true`。値と型を同じ import 文に混ぜない。
frontend が `@fun/api-schema` から Zod スキーマを**値**で import すると
バンドルに zod が丸ごと入るので、型だけを取ること。

### 4. api-schema はビルドしない

`exports` が `.ts` ソースを直接指している。frontend(Vite) / backend(tsx) / tsc の
3方向がソースを読むので `dist` の同期ズレが起きない。
就活BOX は `'zod/v4'` から import しているが、こちらは `'zod'`（移植時に直す1行）。

### 5. React Router は SPA モード（`ssr: false`）を維持する

バックエンドは**別プロセスの JSON API** であって React Router のサーバーではない。
SSR にすると localStorage 実装がサーバー側で走って空を返し、全画面がチラつく。
`loader` / `action` は書かない。データ取得は `useAsyncData` / `useAsyncAction` を使う。

### 6. ルートはファイルを置いても認識されない

`remix-flat-routes` は未導入。必ず `frontend/app/routes.ts` の配列に登録する。
`/self-promotions/new` は `route(":id")` に食われるため `route("new", ...)` の明示が必要。

backend も同じ罠がある。`/review` `/extract-text` のような固定パスは
`/:id` より**先に**登録する。

### 7. バックエンドの落とし穴

- **ポートは 3334**。3333 は就活BOX の NestJS が使う（同時に起動できるようずらしてある）
- **CORS の `allowHeaders` に `X-Anonymous-Id`** が無いとプリフライトで全 POST が落ちる。
  症状が「原因不明の CORS エラー」になる。開発は Vite プロキシ経由なので顕在化しない
- **Prisma 7**: driver adapter 必須／`prisma.config.ts` 必須／generator の `output` 必須。
  `@prisma/client` ではなく `src/generated/prisma/client` から import する
- **Prisma の行型は `<Model>Model`** という名前で api-schema の型と衝突する。
  presenter では `as <Model>Row` で別名 import する
- **`prisma migrate reset` は使わない**。AI エージェントには危険操作として同意が要求され
  CI で通らない。テストは `test.db` を消して `migrate deploy` で作り直す
- **SQLite の `PRAGMA foreign_keys` は既定 OFF**。`onDelete: Cascade` が黙って効かないので
  起動時に `tunePragmas()` で WAL / busy_timeout / foreign_keys を明示する
- **`@db.Text` は SQLite で使えない**。就活BOXのスキーマをコピーすると validate で落ちる
- **vitest の `test.env` は globalSetup に効かない**。DATABASE_URL は
  `src/test/global-setup.ts` 側でも明示している（忘れると dev.db を触る）

### 8. Tailwind は v4（CSS-first）。`tailwind.config.ts` は存在しない

トークンは `frontend/app/app.css` の `@theme` に CSS 変数で定義する。

| 種別 | 名前空間 | 例 |
|---|---|---|
| 色 | `--color-*` | `bg-primary`, `text-danger` |
| 余白 | `--spacing-*` | `p-md`, `gap-xs` |
| 文字サイズ | `--text-*` | `text-sm` |
| 行間 | `--leading-*` | `leading-md` |
| 角丸 | `--radius-*` | `rounded-md` |
| 影 | `--shadow-*` | `shadow-all-sides` |
| 幅 | `--container-*` | `w-tool`（375px） |

- **生の hex（`bg-[#5557e4]`）を書かない。** 必ずトークン名を使う
- **クラス名を動的生成しない**（Tailwind が静的スキャンで拾えない）。
  ツール色は下のとおり CSS 変数側で切り替わるので、組み立てる必要はない
- **ダークモードは使わない**（`dark:` を書かない）

#### 色は3層。`primary` はただ1つしかない

| 層 | トークン | 使いどころ |
|---|---|---|
| primitive | `--color-purple-50` / `--color-red-50` 等 | 色の実体。クラスとして直接書かない |
| semantic | `brand` / `danger` | ツールに依存しない固定の役割 |
| contextual | `primary` / `primary-soft` | 「今いる面の主役色」 |

どれを使うかは「**この画面はツールの中か、外か**」の一問で決まる。

| 場面 | 使うもの |
|---|---|
| ツールの中（ボタン・進行・選択状態） | `bg-primary` / `bg-primary-soft` |
| どのツールでもない面（ホームのヘッダー・BottomNav） | `bg-brand` |
| ツールに関係なく意味が固定のもの（エラー・必須マーク） | `text-danger` |

ツール色は `data-tool` が付いた要素の配下で `--color-primary` が差し替わる
（実体は `app.css` の `[data-tool='...']`）。したがって
**共通コンポーネントはツール色を props で受け取らない。** `bg-primary` と書くだけでよい。

`data-tool` は `frontend/app/lib/toolScope.ts` の `toolScope()` で付ける（手書きしない）。
置く場所は**各ツールの layout に1回だけ**。例外は2つ。

- ホーム / 作成履歴: 1画面に複数ツールが並ぶので、カード・行の単位で開く
- `routes/entry-sheet/result.tsx`: routes.ts 上 layout の**外**にあるため画面側で開く

⚠ 付け忘れても既定の `brand` 色で描画されるだけでエラーにならない。新しいツール画面を
足すときは layout でスコープを開いたか確認すること。

### 9. ステップ定義とコンポーネントの循環参照に注意

`constants/steps.ts` はステップコンポーネントを import する。
コンポーネント側からステップ ID を参照したいときは `constants/stepIds.ts` を使う。

### 10. 生成はブラウザ内LLM（`features/LocalLlm/`）

- 実行エンジンは2つ（`runtimes/`）。モデルごとに `constants.ts` の `runtime` で選ぶ
  - `webllm`: `@mlc-ai/web-llm`（MLC 形式）を Web Worker で動かす。Qwen3.5 系
  - `wllama`: `@wllama/wllama`（llama.cpp の WASM 版、GGUF）。WebLLM 用ビルドが無い LFM2.5 用。
    パッケージの `main` が実在しないので `@wllama/wllama/esm/index.js` を直接 import する
  - どちらも生成を始めるまで読み込まない。同時に読み込むモデルは1つで、エンジンをまたぐ切り替えでは
    先に unload する（`engine.ts`）
- モデルは `constants.ts` の `LLM_MODELS`。既定は LFM2.5 1.2B JP、画面で切り替えられ、選択は localStorage
  - LFM2.5 1.2B JP は速く自己PRは安定するが、志望動機・ES では同じ句の繰り返しや見出しの挿入で
    崩れやすい（2026-10 の実測）。安定を取るなら Qwen3.5 4B（生成10秒強・初回2.4GB）
  - 記入済みの出力例をプロンプトに入れると、LFM は例を丸写しして繰り返す。入れない
  - ES の解説の「書き方の例」は書き写されることがあるので、例と同じ文の項目はパース時に捨てている
- **WebGPU が無ければ非対応と表示して止める。** テンプレート生成器には落とさない
  （データ層と同じく、どちらで動いたか分からなくなるフォールバックは作らない）
- 1回の生成 = `LlmTask`（プロンプト + 出力を保存形にする `finalize`）。ツールごとに
  `features/<Tool>/prompt(s).ts` に置き、`LlmGenerationPanel` が5状態（読み込み・生成中・
  再生成した案の比較・失敗・確定）を描く
- 生成結果は create / review リクエストの optional な `generated` に載せて保存する。
  `generated` が無いときだけ `api-schema/src/generators/` の決定論的生成器を使う（テストと API 直叩き用）
- **Qwen3 系は `extra_body.enable_thinking: false` が必須。** 付けないと思考が混ざる
- **JSON モード（`response_format`）は使わない。** 思考を止める指定と文法制約がぶつかり、
  `<think>` だけ、または空白だけが延々と返る。構造化したいもの（ES の解説）は
  「見出し: …」の行形式で書かせてパースする
- サンプリングはモデルごと（`sampling`）。Qwen は 0.7 / top_p 0.8、LFM は 0.3（推奨の 0.1 だと再生成しても同じ文）
- dev では `optimizeDeps.include` に web-llm と wllama を入れてある。外すと初回の生成で依存の最適化が走り、
  ページごと再読み込みされる

## ディレクトリ規約

| 置き場所 | 何を置くか |
|---|---|
| `frontend/app/routes/` | ルートモジュールのみ。薄く保つ |
| `frontend/app/components/<PascalCase>/index.tsx` | 3ツールで使い回す汎用UI |
| `frontend/app/data/` | データアクセス層。差し替え境界 |
| `frontend/app/hooks/` | `useAsyncData` / `useAsyncAction` |
| `frontend/app/features/ToolWizard/` | **3ツール共通**のウィザード機構。ツール固有の型を持ち込まない |
| `frontend/app/features/<PascalCase>/` | ツール固有の components / constants / hooks |
| `frontend/app/types/` | `@fun/api-schema` の再エクスポート + FE 専用型 |
| `backend/src/api/<domain>/` | `*.route.ts` / `*.presenter.ts` / `usecases/*.usecase.ts` |
| `backend/src/shared/` | prisma / errors / validate / middleware |
| `backend/prisma/schema/` | 1モデル1ファイル |
| `api-schema/src/api/` | 1 feature 1ファイル |
| `api-schema/src/generators/` | 決定論的生成器（`generated` が無いときだけ使う） |
| `frontend/app/features/LocalLlm/` | ブラウザ内LLM（エンジン・状態機械・生成画面）。ツール非依存 |

**共通コンポーネントにツール名をハードコードしない。** 色も props で渡さない
（`bg-primary` と書けば、居るツールの色になる。§8 を参照）。

backend は 1 API = 1 usecase ファイル。就活BOX の `*.module.ts` / `validators/` /
repository 層は持ち込まない（3ドメインの規模に対して過剰なため）。

## 認証・ユーザー識別

認証は無い。初回に `crypto.randomUUID()` で発行した匿名IDを localStorage に持ち、
`X-Anonymous-Id` ヘッダで送る。サーバーは `/api/*` のミドルウェアで `users` を upsert する。

**サーバー発行にしない**のは、オフラインモードでも端末IDが確定している必要があるため。
全クエリに `user_id` を AND すること（`findUnique({ where: { id } })` を使わない）。
各ドメインに「別ユーザーの id を渡すと 404」テストがある。

## コードスタイル / テスト

Biome（`biome.jsonc`）に従う。shukatsu-box と同じ設定。

- **シングルクォート**（JSX も）、スペース2つ
- import の自動整列、未使用 import はエラー
- Tailwind クラスの並べ替え（`useSortedClasses`）は nursery のため一旦 off

テストは Vitest。

| パッケージ | 環境 | 対象 |
|---|---|---|
| `api-schema` | node | 生成器の決定性・入力の反映・段落数・文字数上限 |
| `frontend` | jsdom | 契約テスト（両実装）・localStorage ストア・`fetchJson`・フック2本 |
| `backend` | node + 実SQLite | 所有権分離・Json 往復・検証エラー |

`@testing-library/react` は**フックのテスト専用**。
ルート／コンポーネントのテストは書かない（MemoryRouter と framer-motion のモックが要り、
まだ流動的なマークアップを検証することになるため）。

React Query は入れていない。1画面1取得でキャッシュすべきものが無いため。
**入れる判断のトリガー**: 他ルートのリスト無効化が要る / 削除・一括削除を入れる /
ポーリングが要る、のいずれか。`useAsyncData` の返り値名は `useQuery` に揃えてある。

## アイコン

`lucide-react` を使う。SVG を手書きしない。24px が基本（チップやバッジは 12〜14px）。

## 今スコープ外のもの

サーバー側の LLM 呼び出し（生成はブラウザ内LLMのみ）、画像の S3 アップロード・実 OCR、
ES フォームの下書き保存、`inflow_source` の実送信、削除・一括削除、デプロイ。

コンテナ化するときは `node:24-alpine` を使わないこと（`better-sqlite3` に musl の
prebuilt が無く node-gyp ビルドになる）。`node:24-slim` なら prebuilt が落ちてくる。

## 参考実装の所在

- 自己PR: `../shukatsu-box/frontend/app/src/features/SelfPromotion/`
- ステップ遷移: `../shukatsu-box/frontend/app/src/features/Motivation/hooks/useStepNavigation.ts`
- デザイントークン: `../shukatsu-box/frontend/tailwind.config.ts`
- API型: `../shukatsu-box/api-schema/src/api/self-promotion/self-promotion.ts`
- エラー形とfetchラッパ: `../shukatsu-box/frontend/app/src/apis/box/`
