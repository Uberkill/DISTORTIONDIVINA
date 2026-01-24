const fs = require('fs');
try {
    const content = fs.readFileSync('vercel.json', 'utf8');
    JSON.parse(content);
    console.log("VALID JSON");
} catch (e) {
    console.error("INVALID JSON:", e.message);
}
