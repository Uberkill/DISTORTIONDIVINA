const { chromium } = require('playwright'); 
(async () => { 
    const browser = await chromium.launch(); 
    const page = await browser.newPage(); 
    page.on('console', msg => console.log('BROWSER:', msg.text())); 
    page.on('pageerror', err => console.error('PAGE ERROR:', err)); 
    await page.goto('http://localhost:3000/index.html'); 
    await page.waitForTimeout(1000); 
    await page.locator('#login-input').fill('DISTORTIONDIVINA'); 
    await page.locator('button[data-action="login"]').click(); 
    await page.waitForTimeout(2000); 
    await browser.close(); 
})();
