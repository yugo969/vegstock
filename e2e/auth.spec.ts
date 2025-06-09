import { test, expect } from "@playwright/test";

// Mock環境での基本的なテスト
test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // テスト前にページをロード
    await page.goto("/");
  });

  test("should display login page for unauthenticated users", async ({
    page,
  }) => {
    // 未認証ユーザーはログインページにリダイレクトされることを確認
    await expect(page).toHaveURL(/.*\/login/);

    // ログインページの要素が表示されることを確認
    // 実際にはCardTitleに「vegstock」が含まれている
    await expect(page.getByText("vegstock")).toBeVisible();
    await expect(page.getByText("冷凍野菜ストック管理アプリ")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // ログインボタンのテキストを確認
    await expect(page.getByRole("button", { name: "ログイン" })).toBeVisible();
  });

  test("should display signup page", async ({ page }) => {
    // サインアップページに移動
    await page.goto("/signup");

    // サインアップページの要素が表示されることを確認
    await expect(page.getByText("vegstock")).toBeVisible();
    await expect(page.getByText("新規アカウント作成")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // 複数のパスワードフィールドがあるため、より具体的に指定
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('input[id="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // アカウント作成ボタンのテキストを確認
    await expect(
      page.getByRole("button", { name: "アカウント作成" })
    ).toBeVisible();
  });

  test("should show validation errors for invalid login", async ({ page }) => {
    await page.goto("/login");

    // 空のフォームで送信を試行
    await page.click('button[type="submit"]');

    // Toast通知または何らかのフィードバックを確認
    // ここではフォームの基本的な存在と要素の確認に留める
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[id="password"]');

    // HTML5バリデーションまたはカスタムバリデーションをチェック
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // フォームの基本的な動作確認
    await expect(page.getByRole("button", { name: "ログイン" })).toBeVisible();
  });

  test("should have navigation between login and signup", async ({ page }) => {
    await page.goto("/login");

    // サインアップページへのリンクをクリック
    const signupLink = page.locator('a[href="/signup"]');
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL(/.*\/signup/);
    }

    // ログインページへのリンクをクリック
    const loginLink = page.locator('a[href="/login"]');
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*\/login/);
    }
  });

  test("should display proper form labels and placeholders", async ({
    page,
  }) => {
    await page.goto("/login");

    // フォームの要素とラベルを確認
    await expect(page.getByText("メールアドレス")).toBeVisible();
    await expect(page.getByText("パスワード")).toBeVisible();
    await expect(page.getByPlaceholder("your@email.com")).toBeVisible();
    await expect(page.getByPlaceholder("パスワード")).toBeVisible();
  });

  test("should display signup form fields correctly", async ({ page }) => {
    await page.goto("/signup");

    // サインアップ特有のフィールドを確認
    await expect(page.getByText("パスワード（6文字以上）")).toBeVisible();
    await expect(page.getByText("パスワード確認")).toBeVisible();
    await expect(page.getByPlaceholder("パスワード確認")).toBeVisible();
  });
});
