# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.js >> DIVINA SITE E2E Tests >> should allow switching language to Japanese
- Location: tests\e2e.spec.js:21:3

# Error details

```
Error: expect(locator).not.toHaveAttribute(expected) failed

Locator:  locator('#login-input')
Expected: not "ENTER_ACCESS_CODE..."
Received: "ENTER_ACCESS_CODE..."
Timeout:  5000ms

Call log:
  - Expect "not toHaveAttribute" with timeout 5000ms
  - waiting for locator('#login-input')
    14 × locator resolved to <input type="text" id="login-input" autocomplete="off" spellcheck="false" class="login-input" aria-label="Access Code Input" placeholder="ENTER_ACCESS_CODE..."/>
       - unexpected value "ENTER_ACCESS_CODE..."

```

```yaml
- textbox "Access Code Input":
  - /placeholder: ENTER_ACCESS_CODE...
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('DIVINA SITE E2E Tests', () => {
  4  | 
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await page.goto(`file://${process.cwd()}/index.html`);
  7  |   });
  8  | 
  9  |   test('should allow user to log in and see desktop', async ({ page }) => {
  10 |     const loginInput = page.locator('#login-input');
  11 |     await expect(loginInput).toBeVisible();
  12 |     await loginInput.fill('DISTORTIONDIVINA');
  13 |     
  14 |     // V4 uses data-action="login"
  15 |     await page.locator('button[data-action="login"]').click();
  16 |     
  17 |     // V4 uses #desktop-screen instead of #desktop
  18 |     await expect(page.locator('#desktop-screen')).toBeVisible({ timeout: 15000 });
  19 |   });
  20 | 
  21 |   test('should allow switching language to Japanese', async ({ page }) => {
  22 |     // V4 structure uses data-lang
  23 |     await page.locator('button[data-lang="ja"]').first().evaluate(node => node.click());
  24 | 
  25 |     // Expect placeholder to not be the default english
  26 |     const input = page.locator('#login-input');
> 27 |     await expect(input).not.toHaveAttribute('placeholder', 'ENTER_ACCESS_CODE...');
     |                             ^ Error: expect(locator).not.toHaveAttribute(expected) failed
  28 |   });
  29 | 
  30 |   test('should open Archive window and change sorts without breaking', async ({ page }) => {
  31 |     // 1. Bypass login
  32 |     await page.locator('#login-input').fill('DISTORTIONDIVINA');
  33 |     await page.locator('button[data-action="login"]').click();
  34 |     await expect(page.locator('#desktop-screen')).toBeVisible({ timeout: 15000 });
  35 | 
  36 |     // 2. Open Archive via data-window
  37 |     await page.locator('.desktop-icon[data-window="win-archive"]').click();
  38 |     const archiveWin = page.locator('#win-archive');
  39 |     await expect(archiveWin).toBeVisible();
  40 | 
  41 |     // 3. Wait for Archive loader to finish (V4 structure check)
  42 |     await expect(archiveWin.locator('span[data-i18n="archive_status"]')).toContainText('COMPLETE', { timeout: 15000 });
  43 | 
  44 |     // 4. Click Sort: Tarot
  45 |     await archiveWin.locator('button[data-sort="id"]').evaluate(node => node.click());
  46 | 
  47 |     // 5. Ensure it didn't crash
  48 |     await expect(archiveWin.locator('span[data-i18n="archive_status"]')).toContainText('COMPLETE', { timeout: 15000 });
  49 |   });
  50 | 
  51 | });
  52 | 
```