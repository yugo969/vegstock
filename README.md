# vegstock - 冷凍野菜ストック管理アプリ

![login screenshot] (images/login_screenshot.png)

## 概要

`vegstock` は、AI アシスタントを活用した冷凍野菜のストック管理アプリです。Supabase のリアルタイム同期機能により、常に最新の在庫状況を把握でき、AI チャットで自然言語での在庫管理や分析が可能です。

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui
- **グラフ**: Chart.js + react-chartjs-2
- **状態同期**: Supabase Realtime
- **バックエンド/DB**: Supabase (Postgres, Auth, RLS)
- **AI**: Google Gemini API (Function Calling 相当)
- **デプロイ**: Vercel
- **テスト**: Vitest (Unit), Playwright (E2E)
- **CI/CD**: GitHub Actions

## 機能一覧

現在の主な機能は以下の通りです。

- **ユーザー認証**: メールアドレスとパスワードによるサインアップ/ログイン
- **在庫管理**:
  - 在庫の追加、編集、削除（CRUD 操作）
  - 残日数、必要袋数、不足袋数の自動計算
  - 検索、ソート、フィルタリング機能
  - 統一されたカードレイアウトでの在庫表示
- **ダッシュボード**:
  - 在庫一覧表示
  - 在庫状況のグラフ表示 (Chart.js による残日数・不足袋数の可視化)
- **AI チャット**:
  - Google Gemini API 連携による自然言語での在庫操作
  - 在庫分析機能
  - 買い物リスト生成機能
- **UI/UX**:
  - レスポンシブデザイン (モバイル、タブレット、PC に対応)
  - ダークテーマとネオンアクセント
  - WCAG AA 準拠のアクセシビリティ
  - 簡易 Basic 認証 (ON/OFF 切り替え可能)

## DB スキーマ

### `stocks` テーブル

| 列                | 型                          | 説明                             |
| ----------------- | --------------------------- | -------------------------------- |
| `id`              | `uuid` (PK)                 | 自動生成                         |
| `user_id`         | `uuid` FK → `auth.users.id` | 所有者                           |
| `team_id`         | `uuid NULL`                 | 共有グループ（将来拡張用）       |
| `name`            | `text`                      | 野菜名                           |
| `total_weight_g`  | `numeric`                   | 1 袋の重量 (g)                   |
| `daily_usage_g`   | `numeric`                   | 1 日使用量 (g)                   |
| `stock_count_bag` | `numeric`                   | 現在の袋数（小数可）             |
| `created_at`      | `timestamp`                 | デフォルト `now()`               |
| `updated_at`      | `timestamp`                 | トリガーで自動更新               |
| `threshold_days`  | `integer NULL`              | 残日数アラート閾値（将来通知用） |

**RLS (Row Level Security)**:
ユーザーは自身が所有する `stocks` のみを読み書きできます。

```sql
alter table stocks enable row level security;
create policy "user can read own" on stocks
  for select using (user_id = auth.uid());
create policy "user can write own" on stocks
  for insert with check (user_id = auth.uid())
  for update using (user_id = auth.uid())
  for delete using (user_id = auth.uid());
```

## セットアップとローカル実行

### 前提条件

- Node.js (v18 以降推奨)
- npm または Yarn
- Git
- Supabase CLI (ローカル開発の場合)

### 環境変数

プロジェクトのルートに `.env.local` ファイルを作成し、以下の環境変数を設定してください。

```
NEXT_PUBLIC_SUPABASE_URL=あなたのSupabaseプロジェクトURL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabase Anon Key
SUPABASE_SERVICE_ROLE_KEY=あなたのSupabase Service Role Key (RLSバイパス用、本番環境では注意)
GEMINI_API_KEY=あなたのGoogle Gemini API Key
BASIC_AUTH_USER=デモ環境用Basic認証ユーザー名 (任意)
BASIC_AUTH_PASS=デモ環境用Basic認証パスワード (任意)
```

`.env.example` ファイルはプロジェクトのルートに配置されています。

### Supabase プロジェクトのセットアップ

1.  **Supabase プロジェクトの作成**: [Supabase](https://supabase.com/) にアクセスし、新しいプロジェクトを作成します。
2.  **データベーススキーマの適用**:
    - Supabase ダッシュボードの SQL Editor から、[supabase/migrations/001_create_stocks_table.sql](supabase/migrations/001_create_stocks_table.sql) の内容を実行し、`stocks`テーブルと RLS、トリガーを作成します。
3.  **API Keys の取得**: プロジェクト設定から`NEXT_PUBLIC_SUPABASE_URL`と`NEXT_PUBLIC_SUPABASE_ANON_KEY`を取得し、`.env.local`に設定します。`SUPABASE_SERVICE_ROLE_KEY`も必要に応じて取得してください。

### ローカルでの実行

1.  リポジトリをクローンします。
    ```bash
    git clone https://github.com/your-username/vegstock.git
    cd vegstock
    ```
2.  依存関係をインストールします。
    ```bash
    npm install
    # または yarn install / pnpm install / bun install
    ```
3.  開発サーバーを起動します。
    ```bash
    npm run dev --turbopack
    # または yarn dev / pnpm dev / bun dev
    ```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスしてください。

## 開発

### スクリプト

`package.json` に定義されているスクリプトです。

- `npm run dev`: 開発サーバーを起動
- `npm run build`: プロダクションビルドを作成
- `npm run start`: プロダクションビルドを起動
- `npm run lint`: コードのリンティング
- `npm test`: Vitest による単体テストを実行
- `npm run test:e2e`: Playwright による E2E テストを実行

### ブランチとコミットの命名規則

このプロジェクトでは、以下の規約に従っています。

- **ブランチ名**: `{prefix}/{brief-description}` (例: `feat/ai-chat`, `fix/login-bug`)
- **コミットメッセージ**: `{type}: {概要}` (例: `feat: AIチャット機能実装`, `fix: グラフ表示エラー修正`)

### 推奨開発順序 (AI 機能開発向け)

ユーティリティ関数や AI インテント層は、機能とテストを並行して実装することが推奨されます。UI 層は初期実装後に E2E テストを追加してください。

## デプロイ

このプロジェクトは Vercel へのデプロイを前提としています。

1.  GitHub リポジトリを Vercel にインポートします。
2.  環境変数を Vercel プロジェクト設定に追加します。
3.  自動デプロイが設定されていれば、コミットや PR マージ時に Vercel にデプロイされます。

## テスト

- **単体テスト**: `vitest` を使用して、計算ユーティリティ関数などをテストしています。
- **E2E テスト**: `Playwright` (Chromium) を使用して、ログインフロー、在庫の CRUD 操作、AI チャット操作などのエンドツーエンドテストをカバーします。

## AI 機能 (Google Gemini API)

AI チャット機能は、Google Gemini API の Function Calling 相当の機能を利用しています。

- ユーザーの入力（例：「ブロッコリーを 5 袋買った」）を解釈し、対応する在庫操作（`INSERT`または`UPDATE`）を提案します。
- 曖昧な入力に対しては、追加の質問で確認を促します。
- 在庫分析や買い物リストの生成も可能です。

## 貢献

バグ報告、機能リクエスト、コードの改善など、あらゆる貢献を歓迎します！
貢献の前に、ぜひ [CONTRIBUTING.md](CONTRIBUTING.md) をお読みください。

## ライセンス

このプロジェクトは [MIT License](LICENSE)の下で公開されています。

---
