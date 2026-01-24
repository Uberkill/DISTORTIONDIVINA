const LazyLoader = {
    observer: null,
    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.load(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            });
        }
    },
    observe() {
        document.querySelectorAll('img.lazy-img').forEach(img => {
            if (this.observer) this.observer.observe(img);
            else this.load(img);
        });
    },
    load(img) {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.onload = () => img.classList.add('img-loaded');
        }
    }
};

const AudioManager = {
    ctx: null, gain: null,
    init() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.gain = this.ctx.createGain();
            this.gain.connect(this.ctx.destination);
        } catch (e) { console.warn("Audio Context blocked", e); }
    },
    play(type) {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => { });
        try {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.connect(g); g.connect(this.gain);
            const now = this.ctx.currentTime;
            if (type === 'click') {
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
                g.gain.setValueAtTime(0.1, now);
                g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now); osc.stop(now + 0.1);
            } else if (type === 'hover') {
                osc.type = 'triangle'; osc.frequency.setValueAtTime(200, now);
                g.gain.setValueAtTime(0.05, now);
                g.gain.linearRampToValueAtTime(0, now + 0.05);
                osc.start(now); osc.stop(now + 0.05);
            } else if (type === 'login') {
                osc.type = 'square'; osc.frequency.setValueAtTime(200, now);
                osc.frequency.linearRampToValueAtTime(800, now + 0.3);
                g.gain.setValueAtTime(0.1, now);
                g.gain.linearRampToValueAtTime(0, now + 1.0);
                osc.start(now); osc.stop(now + 1.0);
            } else if (type === 'meow') {
                osc.type = 'triangle'; osc.frequency.setValueAtTime(800, now);
                osc.frequency.linearRampToValueAtTime(1200, now + 0.1);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.4);
                g.gain.setValueAtTime(0.1, now);
                g.gain.linearRampToValueAtTime(0, now + 0.4);
                osc.start(now); osc.stop(now + 0.4);
            } else if (type === 'hiss') {
                osc.type = 'sawtooth'; osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
                g.gain.setValueAtTime(0.1, now);
                g.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now); osc.stop(now + 0.3);
            }
        } catch (e) { }
    }
};

const WindowManager = {
    zIndex: 100,
    maximizedState: {},
    open(id) {
        const win = document.getElementById(id);
        if (win) {
            if (document.body.classList.contains('is-mobile')) {
                win.style.top = "";
                win.style.left = "";
                win.style.width = "";
                win.style.height = "";
                win.style.transform = "";
            } else {
                const rect = win.getBoundingClientRect();
                if (rect.top < 0) win.style.top = '10%';
                if (rect.left < 0) win.style.left = '10%';
            }

            win.style.display = 'flex';
            this.bringToFront(win);
            win.classList.remove('minimized');
            requestAnimationFrame(() => win.classList.add('window-open'));
            AudioManager.play('click');
            if (window.lucide) lucide.createIcons({ root: win });
        }
    },
    close(id) {
        const win = document.getElementById(id);
        if (win) {
            win.classList.remove('window-open', 'active', 'minimized');
            setTimeout(() => { win.style.display = 'none'; }, 300);
            AudioManager.play('click');
        }
    },
    minimize(id) {
        const win = document.getElementById(id);
        if (win) {
            win.classList.add('minimized');
            win.classList.remove('active');
            AudioManager.play('click');
        }
    },
    toggleMaximize(id) {
        if (document.body.classList.contains('is-mobile')) return;
        const win = document.getElementById(id);
        if (!win) return;
        if (win.classList.contains('maximized')) {
            win.classList.remove('maximized');
            const state = this.maximizedState[id] || {};
            win.style.top = state.top || '10%';
            win.style.left = state.left || '10%';
            win.style.width = state.width || '600px';
            win.style.height = state.height || '500px';
        } else {
            this.maximizedState[id] = { top: win.style.top, left: win.style.left, width: win.style.width, height: win.style.height };
            win.classList.add('maximized');
            win.style.top = '70px'; win.style.left = '0'; win.style.width = '100%'; win.style.height = 'calc(100% - 125px)';
        }
        this.bringToFront(win);
        AudioManager.play('click');
    },
    bringToFront(win) {
        this.zIndex++;
        win.style.zIndex = this.zIndex;
        document.querySelectorAll('.os-window').forEach(w => w.classList.remove('active'));
        win.classList.add('active');
    },
    showDesktop() {
        document.querySelectorAll('.os-window').forEach(w => {
            w.classList.remove('window-open');
            setTimeout(() => w.style.display = 'none', 300);
        });
        AudioManager.play('click');
    }
};

const Viewer3D = {
    state: { scale: 1, rotX: 0, rotY: 0 },
    init() {
        const stage = document.getElementById('viewer-stage');
        if (!stage) return;
        stage.addEventListener('mousedown', (e) => this.startDrag(e));
        window.addEventListener('mousemove', (e) => this.drag(e));
        window.addEventListener('mouseup', () => this.endDrag());
        stage.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });
        window.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
        window.addEventListener('touchend', () => this.endDrag());
        stage.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.adjustZoom(e.deltaY > 0 ? -0.2 : 0.2);
        }, { passive: false });
    },
    reset() {
        // Mobile scale back to 1.0 now that CSS constraints are better
        const isMobile = window.innerWidth <= 768;
        this.state = { scale: 1, rotX: 0, rotY: 0 };
        this.updateTransform();
    },
    startDrag(e) {
        if (e.target.closest('button')) return;
        e.preventDefault();
        this.state.isDragging = true;
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        this.state.startX = clientX; this.state.startY = clientY;
        this.state.currentRotX = this.state.rotX; this.state.currentRotY = this.state.rotY;
        const stage = document.getElementById('viewer-stage');
        if (stage) stage.style.cursor = 'grabbing';
    },
    drag(e) {
        if (!this.state.isDragging) return;
        e.preventDefault();
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        this.state.rotY = this.state.currentRotY + (clientX - this.state.startX) * 0.5;
        this.state.rotX = this.state.currentRotX - (clientY - this.state.startY) * 0.5;
        this.updateTransform();
    },
    endDrag() {
        this.state.isDragging = false;
        const stage = document.getElementById('viewer-stage');
        if (stage) stage.style.cursor = 'grab';
    },
    adjustZoom(delta) {
        this.state.scale = Math.max(0.5, Math.min(3.0, this.state.scale + delta));
        this.updateTransform();
    },
    updateTransform() {
        const wrapper = document.getElementById('viewer-card-wrapper');
        if (!wrapper) return;
        wrapper.style.transform = `scale(${this.state.scale}) rotateX(${this.state.rotX}deg) rotateY(${this.state.rotY}deg)`;
        const zoomVal = document.getElementById('zoom-val');
        if (zoomVal) zoomVal.innerText = Math.round(this.state.scale * 100) + '%';
    }
};

const System = {
    lang: 'en', loginTimer: null, assistantIdx: 0, assistantSteps: [], isTutorialComplete: false, assistantDragging: false, briefImgIdx: 0, isLoggingIn: false,

    briefImages: [],

    init() {
        this.briefImages = DB.BRIEF_IMAGES; // Load from DB
        this.initSecurity(); // THEATRICAL SECURITY PROTOCOL
        this.registerServiceWorker(); // OPTIMIZATION: SERVICE WORKER
        AudioManager.init();
        this.setupDrag();
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

        if (window.lucide) {
            console.log("[System] Lucide Icons Loaded");
            lucide.createIcons();
        } else {
            console.warn("[System] Lucide Failed to Load");
        }
        this.renderGrid();
        this.setLanguage('en');

        // REPLACED OLD LOADER WITH THEATRICAL BOOT SEQUENCE
        this.runBootSequence();
    },

    hardReset: async () => {
        if (!confirm("FORCE SYSTEM REBOOT? This will clear local cache and reload.")) return;

        console.log("INITIATING HARD RESET...");

        // 1. Unregister Service Workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
                console.log("Service Worker Unregistered");
            }
        }

        // 2. Delete Cache Storage
        if ('caches' in window) {
            const keys = await caches.keys();
            for (const key of keys) {
                await caches.delete(key);
                console.log("Cache Deleted:", key);
            }
        }

        // 3. Force Reload
        window.location.reload(true);
    },

    runBootSequence() {
        const loader = document.getElementById('system-loader');
        if (!loader) return;

        // Remove spinner if it exists
        const spinner = loader.querySelector('.loader-spinner');
        if (spinner) spinner.remove();

        // Create console container
        const term = document.createElement('div');
        term.className = 'boot-console';
        loader.appendChild(term);
        loader.querySelector('.loader-text').remove(); // Remove old text logic

        const logs = [
            { text: "> SYSTEM KERNEL ... OK", delay: 100 },
            { text: "> LOADING DRIVERS ... OK", delay: 300 },
            { text: "> CHECKING MEMORY ... 64TB OK", delay: 400 },
            { text: "> ESTABLISHING SECURE CONNECTION...", delay: 800 },
            { text: "> ENCRYPTING TRAFFIC ... [AES-4096]", delay: 1100 },
            { text: "> CONNECTED TO DISTORTION_NET", delay: 1500 },
            { text: "> ACCESS GRANTED.", delay: 1800, color: "var(--terminal-green)" }
        ];

        let totalDelay = 0;
        logs.forEach(log => {
            setTimeout(() => {
                const line = document.createElement('div');
                line.className = 'boot-line';
                line.innerText = log.text;
                if (log.color) line.style.color = log.color;
                term.appendChild(line);
                AudioManager.play('click');
            }, log.delay);
            totalDelay = Math.max(totalDelay, log.delay);
        });

        // Fade out
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }, totalDelay + 800);
    },

    updateCountdowns() {
        const now = new Date().getTime();
        const labels = DB.TRANSLATIONS[this.lang];
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

        DB.EVENTS.forEach(evt => {
            const time = new Date(evt.time).getTime();
            updateElement(evt.id, time);
        });
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
            else { clearInterval(typeInterval); setTimeout(() => this.login(), 400); }
        }, 60);
    },

    // --- THEATRICAL SECURITY ---
    initSecurity() {
        // 1. Console Warning
        this.showConsoleWarning();

        // 2. Input Lockdown (Right Click & F12)
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.triggerSecurityAlert("UNAUTHORIZED_ACCESS_ATTEMPT");
        });

        document.addEventListener('keydown', (e) => {
            // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            if (e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
                this.triggerSecurityAlert("DEBUGGING_INTERFACE_LOCKED");
            }
        });
    },

    showConsoleWarning() {
        const style1 = "color: #ff0000; font-size: 40px; font-weight: bold; -webkit-text-stroke: 1px black;";
        const style2 = "color: #00ff00; font-size: 20px; font-family: monospace;";
        console.log("%c STOP! %c\n\n> GOVERNMENT TERMINAL DETECTED.\n> UNAUTHORIZED DEBUGGING IS A CLASS-A FELONY.\n> IP ADDRESS HAS BEEN LOGGED.", style1, style2);
    },



    // --- SERVICE WORKER REGISTRATION ---
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            // MOVED TO ROOT: Now standard /sw.js path works everywhere without headers
            navigator.serviceWorker.register('/sw.js')
                .then(reg => {
                    console.log('[System] Service Worker Registered', reg);

                    // Check for updates
                    reg.onupdatefound = () => {
                        const installingWorker = reg.installing;
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New update available
                                this.triggerUpdateToast();
                            }
                        };
                    };
                })
                .catch(err => console.error('[System] SW Registration Failed', err));
        }
    },

    triggerUpdateToast() {
        const toast = document.createElement('div');
        toast.className = 'security-toast'; // Reuse existing style
        toast.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="window.location.reload()">
                <i data-lucide="refresh-cw" width="24" color="var(--terminal-green)"></i>
                <div>
                    <div style="color:var(--terminal-green); font-weight:bold;">SYSTEM UPDATE AVAILABLE</div>
                    <div style="font-size:0.8rem;">> CLICK TO REBOOT SYSTEM</div>
                </div>
            </div>
        `;
        document.body.appendChild(toast);
        if (window.lucide) lucide.createIcons({ root: toast });
        setTimeout(() => toast.classList.add('visible'), 100);
    },
    // -----------------------------------

    triggerSecurityAlert(code) {
        AudioManager.play('hiss'); // Use hiss as error sound
        const toast = document.createElement('div');
        toast.className = 'security-toast';
        toast.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <i data-lucide="shield-alert" width="24" color="red"></i>
                <div>
                    <div style="color:red; font-weight:bold;">SECURITY ALERT</div>
                    <div style="font-size:0.8rem; letter-spacing:1px;">${code}</div>
                </div>
            </div>
        `;
        document.body.appendChild(toast);
        if (window.lucide) lucide.createIcons({ root: toast });

        // Animation
        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },
    // ---------------------------

    checkMobile() {
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('is-mobile', isMobile);
        this.updateModeButtons(); this.updateScaleButtons();
    },

    toggleMode() { document.body.classList.toggle('is-mobile'); this.updateModeButtons(); AudioManager.play('click'); },
    toggleUIScale() { document.body.classList.toggle('ui-large'); this.updateScaleButtons(); AudioManager.play('click'); },

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
        document.querySelectorAll('.mode-switch-btn').forEach(btn => {
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
        this.renderGrid(); this.renderEmployees(); this.updateCountdowns();
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
        AudioManager.play('click');
    },

    login() {
        if (this.isLoggingIn) return;
        this.isLoggingIn = true;
        if (this.loginTimer) clearTimeout(this.loginTimer);
        const wrapper = document.getElementById('login-wrapper');
        const inputVal = document.getElementById('login-input').value; // Security: Get value
        const msg = document.getElementById('login-message');
        const labels = DB.TRANSLATIONS[this.lang];

        // --- SECURITY: INPUT VALIDATION ---
        // Only allow letters and numbers. No symbols. No scripts.
        const safePattern = /^[a-zA-Z0-9]*$/;
        if (!safePattern.test(inputVal)) {
            // "Theatrical" Rejection
            AudioManager.play('hiss');
            wrapper.classList.add('error-shake');
            msg.style.opacity = '1';
            msg.innerText = "> ERROR: ILLEGAL CHARACTERS DETECTED";
            msg.style.color = "var(--glitch-red)";
            setTimeout(() => {
                wrapper.classList.remove('error-shake');
                msg.style.opacity = '0';
            }, 1000);
            this.isLoggingIn = false; // Reset lock
            return; // STOP EXECUTION
        }

        wrapper.classList.add('focused');
        msg.style.opacity = '1'; msg.innerText = labels.login_verifying;
        AudioManager.play('login');
        setTimeout(() => {
            msg.innerText = labels.access_granted; msg.style.color = "var(--terminal-green)";
            setTimeout(() => {
                document.getElementById('login-screen').classList.add('zoom-out');
                setTimeout(() => {
                    document.getElementById('login-screen').style.display = 'none';
                    document.getElementById('desktop-screen').classList.add('active');
                    setTimeout(() => WindowManager.open('win-overview'), 500);
                    this.initAssistant();
                }, 800);
            }, 1000);
        }, 800);
    },

    toggleRotation() { document.getElementById('app-container').classList.toggle('rotated'); AudioManager.play('click'); },

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
            document.getElementById('login-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') System.login(); });
        }
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            const winId = icon.getAttribute('data-window');
            if (winId) icon.onclick = () => WindowManager.open(winId);
        });
    },

    setupDrag() {
        let isDragging = false, currentWindow = null, dx = 0, dy = 0;
        const start = (e) => {
            const win = e.target.closest('.os-window');
            if (!win || !e.target.closest('.window-header') || e.target.closest('.win-controls')) return;
            isDragging = true; currentWindow = win; WindowManager.bringToFront(win);
            const cx = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const cy = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            const rect = win.getBoundingClientRect(); dx = cx - rect.left; dy = cy - rect.top;
        };
        const move = (e) => {
            if (!isDragging) return;
            const cx = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const cy = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            currentWindow.style.left = (cx - dx) + 'px'; currentWindow.style.top = (cy - dy) + 'px';
        };
        const end = () => { isDragging = false; };
        document.addEventListener('mousedown', start); document.addEventListener('touchstart', start, { passive: false });
        document.addEventListener('mousemove', move); document.addEventListener('touchmove', move, { passive: false });
        document.addEventListener('mouseup', end); document.addEventListener('touchend', end);
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
            this.assistantIdx = 0; // Reset index
            overlay.classList.add('active');
            this.assistantSteps = DB.TRANSLATIONS[this.lang].assistant_steps;
            this.showBubble(this.assistantSteps[0]);

            // Ensure controls are visible in case they were hidden
            const controls = overlay.querySelector('.assistant-controls');
            if (controls) controls.style.display = 'flex';
            WindowManager.open('win-overview'); // Start with Overview

            if (this.chatterInterval) clearInterval(this.chatterInterval);
        }
    },
    nextAssistantStep() {
        this.assistantIdx++;
        if (this.assistantIdx < this.assistantSteps.length) {
            this.setAssistantText(this.assistantSteps[this.assistantIdx]);

            // Onboarding Flow Logic
            if (this.assistantIdx === 2) {
                // Show Employees
                WindowManager.close('win-overview');
                setTimeout(() => WindowManager.open('win-employees'), 300);
            } else if (this.assistantIdx === 3) {
                // Show Archive
                WindowManager.close('win-employees');
                setTimeout(() => WindowManager.open('win-archive'), 300);
            } else if (this.assistantIdx === 4) {
                // Show Shop
                WindowManager.close('win-archive');
                setTimeout(() => WindowManager.open('win-shop'), 300);
            } else if (this.assistantIdx === 5) {
                // Show Communication
                WindowManager.close('win-shop');
                setTimeout(() => WindowManager.open('win-comm'), 300);
            }
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
        // Chatter check every 20 seconds
        this.chatterInterval = setInterval(() => {
            // 50% chance to speak
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

        // Reset Loader
        const bar = document.getElementById('archive-loader-bar');
        const txt = document.getElementById('archive-status-text');
        const pct = document.getElementById('archive-progress-percent');
        const labels = DB.TRANSLATIONS[this.lang];

        let loaded = 0, total = 0;

        if (bar) bar.style.width = '0%';
        if (txt) txt.innerText = labels.archive_status ? labels.archive_status.replace('COMPLETE', 'IN PROGRESS') : ">LOADING ASSETS... IN PROGRESS";
        if (pct) pct.innerText = "0%";

        const updateProgress = () => {
            loaded++;
            const percent = Math.floor((loaded / total) * 100);
            if (bar) bar.style.width = `${percent}%`;
            if (pct) pct.innerText = `${percent}%`;

            if (loaded >= total) {
                if (txt) txt.innerText = labels.archive_status ? labels.archive_status.replace('COMPLETE', 'COMPLETE') : ">LOADING ASSETS... COMPLETE";
                if (pct) pct.innerText = "100%";
                if (pct) pct.style.color = "var(--terminal-green)";
            }
        };

        // Update Button State
        if (clickedBtn) {
            document.querySelectorAll('.archive-btn').forEach(b => b.classList.remove('active'));
            clickedBtn.classList.add('active');
        }

        if (sortType === 'all') {
            // --- SHOW ALL VARIANTS ---
            let variants = [...DB.EMPLOYEES];
            variants.sort((a, b) => a.cardId - b.cardId);
            total = variants.length;

            variants.forEach(variant => {
                const parent = DB.CARDS.find(c => c.id === variant.cardId);
                if (!parent) return;

                const el = document.createElement('div');
                el.className = 'card-file';

                // Optimization: Lazy Loading + Async Decoding
                const img = new Image();
                img.loading = "lazy";
                img.decoding = "async";
                img.src = variant.variantImage;
                img.className = "img-loaded";
                img.onload = updateProgress;
                img.onerror = updateProgress;
                el.appendChild(img);

                // Fix: Use appendChild to avoid destroying img listener with innerHTML+=
                const label = document.createElement('div');
                label.className = 'file-label';
                label.innerHTML = `
                    <div style="font-size:0.7em;color:var(--gold-dim);margin-bottom:2px;">${parent.title[this.lang]}</div>
                    ${variant.char[this.lang]}
                `;
                el.appendChild(label);

                el.onclick = () => this.openViewer(parent, variant);
                grid.appendChild(el);
            });
        } else {
            // --- SHOW CATEGORIES (DEFAULT) ---
            let cards = [...DB.CARDS];
            if (sortType === 'name') cards.sort((a, b) => a.title[this.lang].localeCompare(b.title[this.lang]));
            else cards.sort((a, b) => a.id - b.id);
            total = cards.length;

            cards.forEach(card => {
                const el = document.createElement('div');
                el.className = 'card-file';

                const img = new Image();
                img.loading = "lazy";
                img.decoding = "async";
                img.src = card.image;
                img.className = "img-loaded";
                img.onload = updateProgress;
                img.onerror = updateProgress;
                el.appendChild(img);

                const label = document.createElement('div');
                label.className = 'file-label';
                label.innerText = card.title[this.lang];
                el.appendChild(label);

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
            document.getElementById('selector-title').innerText = `SELECT: ${card.title[this.lang]}`;

            variants.forEach(v => {
                const div = document.createElement('div'); div.className = 'variant-card';
                div.innerHTML = `<div class="variant-img-box"><img src="${v.variantImage}"></div><div class="variant-info"><div class="variant-char">${v.char[this.lang]}</div><div class="variant-artist">ARTIST: ${v.artist}</div></div>`;
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
                        <div style="color:var(--terminal-green);font-size:0.9rem;">CHARACTER</div>
                        <div style="color:white;font-size:1.8rem;margin-bottom:8px;">${variant.char[this.lang]}</div>
                        <div style="color:var(--gold-dim);font-size:0.8rem;">ILLUSTRATOR</div>
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
    },


};

/* --- GLOBAL ERROR HANDLER --- */
window.onerror = function (msg, url, line, col, error) {
    console.error("CRITICAL SYSTEM FAILURE DETECTED:", msg);

    // Display error on screen for debugging
    const errorBox = document.createElement('div');
    errorBox.style.position = 'fixed';
    errorBox.style.top = '0';
    errorBox.style.left = '0';
    errorBox.style.width = '100%';
    errorBox.style.background = 'rgba(255, 0, 0, 0.9)';
    errorBox.style.color = 'white';
    errorBox.style.padding = '20px';
    errorBox.style.zIndex = '999999';
    errorBox.style.fontFamily = 'monospace';
    errorBox.style.fontSize = '16px';
    errorBox.style.whiteSpace = 'pre-wrap';
    errorBox.innerHTML = '<strong>CRITICAL ERROR:</strong><br>' + msg + '<br><br>Line: ' + line + '<br>Column: ' + col;

    document.body.appendChild(errorBox);

    return false;
};

document.addEventListener('DOMContentLoaded', () => System.init());

