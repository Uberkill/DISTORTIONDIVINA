const { test, expect } = require('@playwright/test');

test.describe('DIVINA SITE E2E Tests', () => {

  test('should allow user to log in and see desktop', async ({ page }) => {
    await page.goto('/');
    
    // 1. Enter the access code
    await page.locator('#login-input').fill('DISTORTIONDIVINA');
    await page.locator('button[data-action="login"]').click();
    
    // 2. Wait for the login screen to vanish and desktop to activate
    const desktop = page.locator('#desktop-screen');
    await expect(desktop).toBeVisible({ timeout: 15000 });
  });

  test('should allow switching language to Japanese', async ({ page }) => {
    await page.goto('/');
    
    // 1. Click language toggle
    await page.locator('button[data-action="set-language"][data-lang="ja"]').click();
    
    // Expect placeholder to not be the default english
    const input = page.locator('#login-input');
    await expect(input).not.toHaveAttribute('placeholder', 'ENTER_ACCESS_CODE...');
  });

  test('should open Archive window and have cards', async ({ page }) => {
    await page.goto('/');
    
    // 1. Enter the access code
    await page.locator('#login-input').fill('DISTORTIONDIVINA');
    await page.locator('button[data-action="login"]').click();
    
    // 2. Open Archive via data-window
    await page.locator('.desktop-icon[data-window="win-archive"]').click();
    
    // 3. Verify window is visible
    const archiveWin = page.locator('#win-archive');
    await expect(archiveWin).toBeVisible();

    // 4. Verify cards are rendered
    const cards = page.locator('.card-file');
    await expect(cards).toHaveCount(22, { timeout: 10000 }); // Should render all cards
  });
  
  test('should open Divination window and render slots', async ({ page }) => {
    await page.goto('/');
    
    // 1. Enter the access code
    await page.locator('#login-input').fill('DISTORTIONDIVINA');
    await page.locator('button[data-action="login"]').click();
    
    // 2. Open Divination
    await page.locator('.desktop-icon[data-window="win-divination"]').click();
    
    // 3. Verify slots are rendered
    const slots = page.locator('.divination-slot');
    await expect(slots).toHaveCount(5, { timeout: 10000 });
  });

});
