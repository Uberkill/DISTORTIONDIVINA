# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.js >> DIVINA SITE E2E Tests >> should open Archive window and change sorts without breaking
- Location: tests\e2e.spec.js:30:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.desktop-icon[data-window="win-archive"]')
    - locator resolved to <div tabindex="0" role="button" class="desktop-icon" data-window="win-archive" aria-label="Archive Database">…</div>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div id="login-screen">…</div> from <div id="app-container">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div id="login-screen">…</div> from <div id="app-container">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    50 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div id="login-screen">…</div> from <div id="app-container">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic:
      - button "Toggle Interface Size" [ref=e4] [cursor=pointer]: "[SIZE: NORMAL]"
      - button "Toggle View Mode" [ref=e5] [cursor=pointer]: "[UI_MODE_LOADING]"
    - generic [ref=e6]:
      - img "DISTORTION CORP LOGO" [ref=e7]
      - generic [ref=e8]: SECURE TERMINAL ACCESS // LEVEL 5 CLEARANCE
    - generic [ref=e9]:
      - generic [ref=e10]:
        - button "Select English" [ref=e11] [cursor=pointer]: EN
        - button "Select Korean" [ref=e12] [cursor=pointer]: 한국어
        - button "Select Japanese" [ref=e13] [cursor=pointer]: 日本語
      - paragraph [ref=e14]: SECURE ACCESS TERMINAL v9.4
      - paragraph [ref=e15]: ">> TERMINAL OPTIMIZED FOR DESKTOP DISPLAY"
      - generic [ref=e17]:
        - generic [ref=e18]: ">"
        - textbox "Access Code Input" [ref=e19]:
          - /placeholder: ENTER_ACCESS_CODE...
          - text: DISTORTIONDIVINA
      - button "Initialize Connection" [active] [ref=e20] [cursor=pointer]:
        - generic [ref=e21]: PRESS TO ENTER
      - generic [ref=e22]: VERIFYING CREDENTIALS...
      - text: "WARNING: UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE"
  - generic:
    - generic [ref=e23]:
      - generic [ref=e24]:
        - generic [ref=e25]: DISTORTION_OS // CONNECTED
        - button "Toggle Interface Size" [ref=e26] [cursor=pointer]: "[SIZE]"
        - button "Toggle View Mode" [ref=e27] [cursor=pointer]: "[UI_MODE]"
      - generic [ref=e28]:
        - button "[ RESET LAYOUT ]" [ref=e29] [cursor=pointer]
        - generic "System Clock" [ref=e30]: 00:00:00
    - generic:
      - button "Project Brief" [ref=e31] [cursor=pointer]:
        - generic [ref=e33]: PROJECT_BRIEF.LOG
      - button "Archive Database" [ref=e34] [cursor=pointer]:
        - generic [ref=e36]: "FIRST LIGHT: ARCHIVE_DB.EXE"
      - button "Employee Database" [ref=e37] [cursor=pointer]:
        - generic [ref=e39]: EMPLOYEE_DB.EXE
      - button "Event Log" [ref=e40] [cursor=pointer]:
        - generic [ref=e42]: EVENT_LOG.TXT
      - button "Communication" [ref=e43] [cursor=pointer]:
        - generic [ref=e45]: COMMUNICATION.EXE
      - button "System Settings" [ref=e46] [cursor=pointer]:
        - generic [ref=e48]: SYSTEM_SETTINGS.EXE
      - button "Interest Check" [ref=e49] [cursor=pointer]:
        - generic [ref=e51]: INTEREST_CHECK.EXE
      - button "Terms of Service" [ref=e52] [cursor=pointer]:
        - generic [ref=e54]: TERMS_OF_SERVICE.TXT
      - button "Divination Tool" [ref=e55] [cursor=pointer]:
        - generic [ref=e57]: "FIRST LIGHT: DIVINATION.EXE"
      - button "Open AI Assistant" [ref=e58] [cursor=pointer]:
        - generic [ref=e60]: ASSISTANT_AI.EXE
    - generic:
      - button "Permanently Close Assistant" [ref=e61] [cursor=pointer]
      - generic [ref=e62]:
        - text: Welcome, Agent. I am OOBOT. I can guide you through the archive.
        - generic [ref=e63]:
          - button "Next Step" [ref=e64] [cursor=pointer]: NEXT >
          - button "Dismiss Assistant" [ref=e65] [cursor=pointer]: DISMISS
    - generic [ref=e67]:
      - button "Show Desktop"
      - button "System Menu" [ref=e68] [cursor=pointer]:
        - generic [ref=e69]: SYSTEM
      - generic [ref=e76]:
        - generic [ref=e77]: PING
        - generic [ref=e78]: 34ms
  - text: "```"
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('DIVINA SITE E2E Tests', () => {
  4  | 
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await page.goto("/");
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
  27 |     await expect(input).not.toHaveAttribute('placeholder', 'ENTER_ACCESS_CODE...');
  28 |   });
  29 | 
  30 |   test('should open Archive window and change sorts without breaking', async ({ page }) => {
  31 |     // 1. Bypass login
  32 |     await page.locator('#login-input').fill('DISTORTIONDIVINA');
  33 |     await page.locator('button[data-action="login"]').click();
  34 |     await expect(page.locator('#desktop-screen')).toBeVisible({ timeout: 15000 });
  35 | 
  36 |     // 2. Open Archive via data-window
> 37 |     await page.locator('.desktop-icon[data-window="win-archive"]').click();
     |                                                                    ^ Error: locator.click: Test timeout of 30000ms exceeded.
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