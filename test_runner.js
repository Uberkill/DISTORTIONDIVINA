const { chromium } = require('playwright'); 
const { spawn } = require('child_process');

const server = spawn('npx', ['serve', '.', '-p', '3000']);
setTimeout(async () => {
    try {
        const browser = await chromium.launch(); 
        const page = await browser.newPage(); 
        page.on('console', msg => console.log('BROWSER:', msg.text())); 
        page.on('pageerror', err => console.error('PAGE ERROR:', err.message)); 
        await page.goto('http://localhost:3000/index.html'); 
        await page.waitForTimeout(3000); 
        await browser.close(); 
    } catch (e) {
        console.error("Test failed", e);
    }
    server.kill();
    process.exit(0);
}, 3000);
