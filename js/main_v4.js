import { EventBus } from './modules/event_bus.js';
import { I18n } from './modules/i18n.js';
import { AuthSystem } from './modules/auth.js';
import { ArchiveSystem } from './modules/archive.js';
import { EmployeeSystem } from './modules/employees.js';
import { System } from './modules/system.js';
import { WindowManager } from './modules/windows.js';
import { AudioManager } from './modules/audio.js';
import { Viewer3D } from './modules/viewer.js';
import { DivinationSystem } from './modules/divination_v4.js';

console.log("MAIN V4 LOADED (Top Level)");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM CONTENT LOADED, STARTING INIT");
    try {
        console.log("Init I18n"); I18n.init();
        console.log("Init Archive"); ArchiveSystem.init();
        console.log("Init Employee"); EmployeeSystem.init();
        console.log("Init System"); System.init();
        console.log("Init Divination"); DivinationSystem.init();
        console.log("Init Auth"); AuthSystem.init();
        console.log("ALL SYSTEMS INITIALIZED");
    } catch(e) {
        console.error("FATAL ERROR IN INIT:", e);
    }
});
