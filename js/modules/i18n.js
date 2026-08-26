import { DB } from './data.js';
import { EventBus } from './event_bus.js';

export const I18n = {
    lang: 'en',

    init() {
        // Set initial language safely
        this.setLanguage('en');

        // Listen for language change requests from the UI
        EventBus.subscribe('action:set-language', (lang) => {
            if (lang && DB.TRANSLATIONS[lang]) {
                this.setLanguage(lang);
            }
        });
    },

    setLanguage(lang) {
        this.lang = lang;
        const labels = DB.TRANSLATIONS[lang];
        if (!labels) return;

        // Update active state of language buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });

        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (labels[key]) {
                el.innerHTML = labels[key]; // Some use HTML, use innerHTML safely
            }
        });

        // Specific element overrides
        const loginInput = document.getElementById('login-input');
        if (loginInput) loginInput.placeholder = labels.login_placeholder || 'ENTER_ACCESS_CODE...';

        // Brief Image Caption
        const briefCap = document.getElementById('brief-caption-display');
        if (briefCap) {
            // Re-triggering brief cap update if we can, 
            // but it relies on system.briefImages which we will decouple later
            EventBus.publish('i18n-brief-caption-request');
        }

        // Emit global language changed event so UI modules (like Archive) can re-render
        EventBus.publish('language-changed', lang);
    },

    get(key) {
        return DB.TRANSLATIONS[this.lang] ? (DB.TRANSLATIONS[this.lang][key] || key) : key;
    },

    getCurrentLang() {
        return this.lang;
    }
};
