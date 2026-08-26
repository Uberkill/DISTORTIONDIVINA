const { test, expect } = require('@playwright/test');

test.describe('DIVINA SITE E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test('should allow user to log in and see desktop', async ({ page }) => {
    const loginInput = page.locator('#login-input');
    await expect(loginInput).toBeVisible();
    await loginInput.fill('DISTORTIONDIVINA');
    
    // V4 uses data-action="login"
    await page.locator('button[data-action="login"]').click();
    
    // V4 uses #desktop-screen instead of #desktop
    await expect(page.locator('#desktop-screen')).toBeVisible({ timeout: 15000 });
  });

  test('should allow switching language to Japanese', async ({ page }) => {
    // V4 structure uses data-lang
    await page.locator('button[data-lang="ja"]').first().evaluate(node => node.click());

    // Expect placeholder to not be the default english
    const input = page.locator('#login-input');
    await expect(input).not.toHaveAttribute('placeholder', 'ENTER_ACCESS_CODE...');
  });

  test('should open Archive window and change sorts without breaking', async ({ page }) => {
    // 1. Bypass login
    await page.locator('#login-input').fill('DISTORTIONDIVINA');
    await page.locator('button[data-action="login"]').click();
    await expect(page.locator('#desktop-screen')).toBeVisible({ timeout: 15000 });

    // 2. Open Archive via data-window
    await page.locator('.desktop-icon[data-window="win-archive"]').click();
    const archiveWin = page.locator('#win-archive');
    await expect(archiveWin).toBeVisible();

    // 3. Wait for Archive loader to finish (V4 structure check)
    await expect(archiveWin.locator('span[data-i18n="archive_status"]')).toContainText('COMPLETE', { timeout: 15000 });

    // 4. Click Sort: Tarot
    await archiveWin.locator('button[data-sort="id"]').evaluate(node => node.click());

    // 5. Ensure it didn't crash
    await expect(archiveWin.locator('span[data-i18n="archive_status"]')).toContainText('COMPLETE', { timeout: 15000 });
  });

});
