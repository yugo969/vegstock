# vegstock への貢献方法

`vegstock` プロジェクトへのご貢献に感謝いたします！
バグ報告、機能リクエスト、コードの改善など、どのような形での貢献も歓迎します。

このドキュメントは、貢献を開始するためのガイドラインを提供します。

## 貢献の前に

- このプロジェクトは `MIT License` の下で公開されています。貢献されたコードもこのライセンスに従うことに同意したものとみなされます。
- README.md を読み、プロジェクトの概要と機能を確認してください。
- 不明な点がある場合は、既存の Issue を検索するか、新しい Issue を作成してください。

## 開発環境のセットアップ

1.  **リポジトリをフォークし、クローンする**:
    ```bash
    git clone https://github.com/your-username/vegstock.git # your-usernameはあなたのGitHubユーザー名に置き換えてください
    cd vegstock
    ```
2.  **依存関係をインストールする**:
    ```bash
    npm install
    # または yarn install / pnpm install / bun install
    ```
3.  **環境変数を設定する**:
    プロジェクトのルートに `.env.local` ファイルを作成し、[.env.example](.env.example) に記載されている環境変数を設定してください。Supabase と Gemini API キーが必要です。
4.  **Supabase をセットアップする**:
    [README.md](README.md) の「Supabase プロジェクトのセットアップ」セクションを参照し、Supabase プロジェクトを作成し、スキーマを適用してください。
5.  **開発サーバーを起動する**:
    ```bash
    npm run dev --turbopack
    ```
    ブラウザで `http://localhost:3000` にアクセスしてください。

## 貢献の種類

### バグ報告

- バグを発見した場合は、新しい [GitHub Issue](https://github.com/your-username/vegstock/issues) を作成してください。
- Issue 作成時には、以下の情報を含めてください:
  - 問題の簡潔な説明
  - 再現手順（ステップバイステップ）
  - 期待される動作
  - 実際の動作
  - 使用しているブラウザ、OS、Node.js のバージョン
  - 可能であれば、スクリーンショットやエラーログ

### 機能リクエスト

- 新しい機能のアイデアがある場合は、新しい [GitHub Issue](https://github.com/your-username/vegstock/issues) を作成してください。
- なぜその機能が必要なのか、どのような問題が解決されるのかを明確に説明してください。

### コードの貢献 (プルリクエスト)

1.  **ブランチを作成する**:
    このプロジェクトでは、[セマンティックバージョニング](https://semver.org/lang/ja/) と [Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) の考え方に基づいた命名規則を推奨しています。

    - **ブランチ名**: `{type}/{brief-description}` (例: `feat/add-ai-chat`, `fix/chart-display-error`)
      推奨されるタイプ (`type`) には `feat` (新機能), `fix` (バグ修正), `docs` (ドキュメント), `style` (スタイル変更), `refactor` (リファクタリング), `test` (テスト), `chore` (その他), `perf` (パフォーマンス), `security` (セキュリティ) などがあります。

    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/your-feature-name
    ```

2.  **変更を実装する**:
    - 品質基準と実装チェックリストは、[プロジェクトの README](README.md) の「品質チェックリスト」セクションまたはプロジェクトのガイドラインに従ってください。
    - UI は、WCAG AA 準拠のアクセシビリティを保ち、ネオンテーマとレスポンシブデザインの既存のスタイルに合わせるようにしてください。
    - コードは TypeScript の型安全性を最大限活用し、ESLint の警告がないようにしてください。
3.  **テストを追加・実行する**:
    - 変更に対応する単体テスト (`vitest`) や E2E テスト (`Playwright`) を追加または更新してください。
    - すべてのテストがパスすることを確認してください。
    ```bash
    npm test
    npm run test:e2e
    ```
4.  **コミットする**:
    [セマンティックバージョニング](https://semver.org/lang/ja/) と [Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) に従い、意味のあるコミットメッセージを記述してください。

    - **コミットメッセージ**: `{type}: {概要}` (例: `feat: AIチャット機能実装`, `fix: グラフ表示エラー修正`)
      推奨されるタイプ (`type`) には `feat` (新機能), `fix` (バグ修正), `docs` (ドキュメント), `style` (スタイル変更), `refactor` (リファクタリング), `test` (テスト), `chore` (その他), `perf` (パフォーマンス), `security` (セキュリティ) などがあります。

    ```bash
    git add .
    git commit -m "feat: [簡潔な概要]

    [詳細な説明]
    - 変更点1
    - 変更点2
    "
    ```

    小さく頻繁にコミットすることを推奨します。

5.  **プッシュする**:
    ```bash
    git push origin feat/your-feature-name
    ```
6.  **プルリクエスト (PR) を作成する**:
    - GitHub であなたのフォークからメインリポジトリに対してプルリクエストを作成してください。
    - PR のタイトルと説明は、その変更内容を明確に伝えるものにしてください。関連する Issue があればリンクしてください。
    - CI/CD が自動的に実行され、テストがパスすることを確認してください。

## コードスタイル

- Prettier と ESLint が設定されています。コミット前に自動フォーマットとリンティングが実行されることを推奨します。
- 既存のコードベースのスタイルに合わせるようにしてください。

## 行動規範 (Code of Conduct)

このプロジェクトでは、コミュニティメンバーが互いに敬意を払い、協力的な環境を維持することを奨励しています。私たちは、多様性を尊重し、あらゆるハラスメントや差別を容認しません。

---

ご協力ありがとうございます！
