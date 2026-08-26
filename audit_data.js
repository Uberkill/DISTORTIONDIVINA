const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("Starting Health Audit for DIVINA SITE...\n");

const dataPath = path.join(__dirname, 'js', 'data.js');
let dataCode = fs.readFileSync(dataPath, 'utf8');

// Replace 'const DB = ' with 'global.DB = ' for VM extraction
dataCode = dataCode.replace('const DB =', 'global.DB =');

const sandbox = { global: {} };
vm.createContext(sandbox);
vm.runInContext(dataCode, sandbox);
const DB = sandbox.global.DB;

let errors = 0;
let warnings = 0;

function assert(condition, message, isWarning = false) {
    if (!condition) {
        if (isWarning) {
            console.log(`[WARNING] ${message}`);
            warnings++;
        } else {
            console.log(`[ERROR] ${message}`);
            errors++;
        }
    }
}

// 3. Audit TRANSLATIONS
console.log("--- Auditing TRANSLATIONS ---");
const langs = ['en', 'ko', 'ja'];
const baseKeys = Object.keys(DB.TRANSLATIONS['en']);

langs.forEach(lang => {
    assert(DB.TRANSLATIONS[lang], `Missing translation object for language: ${lang}`);
    if (DB.TRANSLATIONS[lang]) {
        baseKeys.forEach(key => {
            assert(DB.TRANSLATIONS[lang][key] !== undefined, `Language '${lang}' is missing key '${key}'`);
        });
    }
});

// 4. Audit CARDS
console.log("\n--- Auditing CARDS ---");
const cardIds = new Set();
DB.CARDS.forEach((card, idx) => {
    assert(card.id !== undefined, `Card at index ${idx} is missing an ID`);
    assert(!cardIds.has(card.id), `Duplicate Card ID found: ${card.id}`);
    cardIds.add(card.id);
    
    langs.forEach(lang => {
        assert(card.title && card.title[lang], `Card ID ${card.id} missing title for '${lang}'`);
        assert(card.description && card.description[lang], `Card ID ${card.id} missing description for '${lang}'`);
    });
    
    assert(card.image && card.image.length > 0, `Card ID ${card.id} missing image path`);
    assert(fs.existsSync(path.join(__dirname, card.image)), `Card ID ${card.id} image file not found: ${card.image}`, true);
});

// 5. Audit EMPLOYEES
console.log("\n--- Auditing EMPLOYEES ---");
DB.EMPLOYEES.forEach((emp, idx) => {
    assert(emp.cardId !== undefined, `Employee at index ${idx} missing cardId`);
    assert(cardIds.has(emp.cardId), `Employee at index ${idx} references non-existent cardId: ${emp.cardId}`);
    
    langs.forEach(lang => {
        assert(emp.char && emp.char[lang], `Employee (Card ${emp.cardId}) missing char translation for '${lang}'`);
        assert(emp.role && emp.role[lang], `Employee (Card ${emp.cardId}) missing role translation for '${lang}'`);
    });
    
    assert(emp.variantImage && emp.variantImage.length > 0, `Employee (Card ${emp.cardId}) missing variantImage path`);
    assert(fs.existsSync(path.join(__dirname, emp.variantImage)), `Employee variantImage file not found: ${emp.variantImage}`, true);
});

console.log(`\nAudit Complete: ${errors} Errors, ${warnings} Warnings.`);
