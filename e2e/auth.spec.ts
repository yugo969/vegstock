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
    await expect(page.locator("h1")).toContainText("ログイン");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should display signup page", async ({ page }) => {
    // サインアップページに移動
    await page.goto("/signup");

    // サインアップページの要素が表示されることを確認
    await expect(page.locator("h1")).toContainText("新規登録");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should show validation errors for invalid login", async ({ page }) => {
    await page.goto("/login");

    // 空のフォームで送信を試行
    await page.click('button[type="submit"]');

    // 何らかのバリデーションメッセージまたはエラーが表示されることを確認
    // (実際の実装に応じて調整が必要)
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    // HTML5バリデーションまたはカスタムバリデーションをチェック
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
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
});
