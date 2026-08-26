import { System } from './modules/system.js';
import { WindowManager } from './modules/windows.js';
import { AudioManager } from './modules/audio.js';
import { Viewer3D } from './modules/viewer.js';
import { DivinationSystem } from './modules/divination_v4.js?v=nuclear';

// Expose modules to global scope for HTML event handlers (legacy support)

// Initialize System on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    // Global Failsafe: Ensure loader is removed even if System.init crashes
    setTimeout(() => {
        const loader = document.getElementById('system-loader');
        if (loader) {
            console.warn("Force removing loader via global failsafe");
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }
    }, 5000);

    try {
        System.init();
        DivinationSystem.init();
    } catch (e) {
        console.error("CRITICAL SYSTEM INIT ERROR:", e);
        // Ensure UI is usable even if init failed
        const loader = document.getElementById('system-loader');
        if (loader) loader.remove();
        document.getElementById('login-screen').style.display = 'block';
    }
});
