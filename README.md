# fun-mock-box

就活BOXの「自己PR作成」「志望動機作成」「ES作成・添削」ツールのプロトタイプ。

pnpm workspace の3パッケージ構成で、**バックエンドを起動しなくても動く**のが特徴。

```text
frontend/    React Router v8 の SPA（ssr: false）
backend/     Hono + Prisma + SQLite の JSON API
api-schema/  Zod スキーマ・型・決定論的な生成器（FE/BE 共有）
```

AI 生成は入っていない。`api-schema/src/generators/` の決定論的なテンプレートが
LLM の代わりに文章を組み立てる（同じ入力なら常に同じ結果）。

## セットアップ

Node は `.node-version`（24.15.0）。`mise` を使っている場合は自動で切り替わる。

```bash
pnpm install                        # postinstall で prisma generate まで走る
pnpm -F @fun/backend db:migrate     # 初回のみ。backend/prisma/dev.db が作られる
pnpm -F @fun/backend exec prisma db seed   # 任意。動作確認用のデータが入る
```

## 起動

### オフラインモード（既定）

データは localStorage に入る。バックエンドも DB も不要。

```bash
pnpm dev:frontend   # http://localhost:5173
```

### バックエンド接続モード

```bash
cp frontend/.env.example frontend/.env.local   # VITE_API_URL=/api
pnpm dev                                        # FE:5173 + BE:3334
```

`VITE_API_URL` の有無だけで切り替わる。`/api` は Vite の dev プロキシ経由で
`http://localhost:3334` に転送されるので、開発中は CORS 設定が要らない。

ポートが 3334 なのは、就活BOX の NestJS が 3333 を使うため（同時に起動できる）。

> モード間でデータは移行しない。オフラインで作ったものは接続モードでは見えない。

## 検証

```bash
pnpm format      # biome
pnpm typecheck   # 3パッケージ
pnpm test        # 3パッケージ
pnpm build
```

CI（`.github/workflows/check.yml`）はこれらに加えて、環境変数あり／なしの
2通りのビルドを回している（フロントのみ構成が壊れていないことの担保）。

## ドキュメント

設計判断・ハマりどころ・ディレクトリ規約は [CLAUDE.md](./CLAUDE.md) にまとめてある。
