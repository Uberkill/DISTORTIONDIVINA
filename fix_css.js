const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'css', 'style.css');

try {
    let content = fs.readFileSync(cssPath, 'utf8');
    // Regex for both url('...') and url("...")
    content = content.replace(/url\(['"]?(.*?)['"]?\)/g, (match, url) => {
        if (url.match(/\.(png|jpg|jpeg|gif)$/i)) {
            const parts = url.split('/');
            const filename = parts.pop();
            const lowerFilename = filename.toLowerCase();
            if (filename !== lowerFilename) {
                console.log(`Fixing CSS: ${filename} -> ${lowerFilename}`);
                return match.replace(filename, lowerFilename);
            }
        }
        return match;
    });
    fs.writeFileSync(cssPath, content, 'utf8');
    console.log("CSS Update Complete");
} catch (err) {
    console.error("Error updating CSS:", err);
}
