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

document.addEventListener('DOMContentLoaded', () => {
    // Global Failsafe: Ensure loader is removed even if initialization crashes
    setTimeout(() => {
        const loader = document.getElementById('system-loader');
        if (loader) {
            console.warn("Force removing loader via global failsafe");
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }
    }, 5000);

    try {
        // 1. Initialize translation first so UI components render correctly
        I18n.init();

        // 2. Initialize Data Rendering systems
        ArchiveSystem.init();
        EmployeeSystem.init();

        // 3. Initialize Core OS
        System.init();

        // 4. Initialize Tools
        DivinationSystem.init();

        // 5. Initialize Auth last (It handles boot sequence and triggers UI)
        AuthSystem.init();

    } catch (e) {
        console.error("CRITICAL SYSTEM INIT ERROR:", e);
        const loader = document.getElementById('system-loader');
        if (loader) loader.remove();
        document.getElementById('login-screen').style.display = 'block';
    }
});
