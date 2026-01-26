
import { AudioManager } from './audio.js';
import { WindowManager } from './windows.js';
import { Viewer3D } from './viewer.js';
import { DB } from './data.js';

export const System = {
    lang: 'en', loginTimer: null, assistantIdx: 0, assistantSteps: [], isTutorialComplete: false, assistantDragging: false, briefImgIdx: 0, isLoggingIn: false,
    briefImages: [
        { src: "./images/jtnx9pe.jpeg", key: "brief_fig_main" },
        { src: "./images/5m4k3ur.jpeg", key: "brief_fig_a" },
        { src: "./images/q2jd7bo.jpeg", key: "brief_fig_b" },
        { src: "./images/49cqhcp.jpeg", key: "brief_fig_c" },
        { src: "./images/redw6e9.jpeg", key: "brief_fig_d" }
    ],

    init() {
        AudioManager.init();
        this.setupDrag();
        this.setupGlobalRecoveryDrag();
        this.setupAssistantDrag();
        this.setupListeners();
        this.checkMobile();
        Viewer3D.init();
        window.addEventListener('resize', () => { this.checkMobile(); });
        this.startAutoLoginTimer();

        setInterval(() => {
            document.getElementById('clock').innerText = new Date().toLocaleTimeString('en-US', { hour12: false });
            const latency = Math.floor(Math.random() * (55 - 24 + 1) + 24);
            if (document.getElementById('sig-latency')) document.getElementById('sig-latency').innerText = latency + "ms";
            const chars = "ABCDEF0123456789";
            let hash = "";
            for (let i = 0; i < 4; i++) hash += chars.charAt(Math.floor(Math.random() * chars.length));
            hash += "-";
            for (let i = 0; i < 4; i++) hash += chars.charAt(Math.floor(Math.random() * chars.length));
            if (document.getElementById('enc-hash-display')) document.getElementById('enc-hash-display').innerText = hash;
            this.updateCountdowns();
        }, 1000);

        if (window.lucide) lucide.createIcons();
        this.renderGrid('all');
        this.setLanguage('en');

        this.initSecurity();
        this.runBootSequence();
    },

    runBootSequence() {
        const loader = document.getElementById('system-loader');
        if (!loader) return;

        // Failsafe: Ensure loader is removed even if animation crashes
        setTimeout(() => {
            if (document.getElementById('system-loader')) {
                document.getElementById('system-loader').remove();
            }
        }, 5000);

        const spinner = loader.querySelector('.loader-spinner');
        if (spinner) spinner.remove();

        const term = document.createElement('div');
        term.className = 'boot-console';
        loader.appendChild(term);
        if (loader.querySelector('.loader-text')) loader.querySelector('.loader-text').remove();

        const logs = [
            { text: "> SYSTEM KERNEL ... OK", delay: 50 },
            { text: "> LOADING DRIVERS ... OK", delay: 150 },
            { text: "> CHECKING MEMORY ... 64TB OK", delay: 200 },
            { text: "> ESTABLISHING SECURE CONNECTION...", delay: 400 },
            { text: "> ENCRYPTING TRAFFIC ... [AES-4096]", delay: 550 },
            { text: "> CONNECTED TO DISTORTION_NET", delay: 750 },
            { text: "> ACCESS GRANTED.", delay: 900, color: "var(--terminal-green)" }
        ];

        let totalDelay = 0;
        logs.forEach(log => {
            setTimeout(() => {
                const line = document.createElement('div');
                line.className = 'boot-line';
                line.innerText = log.text;
                if (log.color) line.style.color = log.color;
                term.appendChild(line);
                try { AudioManager.play('click'); } catch (e) { } // Safely ignore audio errors
            }, log.delay);
            totalDelay = Math.max(totalDelay, log.delay);
        });

        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);

            // Explicitly ensure login screen is visible (JS path)
            const login = document.getElementById('login-screen');
            if (login) {
                login.style.opacity = '1';
                // z-index handled by CSS (20000)
            }
        }, totalDelay + 400);
    },

    initSecurity() {
        this.showConsoleWarning();
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.triggerSecurityAlert("UNAUTHORIZED_ACCESS_ATTEMPT");
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
                this.triggerSecurityAlert("DEBUGGING_INTERFACE_LOCKED");
            }
        });
    },

    showConsoleWarning() {
        console.log("%c STOP! %c\n\n> GOVERNMENT TERMINAL DETECTED.\n> UNAUTHORIZED DEBUGGING IS A CLASS-A FELONY.", "color: red; font-size: 40px; font-weight: bold;", "color: green; font-size: 20px;");
    },

    triggerSecurityAlert(code) {
        try { AudioManager.play('hiss'); } catch (e) { }
        const toast = document.createElement('div');
        toast.className = 'security-toast';
        toast.innerHTML = `<div style="display:flex; align-items:center; gap:10px;"><i data-lucide="shield-alert" width="24" color="red"></i><div><div style="color:red; font-weight:bold;">SECURITY ALERT</div><div style="font-size:0.8rem;">${code}</div></div></div>`;
        document.body.appendChild(toast);
        if (window.lucide) lucide.createIcons({ root: toast });
        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => { toast.classList.remove('visible'); setTimeout(() => toast.remove(), 500); }, 3000);
    },

    updateCountdowns() {
        const now = new Date().getTime();
        const labels = DB.TRANSLATIONS[this.lang];
        const evt1 = new Date('2026-02-15T11:30:00+09:00').getTime();
        const evt2 = new Date('2026-02-21T12:00:00+09:00').getTime();
        const updateElement = (id, targetTime) => {
            const el = document.getElementById(id);
            if (!el) return;
            const diff = targetTime - now;
            if (diff < 0) { el.innerText = labels.time_concluded; el.style.color = "#666"; return; }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);
            const p = (n) => n.toString().padStart(2, '0');
            el.innerText = `${labels.time_tminus}: ${days}${labels.time_days} ${p(hours)}${labels.time_hours} ${p(mins)}${labels.time_mins} ${p(secs)}${labels.time_secs}`;
        };
        updateElement('countdown-1', evt1); updateElement('countdown-2', evt2);
    },

    startAutoLoginTimer() {
        const bar = document.getElementById('auto-login-bar');
        if (bar) {
            bar.style.transition = 'none';
            bar.style.transform = 'scaleX(0)'; // Reset using transform
            void bar.offsetWidth; // Force Reflow
            bar.style.transition = 'transform 10s linear'; // Animate transform
            bar.style.transform = 'scaleX(1)'; // End state
        }
        this.loginTimer = setTimeout(() => { if (document.getElementById('login-input').value === '') this.performAutoFill(); }, 10000);
    },

    performAutoFill() {
        const input = document.getElementById('login-input');
        const bar = document.getElementById('auto-login-bar');
        if (bar) bar.style.opacity = '0';
        const code = "DISTORTIONDIVINA"; let i = 0;
        const typeInterval = setInterval(() => {
            if (i < code.length) { input.value += code.charAt(i); i++; }
            else { clearInterval(typeInterval); setTimeout(() => this.login(), 100); }
        }, 20);
    },

    checkMobile() {
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('is-mobile', isMobile);
        this.updateModeButtons(); this.updateScaleButtons();
    },

    toggleMode() { document.body.classList.toggle('is-mobile'); this.updateModeButtons(); try { AudioManager.play('click'); } catch (e) { } },
    toggleUIScale() { document.body.classList.toggle('ui-large'); this.updateScaleButtons(); try { AudioManager.play('click'); } catch (e) { } },

    updateScaleButtons() {
        const isLarge = document.body.classList.contains('ui-large');
        const labels = DB.TRANSLATIONS[this.lang];
        document.querySelectorAll('.ui-scale-btn').forEach(btn => {
            btn.innerHTML = isLarge ? `<i data-lucide="zoom-out" width="18"></i> ${labels.btn_scale_normal}` : `<i data-lucide="zoom-in" width="18"></i> ${labels.btn_scale_large}`;
        });
        if (window.lucide) lucide.createIcons();
    },

    updateModeButtons() {
        const isMobile = document.body.classList.contains('is-mobile');
        const labels = DB.TRANSLATIONS[this.lang];
        document.querySelectorAll('.mode-switch-btn[data-action="toggle-mode"]').forEach(btn => {
            btn.innerHTML = isMobile ? `<i data-lucide="smartphone" width="18"></i> ${labels.ui_mode_mobile}` : `<i data-lucide="monitor" width="18"></i> ${labels.ui_mode_desktop}`;
        });
        if (window.lucide) lucide.createIcons();
    },

    setLanguage(lang) {
        this.lang = lang;
        const labels = DB.TRANSLATIONS[lang];
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.innerText.toLowerCase().includes(lang === 'en' ? 'en' : (lang === 'ko' ? '한국어' : '日本語'))) btn.classList.add('active');
        });
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (labels[key]) el.innerText = labels[key];
        });
        if (document.getElementById('login-input')) document.getElementById('login-input').placeholder = labels.login_placeholder;
        const briefCap = document.getElementById('brief-caption-display');
        if (briefCap) {
            const imgKey = this.briefImages[this.briefImgIdx].key;
            if (labels[imgKey]) briefCap.innerText = labels[imgKey];
        }
        this.updateModeButtons(); this.updateScaleButtons();
        this.renderGrid('all'); this.renderEmployees(); this.updateCountdowns();
    },

    changeBriefImage(dir) {
        const imgEl = document.getElementById('brief-img-display');
        if (imgEl) imgEl.style.opacity = '0.3';
        this.briefImgIdx = (this.briefImgIdx + dir + this.briefImages.length) % this.briefImages.length;
        const imgData = this.briefImages[this.briefImgIdx];
        setTimeout(() => { if (imgEl) { imgEl.src = imgData.src; imgEl.onload = () => { imgEl.style.opacity = '1'; }; } }, 200);
        const labels = DB.TRANSLATIONS[this.lang];
        if (document.getElementById('brief-caption-display') && labels[imgData.key]) document.getElementById('brief-caption-display').innerText = labels[imgData.key];
        if (document.getElementById('brief-img-counter')) document.getElementById('brief-img-counter').innerText = `[ ${this.briefImgIdx + 1} / ${this.briefImages.length} ]`;
        try { AudioManager.play('click'); } catch (e) { }
    },

    login() {
        if (this.isLoggingIn) return;
        this.isLoggingIn = true;
        if (this.loginTimer) clearTimeout(this.loginTimer);
        const wrapper = document.getElementById('login-wrapper');
        const msg = document.getElementById('login-message');
        const labels = DB.TRANSLATIONS[this.lang];
        wrapper.classList.add('focused');
        msg.style.opacity = '1'; msg.innerText = labels.login_verifying;

        try { AudioManager.play('login'); } catch (e) { console.error('Audio play failed', e); }

        setTimeout(() => {
            msg.innerText = labels.access_granted; msg.style.color = "var(--terminal-green)";
            setTimeout(() => {
                document.getElementById('login-screen').classList.add('zoom-out');
                // Force hide via class for Nuclear CSS override
                document.body.classList.add('logged-in');
                document.getElementById('desktop-screen').classList.add('active'); // Ensure active class is added for logic, though CSS overrides visibility

                setTimeout(() => {
                    document.getElementById('login-screen').style.display = 'none';
                    setTimeout(() => WindowManager.open('win-overview'), 300);
                    this.initAssistant();
                }, 100); // Short delay just to allow DOM update
            }, 400);
        }, 300);
    },



    setupListeners() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button, .desktop-icon, .shop-link-btn, .win-btn, .lang-btn, .login-submit-btn, .mobile-btn, .assistant-btn, .archive-btn, .v-btn, .gallery-nav, .variant-card, .task-item');
            if (target) {
                const circle = document.createElement("span");
                const diameter = Math.max(target.clientWidth, target.clientHeight);
                const radius = diameter / 2;
                const rect = target.getBoundingClientRect();
                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${e.clientX - rect.left - radius}px`;
                circle.style.top = `${e.clientY - rect.top - radius}px`;
                circle.classList.add("ripple");
                const oldRipple = target.getElementsByClassName("ripple")[0];
                if (oldRipple) oldRipple.remove();
                target.appendChild(circle);
            }
        });
        if (document.getElementById('login-input')) {
            document.getElementById('login-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') this.login(); });
        }
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            const winId = icon.getAttribute('data-window');
            if (winId) {
                // Remove custom onclick loop, rely on global listener now
                icon.onclick = () => WindowManager.open(winId);
            }
        });

        // Global Window Open Listener
        document.addEventListener('window-opened', (e) => {
            if (e.detail.id === 'win-archive') {
                this.renderGrid('all');
            }
        });
    },

    resetLayout() {
        document.querySelectorAll('.os-window').forEach(win => {
            const id = win.id;
            // Respect mobile/desktop differences if needed, but for "Reset" we default to safety (Center)
            win.style.top = '50%';
            win.style.left = '50%';
            win.style.width = ''; // Reset custom sizes
            win.style.height = '';
            win.style.transform = 'translate(-50%, -50%)'; // Ensure centering transform is active
            win.classList.remove('maximized', 'minimized');
            // Ensure they are hidden or shown appropriately? 
            // Better to just reset positions of OPEN windows. Closed ones can stay closed.
            if (win.classList.contains('window-open')) {
                // Keep it open, just move it.
            }
        });
        AudioManager.play('click');
        // Optional: Notify user
        this.triggerSecurityAlert("WORKSPACE_REORGANIZED");
    },

    setupDrag() {
        let isDragging = false, currentWindow = null, dx = 0, dy = 0;
        const start = (e) => {
            const win = e.target.closest('.os-window');
            // Only allow dragging from the header
            if (!win || !e.target.closest('.window-header') || e.target.closest('.win-controls')) return;

            isDragging = true; currentWindow = win; WindowManager.bringToFront(win);
            const cx = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const cy = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            const rect = win.getBoundingClientRect();

            // Fix position if transformed (centering fix)
            const style = window.getComputedStyle(win);
            if (style.transform !== 'none') {
                win.style.transform = 'none';
                win.style.left = rect.left + 'px';
                win.style.top = rect.top + 'px';
                // Remove animation to prevent conflict
                win.style.animation = 'none';
            }

            dx = cx - rect.left; dy = cy - rect.top;
        };
        const move = (e) => {
            if (!isDragging) return;
            const cx = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const cy = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

            // Apply Boundary Constraints
            let newLeft = cx - dx;
            let newTop = cy - dy;

            const winRect = currentWindow.getBoundingClientRect();
            // Constraint: Keep 50px of the header visible horizontally
            const minVisibleWidth = 50;
            const maxX = window.innerWidth - minVisibleWidth;
            const minX = -winRect.width + minVisibleWidth;

            // Constraint: Keep header from going above top or below bottom
            const headerHeight = 50; // Approximated
            const maxY = window.innerHeight - headerHeight;

            // Clamp Values
            if (newTop < 0) newTop = 0; // Don't hide under top bar
            if (newTop > maxY) newTop = maxY; // Don't loose below screen
            if (newLeft < minX) newLeft = minX;
            if (newLeft > maxX) newLeft = maxX;

            currentWindow.style.left = newLeft + 'px';
            currentWindow.style.top = newTop + 'px';
        };
        const end = () => { isDragging = false; };
        document.addEventListener('mousedown', start); document.addEventListener('touchstart', start, { passive: false });
        document.addEventListener('mousemove', move); document.addEventListener('touchmove', move, { passive: false });
        document.addEventListener('mouseup', end); document.addEventListener('touchend', end);
    },

    setupGlobalRecoveryDrag() {
        let isRecovering = false;
        let startX = 0, startY = 0;

        const start = (e) => {
            if (!e.shiftKey) return;
            // Allow recovery drag from anywhere if Shift is held
            isRecovering = true;
            startX = e.clientX;
            startY = e.clientY;
            e.preventDefault(); // Prevent text selection
            document.body.style.cursor = 'move';
        };

        const move = (e) => {
            if (!isRecovering) return;
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            startX = e.clientX;
            startY = e.clientY;

            document.querySelectorAll('.os-window').forEach(win => {
                // If window is visible/display flex
                if (window.getComputedStyle(win).display === 'none') return;

                const style = window.getComputedStyle(win);
                // Reset transform if present so we can move purely with pixel top/left
                if (style.transform !== 'none') {
                    const rect = win.getBoundingClientRect();
                    win.style.transform = 'none';
                    win.style.left = rect.left + 'px';
                    win.style.top = rect.top + 'px';
                    win.style.animation = 'none';
                }

                // Apply delta
                const currentLeft = parseFloat(win.style.left) || 0; // After reset, these should be set
                const currentTop = parseFloat(win.style.top) || 0;

                win.style.left = (currentLeft + dx) + 'px';
                win.style.top = (currentTop + dy) + 'px';
            });
        };

        const end = () => {
            if (isRecovering) {
                isRecovering = false;
                document.body.style.cursor = '';
            }
        };

        document.addEventListener('mousedown', start);
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', end);
    },

    setupAssistantDrag() {
        const overlay = document.getElementById('assistant-overlay');
        if (!overlay) return;
        const avatar = overlay.querySelector('.assistant-avatar');
        let startX = 0, startY = 0, iL = 0, iT = 0, hasMoved = false;
        const start = (e) => {
            e.preventDefault(); this.assistantDragging = true; hasMoved = false;
            const cx = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const cy = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            const rect = overlay.getBoundingClientRect();
            overlay.style.bottom = 'auto'; overlay.style.right = 'auto';
            overlay.style.left = rect.left + 'px'; overlay.style.top = rect.top + 'px';
            startX = cx; startY = cy; iL = rect.left; iT = rect.top;
            AudioManager.play('hiss');
        };
        const move = (e) => {
            if (!this.assistantDragging) return;
            hasMoved = true;
            const cx = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const cy = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            overlay.style.left = (iL + cx - startX) + 'px'; overlay.style.top = (iT + cy - startY) + 'px';
        };
        const end = () => { if (this.assistantDragging) { this.assistantDragging = false; if (!hasMoved) this.handleAssistantClick(); } };
        avatar.addEventListener('mousedown', start); avatar.addEventListener('touchstart', start, { passive: false });
        window.addEventListener('mousemove', move); window.addEventListener('touchmove', move, { passive: false });
        window.addEventListener('mouseup', end); window.addEventListener('touchend', end);
    },

    handleAssistantClick() {
        AudioManager.play('meow');
        this.showBubble(this.getRandomCatLine());
    },

    getRandomCatLine() { return DB.TRANSLATIONS[this.lang].cat_lines[Math.floor(Math.random() * DB.TRANSLATIONS[this.lang].cat_lines.length)]; },
    setAssistantText(msg) { if (document.getElementById('assistant-text')) document.getElementById('assistant-text').innerText = msg; },

    initAssistant() { setTimeout(() => this.openAssistant(), 2000); },

    openAssistant() {
        const overlay = document.getElementById('assistant-overlay');
        if (overlay) {
            overlay.classList.add('active');
            this.assistantIdx = 0;
            this.assistantSteps = DB.TRANSLATIONS[this.lang].assistant_steps;
            this.showBubble(this.assistantSteps[0]);

            const controls = overlay.querySelector('.assistant-controls');
            if (controls) controls.style.display = 'flex';
            WindowManager.open('win-overview');
            if (this.chatterInterval) clearInterval(this.chatterInterval);
        }
    },

    nextAssistantStep() {
        this.assistantIdx++;
        if (this.assistantIdx < this.assistantSteps.length) {
            this.setAssistantText(this.assistantSteps[this.assistantIdx]); // Keep bubble open
            // Simple flow logic
            if (this.assistantIdx === 2) { WindowManager.close('win-overview'); setTimeout(() => WindowManager.open('win-employees'), 300); }
            else if (this.assistantIdx === 3) { WindowManager.close('win-employees'); setTimeout(() => WindowManager.open('win-archive'), 300); }
            else if (this.assistantIdx === 4) { WindowManager.close('win-archive'); setTimeout(() => WindowManager.open('win-shop'), 300); }
            else if (this.assistantIdx === 5) { WindowManager.close('win-shop'); setTimeout(() => WindowManager.open('win-comm'), 300); }
        } else {
            this.finishTutorial();
        }
    },

    finishTutorial() {
        this.isTutorialComplete = true;
        WindowManager.close('win-comm');
        const controls = document.querySelector('.assistant-controls');
        if (controls) controls.style.display = 'none';
        this.hideBubble();
        this.startChatter();
    },

    startChatter() {
        if (this.chatterInterval) clearInterval(this.chatterInterval);
        this.chatterInterval = setInterval(() => {
            if (Math.random() > 0.5) {
                this.showBubble(this.getRandomCatLine());
                AudioManager.play('meow');
                setTimeout(() => this.hideBubble(), 4000);
            }
        }, 20000);
    },

    showBubble(text) {
        if (text) this.setAssistantText(text);
        const bubble = document.querySelector('.assistant-bubble');
        if (bubble) bubble.classList.remove('hidden');
    },

    hideBubble() {
        const bubble = document.querySelector('.assistant-bubble');
        if (bubble) bubble.classList.add('hidden');
    },

    closeAssistant() {
        if (document.getElementById('assistant-overlay')) {
            document.getElementById('assistant-overlay').classList.remove('active');
            if (this.chatterInterval) clearInterval(this.chatterInterval);
        }
    },

    renderGrid(sortType = 'id', clickedBtn = null) {
        const grid = document.getElementById('cardGrid');
        if (!grid) return;

        grid.innerHTML = '';

        // Update Button State
        // Update Button State
        const buttons = document.querySelectorAll('.archive-btn');
        if (clickedBtn) {
            buttons.forEach(b => b.classList.remove('active'));
            clickedBtn.classList.add('active');
        } else {
            // Programmatic update: find button matching sortType
            buttons.forEach(b => b.classList.remove('active'));
            let targetKey = 'btn_view_all'; // default 'all'
            if (sortType === 'id') targetKey = 'btn_sort_tarot';
            if (sortType === 'name') targetKey = 'btn_sort_name';

            const targetBtn = Array.from(buttons).find(b => b.getAttribute('data-i18n') === targetKey);
            if (targetBtn) targetBtn.classList.add('active');
        }

        if (sortType === 'all') {
            // --- SHOW ALL VARIANTS ---
            let variants = [...DB.EMPLOYEES];
            variants.sort((a, b) => a.cardId - b.cardId); // Keep tarot order

            variants.forEach(variant => {
                const parent = DB.CARDS.find(c => c.id === variant.cardId);
                if (!parent) return;

                const el = document.createElement('div');
                el.className = 'card-file';
                // Show variant image and Character Name + Tarot Name small
                el.innerHTML = `
                            <img src="${variant.variantImage}" class="img-loaded" loading="lazy" decoding="async">
                            <div class="file-label">
                                <div style="font-size:0.7em;color:var(--gold-dim);margin-bottom:2px;">${parent.title[this.lang]}</div>
                                ${variant.char[this.lang]}
                            </div>`;

                // Direct link to viewer (skip selector)
                el.onclick = () => this.openViewer(parent, variant);
                grid.appendChild(el);
            });
        } else {
            // --- SHOW CATEGORIES (DEFAULT) ---
            let cards = [...DB.CARDS];
            if (sortType === 'name') cards.sort((a, b) => a.title[this.lang].localeCompare(b.title[this.lang]));
            else cards.sort((a, b) => a.id - b.id);

            cards.forEach(card => {
                const el = document.createElement('div'); el.className = 'card-file';
                el.innerHTML = `<img src="${card.image}" class="img-loaded" loading="lazy" decoding="async"><div class="file-label">${card.title[this.lang]}</div>`;
                el.onclick = () => this.openSelector(card);
                grid.appendChild(el);
            });
        }
    },

    renderEmployees() {
        const tbody = document.getElementById('employee-list-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        DB.EMPLOYEES.forEach(emp => {
            const tr = document.createElement('tr'); const labels = DB.TRANSLATIONS[this.lang];
            tr.innerHTML = `<td data-label="${labels.th_no}">${emp.no}</td><td data-label="${labels.th_card}">${emp.card}</td><td data-label="${labels.th_char}">${emp.char[this.lang]}</td><td data-label="${labels.th_emp}">${emp.artist}</td><td data-label="${labels.th_pen}">${emp.pen}</td><td><span class="role-badge">${emp.role[this.lang]}</span></td>`;
            tbody.appendChild(tr);
        });
    },

    openSelector(card) {
        const variants = DB.EMPLOYEES.filter(e => e.cardId === card.id);
        if (variants.length > 1) {
            const grid = document.getElementById('selector-grid'); grid.innerHTML = '';
            const labels = DB.TRANSLATIONS[this.lang];
            document.getElementById('selector-title').innerText = `${labels.selector_prefix}${card.title[this.lang]}`;
            variants.forEach(v => {
                const div = document.createElement('div'); div.className = 'variant-card';
                div.innerHTML = `<div class="variant-img-box"><img src="${v.variantImage}" loading="lazy" decoding="async"></div><div class="variant-info"><div class="variant-char">${v.char[this.lang]}</div><div class="variant-artist">${labels.viewer_illus_label}: ${v.artist}</div></div>`;
                div.onclick = () => this.openViewer(card, v); grid.appendChild(div);
            });
            WindowManager.open('win-selector');
        } else this.openViewer(card, variants[0] || null);
    },

    openViewer(card, variant) {
        Viewer3D.reset(); const labels = DB.TRANSLATIONS[this.lang];
        document.getElementById('viewer-img').src = variant ? variant.variantImage : card.image;
        document.getElementById('viewer-title').innerText = card.title[this.lang];
        document.getElementById('viewer-desc').innerText = card.description[this.lang];
        document.getElementById('viewer-id').innerText = `00${card.id}-ALPHA`;

        // Artist and Pen Name info in Viewer
        const artistInfo = variant ? `
                    <div style="border-left:2px solid var(--gold-primary);padding-left:15px;">
                        <div style="color:var(--terminal-green);font-size:0.9rem;">${labels.viewer_char_label}</div>
                        <div style="color:white;font-size:1.8rem;margin-bottom:8px;">${variant.char[this.lang]}</div>
                        <div style="color:var(--gold-dim);font-size:0.8rem;">${labels.viewer_illus_label}</div>
                        <div style="color:#ddd;font-size:1.3rem;">${variant.artist} <span style="font-size:0.9rem;opacity:0.6;font-family:'Share Tech Mono';">(@${variant.pen})</span></div>
                        <div style="color:rgba(0,240,255,0.7);font-size:0.85rem;margin-top:4px;text-transform:uppercase;">${variant.role[this.lang]}</div>
                    </div>
                ` : `<div>${labels.viewer_no_variant}</div>`;

        document.getElementById('viewer-artist').innerHTML = artistInfo;

        // Socials rendering logic
        const socialsDiv = document.getElementById('viewer-socials');
        socialsDiv.innerHTML = '';

        if (variant && variant.socials) {
            Object.entries(variant.socials).forEach(([platform, url]) => {
                const a = document.createElement('a');
                a.href = url;
                a.target = "_blank";
                a.className = "viewer-social-btn";

                let iconName = 'globe';
                if (platform === 'twitter') iconName = 'twitter';
                if (platform === 'instagram') iconName = 'instagram';

                a.innerHTML = `<i data-lucide="${iconName}" width="18" height="18"></i> <span>${platform.toUpperCase()}</span>`;
                socialsDiv.appendChild(a);
            });
            if (window.lucide) lucide.createIcons({ root: socialsDiv });
        }

        WindowManager.open('win-viewer');
    }
};
