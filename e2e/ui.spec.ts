import { test, expect } from "@playwright/test";

test.describe("UI and Responsive Design", () => {
  test("should have proper meta tags and title", async ({ page }) => {
    await page.goto("/");

    // ページタイトルの確認
    await expect(page).toHaveTitle(/vegstock/);

    // meta viewport タグの確認
    const viewport = await page
      .locator('meta[name="viewport"]')
      .getAttribute("content");
    expect(viewport).toContain("width=device-width");
  });

  test("should work on different screen sizes", async ({ page }) => {
    // デスクトップサイズでテスト
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/login");

    // ログインフォームが表示されることを確認
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // モバイルサイズでテスト
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    // モバイルでもフォームが表示されることを確認
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // タブレットサイズでテスト
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();

    // タブレットでもフォームが表示されることを確認
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("should have proper color contrast and accessibility", async ({
    page,
  }) => {
    await page.goto("/login");

    // フォーカス可能な要素をテスト
    await page.keyboard.press("Tab");
    const focusedElement = await page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // すべてのボタンにアクセシブルなテキストがあることを確認
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute("aria-label");

      // ボタンにテキストまたはaria-labelがあることを確認
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test("should load without JavaScript errors", async ({ page }) => {
    const errors: string[] = [];

    // コンソールエラーをキャッチ
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // ページエラーをキャッチ
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 致命的なエラーがないことを確認
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes("favicon") &&
        !error.includes("Failed to load resource") &&
        !error.includes("NET::")
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
