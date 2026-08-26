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
    I18n.init();
    ArchiveSystem.init();
    EmployeeSystem.init();
    System.init();
    DivinationSystem.init();
    AuthSystem.init();
});
