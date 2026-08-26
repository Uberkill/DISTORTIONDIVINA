const fs = require('fs');
const path = require('path');

const backupPath = path.join(__dirname, 'js', 'modules', 'system_backup.js');
const systemPath = path.join(__dirname, 'js', 'modules', 'system.js');
let code = fs.readFileSync(backupPath, 'utf8');

// IMPORTS
code = code.replace(/import \{ DB \} from '\.\/data\.js';/g, '');
code = code.replace(
    /import \{ AudioManager \} from '\.\/audio\.js';/,
    `import { AudioManager } from './audio.js';\nimport { EventBus } from './event_bus.js';\nimport { I18n } from './i18n.js';`
);

// STATE VARS
code = code.replace(/lang: 'en',\s*loginTimer: null,\s*/, '');
code = code.replace(/isLoggingIn: false,/, '');

// INIT
code = code.replace(/this\.startAutoLoginTimer\(\);/, `// Auto login is now in AuthSystem`);
code = code.replace(/this\.renderGrid\('all'\);\s*this\.setLanguage\('en'\);\s*this\.initSecurity\(\);/g, `// Decoupled logic handled by EventBus / Init`);

// DELETED METHODS: Delete precisely by matching to the end of the method
function removeMethod(str, methodName) {
    const regex = new RegExp(`\\s*${methodName}\\(\\) \\{[\\s\\S]*?\\n    \\},`, 'g');
    return str.replace(regex, '');
}
function removeMethodLast(str, methodName) {
    const regex = new RegExp(`\\s*${methodName}\\(\\) \\{[\\s\\S]*?\\n    \\}`, 'g');
    return str.replace(regex, '');
}

code = removeMethod(code, 'startAutoLoginTimer');
code = removeMethod(code, 'performAutoFill');
code = removeMethod(code, 'initSecurity');
code = removeMethod(code, 'showConsoleWarning');
code = removeMethod(code, 'triggerSecurityAlert');
code = removeMethod(code, 'login');
code = removeMethod(code, 'renderEmployees');
code = removeMethod(code, 'openSelector');

// renderGrid and setLanguage have arguments, so specify them
code = code.replace(/\s*renderGrid\(sortType = 'id', clickedBtn = null\) \{[\s\S]*?\n    \},/g, '');
code = code.replace(/\s*setLanguage\(lang\) \{[\s\S]*?\n    \},/g, '');

// ROUTING IN setupListeners
code = code.replace(
    /this\.setLanguage\(actionTarget\.getAttribute\('data-lang'\)\);/g, 
    `EventBus.publish('action:set-language', actionTarget.getAttribute('data-lang'));`
);
code = code.replace(
    /case 'login': this\.login\(\); break;/g, 
    `case 'login': EventBus.publish('action:login'); break;`
);
code = code.replace(
    /this\.renderGrid\(actionTarget\.getAttribute\('data-sort'\), actionTarget\);/g, 
    `EventBus.publish('action:render-grid', { sort: actionTarget.getAttribute('data-sort'), target: actionTarget });`
);
// Keydown routing for login
code = code.replace(
    /if \(e\.target\.id === 'login-input' && e\.key === 'Enter'\) \{\s*this\.login\(\);\s*\}/g, 
    `if (e.target.id === 'login-input' && e.key === 'Enter') {\n                EventBus.publish('action:login');\n            }`
);

// TRANSLATIONS
code = code.replace(/const labels = DB\.TRANSLATIONS\[this\.lang\];/g, `// labels dynamically requested`);
code = code.replace(/const labels = DB\.TRANSLATIONS\[lang\];/g, ``);
code = code.replace(/btn\.innerHTML = isLarge \? `<i data-lucide="zoom-out" width="18"><\/i> \$\{labels\.btn_scale_normal\}` : `<i data-lucide="zoom-in" width="18"><\/i> \$\{labels\.btn_scale_large\}`;/g, 
    `btn.innerHTML = isLarge ? \`<i data-lucide="zoom-out" width="18"></i> \${I18n.get('btn_scale_normal')}\` : \`<i data-lucide="zoom-in" width="18"></i> \${I18n.get('btn_scale_large')}\`;`);
code = code.replace(/btn\.innerHTML = isMobile \? `<i data-lucide="smartphone" width="18"><\/i> \$\{labels\.ui_mode_mobile\}` : `<i data-lucide="monitor" width="18"><\/i> \$\{labels\.ui_mode_desktop\}`;/g,
    `btn.innerHTML = isMobile ? \`<i data-lucide="smartphone" width="18"></i> \${I18n.get('ui_mode_mobile')}\` : \`<i data-lucide="monitor" width="18"></i> \${I18n.get('ui_mode_desktop')}\`;`);
code = code.replace(/if \(document\.getElementById\('brief-caption-display'\) && labels\[imgData\.key\]\)/g, `if (document.getElementById('brief-caption-display') && I18n.get(imgData.key))`);
code = code.replace(/document\.getElementById\('brief-caption-display'\)\.innerText = labels\[imgData\.key\];/g, `document.getElementById('brief-caption-display').innerText = I18n.get(imgData.key);`);

// For assistant:
code = code.replace(/this\.assistantSteps = DB\.TRANSLATIONS\[this\.lang\]\.assistant_steps;/g, `this.assistantSteps = I18n.get('assistant_steps');`);
code = code.replace(/DB\.TRANSLATIONS\[this\.lang\]\.cat_lines/g, `I18n.get('cat_lines')`);

// Re-write boot sequence terminal logs to use I18n
code = code.replace(/this\.lang === 'ja' \? "ブートシーケンス開始\.\.\." : \(this\.lang === 'ko' \? "부팅 시퀀스 시작\.\.\." : "INITIATING BOOT SEQUENCE\.\.\."\)/g, `I18n.get('boot_0') || 'INITIATING BOOT SEQUENCE...'`);
code = code.replace(/this\.lang === 'ja' \? "メモリチェック: OK" : \(this\.lang === 'ko' \? "메모리 확인: 정상" : "MEMORY CHECK: OK"\)/g, `I18n.get('boot_1') || 'MEMORY CHECK: OK'`);
code = code.replace(/this\.lang === 'ja' \? "モジュールをロード中\.\.\." : \(this\.lang === 'ko' \? "모듈 로드 중\.\.\." : "LOADING MODULES\.\.\."\)/g, `I18n.get('boot_2') || 'LOADING MODULES...'`);
code = code.replace(/this\.lang === 'ja' \? "認証に成功しました。" : \(this\.lang === 'ko' \? "인증 성공\." : "AUTH SUCCESS\."\)/g, `I18n.get('boot_3') || 'AUTH SUCCESS.'`);

// Save updated code
fs.writeFileSync(systemPath, code);
console.log('system.js safely decoupled');
