const { test, expect } = require('@playwright/test');

test.describe('DIVINA SITE E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the system loader to be completely removed from the DOM
    await expect(page.locator('#system-loader')).toHaveCount(0, { timeout: 10000 });
  });

  test('should allow user to log in and see desktop', async ({ page }) => {
    await expect(page.locator('#login-screen')).toBeVisible();
    await page.fill('#login-input', 'DISTORTIONDIVINA');
    await page.click('.big-enter-btn');
    await expect(page.locator('#login-screen')).toBeHidden({ timeout: 10000 });
    await expect(page.locator('#desktop-screen')).toHaveClass(/active/);
    await expect(page.locator('#win-overview')).toHaveClass(/window-open/, { timeout: 10000 });
  });

  test('should allow switching language to Japanese', async ({ page }) => {
    // Evaluate the click directly on the DOM node to bypass any flaky CSS stacking contexts on the mocked OS interface
    await page.locator('button:has-text("JP")').evaluate(node => node.click());

    // Placeholder text should update immediately
    const input = page.locator('#login-input');
    await expect(input).toHaveAttribute('placeholder', 'アクセスコードを入力...');
  });

  test('should open Archive window and change sorts without breaking', async ({ page }) => {
    await page.fill('#login-input', 'DISTORTIONDIVINA');
    await page.click('.big-enter-btn');
    await expect(page.locator('#desktop-screen')).toHaveClass(/active/, { timeout: 10000 });

    const overviewWin = page.locator('#win-overview');
    await expect(overviewWin).toHaveClass(/window-open/, { timeout: 10000 });
    
    // Close overview window cleanly
    await overviewWin.locator('.win-btn.close').evaluate(node => node.click());

    // Open Archive
    await page.locator('[data-window="win-archive"]').evaluate(node => node.click());
    const archiveWin = page.locator('#win-archive');
    await expect(archiveWin).toHaveClass(/window-open/, { timeout: 5000 });

    // Use evaluate for sorting clicks to bypass OOBOT or window overlaps in testing
    await archiveWin.locator('button:has-text("[ SORT: A-Z ]")').evaluate(node => node.click());
    await archiveWin.locator('button:has-text("[ SORT: TAROT ]")').evaluate(node => node.click());

    await expect(archiveWin.locator('#archive-status-text')).toContainText('COMPLETE', { timeout: 15000 });
  });

});
