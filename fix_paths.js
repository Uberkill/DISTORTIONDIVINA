const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'images');

// 1. Rename files in images/ directory
try {
    const files = fs.readdirSync(imagesDir);
    files.forEach(file => {
        const oldPath = path.join(imagesDir, file);
        const newPath = path.join(imagesDir, file.toLowerCase());
        if (oldPath !== newPath) {
            fs.renameSync(oldPath, newPath);
            console.log(`Renamed: ${file} -> ${file.toLowerCase()}`);
        }
    });
} catch (err) {
    console.error("Error renaming files:", err);
}

// 2. Update references in files
const filesToUpdate = [
    path.join(__dirname, 'js', 'data.js'),
    path.join(__dirname, 'index.html')
];

filesToUpdate.forEach(filePath => {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        // Replace ./images/MightBeUpper.png with ./images/mightbeupper.png
        // Also images/MightBeUpper.png with images/mightbeupper.png
        content = content.replace(/(?:\.\/)?images\/([a-zA-Z0-9_-]+\.(png|jpg|jpeg|gif))/gi, (match, filename) => {
            // Keep the prefix (images/ or ./images/) and lower-case the filename
            const prefix = match.substring(0, match.length - filename.length);
            return prefix + filename.toLowerCase();
        });
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated references in: ${filePath}`);
    } catch (err) {
        console.error(`Error updating ${filePath}:`, err);
    }
});
