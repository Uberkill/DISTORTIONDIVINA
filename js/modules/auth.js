import { DB } from './data.js';
import { EventBus } from './event_bus.js';
import { AudioManager } from './audio.js';
import { I18n } from './i18n.js';

export const AuthSystem = {
    isLoggingIn: false,
    loginTimer: null,

    init() {
        this.initSecurity();
        this.startAutoLoginTimer();

        // Listen for login click events
        EventBus.subscribe('action:login', () => {
            this.login();
        });

        // Global Keydown for login via Enter
        document.addEventListener('keydown', (e) => {
            if (e.target.id === 'login-input' && e.key === 'Enter') {
                this.login();
            }
        });
    },

    initSecurity() {
        console.log("%c STOP! %c\n\n> GOVERNMENT TERMINAL DETECTED.\n> UNAUTHORIZED DEBUGGING IS A CLASS-A FELONY.", "color: red; font-size: 40px; font-weight: bold;", "color: green; font-size: 20px;");
    },

    startAutoLoginTimer() {
        const input = document.getElementById('login-input');
        if (!input) return;

        this.loginTimer = setTimeout(() => {
            if (this.isLoggingIn) return;
            const bar = document.getElementById('auto-login-bar');
            if (bar) bar.style.opacity = '0';
            
            const code = "DISTORTIONDIVINA"; 
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < code.length) { 
                    input.value += code.charAt(i); 
                    i++; 
                } else { 
                    clearInterval(typeInterval); 
                    setTimeout(() => this.login(), 100); 
                }
            }, 20);
        }, 15000);
    },

    login() {
        if (this.isLoggingIn) return;
        this.isLoggingIn = true;
        
        if (this.loginTimer) clearTimeout(this.loginTimer);
        
        const wrapper = document.getElementById('login-wrapper');
        const msg = document.getElementById('login-message');
        if (!wrapper || !msg) return;

        wrapper.classList.add('focused');
        msg.style.opacity = '1'; 
        msg.innerText = I18n.get('login_verifying');

        try { AudioManager.play('login'); } catch (e) { console.error('Audio play failed', e); }

        setTimeout(() => {
            msg.innerText = I18n.get('access_granted'); 
            msg.style.color = "var(--terminal-green)";
            
            setTimeout(() => {
                const loginScreen = document.getElementById('login-screen');
                if (loginScreen) loginScreen.classList.add('zoom-out');
                
                document.body.classList.add('logged-in');
                const desktop = document.getElementById('desktop-screen');
                if (desktop) desktop.classList.add('active'); 
                
                setTimeout(() => {
                    if (loginScreen) loginScreen.style.display = 'none';
                    // Emit auth-success so the Desktop can initialize
                    EventBus.publish('auth-success');
                }, 100);
            }, 400);
        }, 800);
    }
};
