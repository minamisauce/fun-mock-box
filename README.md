# fun-mock-box

就活BOXの「自己PR作成」「志望動機作成」「ES作成・添削」ツールの**プロトタイプ**。

UI とフローを素早く試すためのモックで、**バックエンドを起動しなくても単体で動く**のが設計の中心要件。
`pnpm dev:frontend` だけで全機能を触れる。

> 本番実装は `../shukatsu-box`。型・ステップ定義・デザイントークンの出典はそちら。

## 何のためのリポジトリか

| | |
| --- | --- |
| **対象** | 就活BOX の画面設計を検討するデザイナー・フロントエンドエンジニア |
| **解決すること** | 「DB を立てて、API を繋いで、ようやく画面が見られる」までの待ち時間をゼロにする |
| **やらないこと** | 実際の LLM 呼び出し、認証、デプロイ（[スコープ外](#スコープ外) を参照） |

AI 生成は入っていない。`api-schema/src/generators/` の決定論的なテンプレートが LLM の代わりに
文章を組み立てる（**同じ入力なら常に同じ結果**）。差し替え境界をここ1箇所に閉じてあるので、
実 API に繋ぐときはこのディレクトリだけを置き換えればよい。

## 主要機能

- **4つの入口** — 自己PR作成 / 志望動機作成 / ES作成 / ES添削。ホームから直接それぞれの流れに入る
- **1問1答のウィザード** — 全ツール共通の機構（`features/ToolWizard/`）。進捗バー、記入候補チップ、
  直リンク・ブラウザバックのガード、sessionStorage への下書き保存
- **ES画像からの一括入力** — 画像から設問・企業名・本文を抽出し、確認・修正してそのまま実行できる
- **作成履歴** — 3ツールの結果を横断して新しい順に表示。ES は作成／添削を区別する
- **結果の編集** — タイトル・本文をその場で更新、ワンタップでコピー。未保存のまま離れようとすると確認が出る
- **生成AIへの同意** — 送信前に注意事項への同意を取る（全ツール共通の `ConsentNotice`）
- **オフライン動作** — `VITE_API_URL` が無ければ localStorage だけで完結する

## 技術スタック

| パッケージ | 中身 |
| --- | --- |
| `frontend/` | React Router v8（SPA・`ssr: false`） / Vite / TypeScript / Tailwind CSS v4 / framer-motion / lucide-react |
| `backend/` | Hono / Prisma 7 / SQLite（better-sqlite3 adapter） / Zod |
| `api-schema/` | Zod スキーマ・型・決定論的な生成器（FE/BE 共有） |

共通: pnpm workspace / Biome / Vitest

依存の向きは `api-schema → frontend / backend`。frontend と backend は互いに依存しない。

Tailwind は v4 の CSS-first 構成で、`tailwind.config.ts` は存在しない。トークンは
`frontend/app/app.css` の `@theme` に集約している。ツール色は `data-tool` のスコープで
`--color-primary` が差し替わるため、共通コンポーネントは色を props で受け取らず `bg-primary` と書くだけでよい。

## 必須要件

- **Node.js 24.15.0 以上**（`.node-version` に固定。`mise` を使っていれば自動で切り替わる）
- **pnpm 10.33.2**（npm / yarn は使わない）

Docker は不要。DB はファイル1つの SQLite。

> React Router v8 は Node > 22.22.0 が必須。グローバルの Node が古いと `pnpm dev` が起動時に弾かれるので、
> その場合は `mise exec -- pnpm ...` の形で実行する。

## インストール

```bash
git clone https://github.com/minamisauce/fun-mock-box.git
cd fun-mock-box

pnpm install                        # postinstall で prisma generate まで走る
```

バックエンドに繋ぐ場合のみ、DB の初期化が要る。

```bash
pnpm -F @fun/backend db:migrate            # backend/prisma/dev.db が作られる
pnpm -F @fun/backend exec prisma db seed   # 任意。動作確認用のデータが入る
```

## 起動

### オフラインモード（既定）

データは localStorage に入る。バックエンドも DB も要らない。

```bash
pnpm dev:frontend   # http://localhost:5173
```

### バックエンド接続モード

```bash
cp frontend/.env.example frontend/.env.local   # VITE_API_URL=/api
pnpm dev                                        # FE:5173 + BE:3334
```

切り替えは `VITE_API_URL` の**有無だけ**。`/api` は Vite の dev プロキシ経由で
`http://localhost:3334` に転送されるので、開発中は CORS 設定が要らない。

ポートが 3334 なのは、就活BOX の NestJS が 3333 を使うため（同時に起動できる）。

> **モード間でデータは移行しない。** オフラインで作ったものは接続モードでは見えない。

## ディレクトリ構成

```text
├── frontend/
│   └── app/
│       ├── components/   # 3ツールで使い回す汎用UI（Button, Tabs, ProgressBar …）
│       ├── features/
│       │   ├── ToolWizard/     # 3ツール共通のウィザード機構
│       │   ├── SelfPromotion/  # ツール固有の steps / components / hooks
│       │   ├── Motivation/
│       │   ├── EntrySheet/
│       │   └── CreationHistory/# 3ツール横断の作成履歴
│       ├── data/         # データアクセス層（localStorage 実装と HTTP 実装の差し替え境界）
│       ├── routes/       # ルートモジュール。薄く保つ
│       ├── hooks/        # useAsyncData / useAsyncAction
│       ├── lib/          # paths, storage, toolScope など
│       └── app.css       # デザイントークン（@theme）
├── backend/
│   ├── prisma/schema/    # 1モデル1ファイル
│   └── src/
│       ├── api/<domain>/ # *.route.ts / *.presenter.ts / usecases/*.usecase.ts
│       └── shared/       # prisma / errors / validate / middleware
└── api-schema/
    └── src/
        ├── api/          # 1 feature 1ファイル
        └── generators/   # LLM の代わりの決定論的な生成器
```

ルートは**ファイルを置いても認識されない**。`frontend/app/routes.ts` の配列に登録する
（`remix-flat-routes` は未導入）。

## 検証

```bash
pnpm format      # biome（ルート1本で3パッケージを見る）
pnpm typecheck   # 3パッケージ
pnpm test        # 3パッケージ
pnpm build
```

CI（`.github/workflows/check.yml`）はこれらに加えて、環境変数あり／なしの2通りのビルドを回している
（フロント単体で構成が壊れていないことの担保）。1つ落ちても残りは実行される。

| パッケージ | テスト環境 | 主な対象 |
| --- | --- | --- |
| `api-schema` | node | 生成器の決定性・文字数上限 |
| `frontend` | jsdom | 契約テスト（localStorage / HTTP の両実装）・ストア・フック |
| `backend` | node + 実SQLite | 所有権分離・Json 往復・検証エラー |

## 認証

認証は無い。初回に `crypto.randomUUID()` で発行した匿名IDを localStorage に持ち、
`X-Anonymous-Id` ヘッダで送る。サーバーは `/api/*` のミドルウェアで `users` を upsert する。

サーバー発行にしないのは、オフラインモードでも端末IDが確定している必要があるため。

## スコープ外

LLM 呼び出し、画像の S3 アップロード、`inflow_source` の実送信、削除・一括削除、デプロイ。

## ドキュメント

設計判断・ハマりどころ・ディレクトリ規約は [CLAUDE.md](./CLAUDE.md) にまとめてある。
実装前に一読することを勧める。
