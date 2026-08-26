const { chromium } = require('playwright'); 
const { spawn } = require('child_process');

const server = spawn('npx.cmd', ['serve', '.', '-p', '3000']);
setTimeout(async () => {
    try {
        const browser = await chromium.launch(); 
        const page = await browser.newPage(); 
        page.on('response', response => {
            if (response.status() === 404) {
                console.log('404 URL:', response.url());
            }
        });
        await page.goto('http://localhost:3000/index.html'); 
        await page.waitForTimeout(3000); 
        await browser.close(); 
    } catch (e) {
        console.error("Test failed", e);
    }
    server.kill();
    process.exit(0);
}, 3000);
