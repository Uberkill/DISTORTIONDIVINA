
import { AudioManager } from './audio.js';
import { EventBus } from './event_bus.js';
import { I18n } from './i18n.js';

import { WindowManager } from './windows.js';
import { Viewer3D } from './viewer.js';

import { DivinationSystem } from './divination_v4.js';

export const System = {
    assistantIdx: 0, assistantSteps: [], isTutorialComplete: false, assistantDragging: false, briefImgIdx: 0, 
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
        // Auto login is now in AuthSystem

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
        // Decoupled logic handled by EventBus / Init
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
        // labels dynamically requested
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

    checkMobile() {
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('is-mobile', isMobile);
        this.updateModeButtons(); this.updateScaleButtons();
    },

    toggleMode() { document.body.classList.toggle('is-mobile'); this.updateModeButtons(); try { AudioManager.play('click'); } catch (e) { } },
    toggleUIScale() { document.body.classList.toggle('ui-large'); this.updateScaleButtons(); try { AudioManager.play('click'); } catch (e) { } },

    updateScaleButtons() {
        const isLarge = document.body.classList.contains('ui-large');
        // labels dynamically requested
        document.querySelectorAll('.ui-scale-btn').forEach(btn => {
            btn.innerHTML = isLarge ? `<i data-lucide="zoom-out" width="18"></i> ${I18n.get('btn_scale_normal')}` : `<i data-lucide="zoom-in" width="18"></i> ${I18n.get('btn_scale_large')}`;
        });
        if (window.lucide) lucide.createIcons();
    },

    updateModeButtons() {
        const isMobile = document.body.classList.contains('is-mobile');
        // labels dynamically requested
        document.querySelectorAll('.mode-switch-btn[data-action="toggle-mode"]').forEach(btn => {
            btn.innerHTML = isMobile ? `<i data-lucide="smartphone" width="18"></i> ${I18n.get('ui_mode_mobile')}` : `<i data-lucide="monitor" width="18"></i> ${I18n.get('ui_mode_desktop')}`;
        });
        if (window.lucide) lucide.createIcons();
    },

    changeBriefImage(dir) {
        const imgEl = document.getElementById('brief-img-display');
        if (imgEl) imgEl.style.opacity = '0.3';
        this.briefImgIdx = (this.briefImgIdx + dir + this.briefImages.length) % this.briefImages.length;
        const imgData = this.briefImages[this.briefImgIdx];
        setTimeout(() => { if (imgEl) { imgEl.src = imgData.src; imgEl.onload = () => { imgEl.style.opacity = '1'; }; } }, 200);
        // labels dynamically requested
        if (document.getElementById('brief-caption-display') && I18n.get(imgData.key)) document.getElementById('brief-caption-display').innerText = I18n.get(imgData.key);
        if (document.getElementById('brief-img-counter')) document.getElementById('brief-img-counter').innerText = `[ ${this.briefImgIdx + 1} / ${this.briefImages.length} ]`;
        try { AudioManager.play('click'); } catch (e) { }
    },



    setupListeners() {
        // Global Click Delegation
        document.addEventListener('click', (e) => {
            // 1. Ripple Effect (Visuals)
            const rippleTarget = e.target.closest('button, .desktop-icon, .shop-link-btn, .win-btn, .lang-btn, .login-submit-btn, .mobile-btn, .assistant-btn, .archive-btn, .v-btn, .gallery-nav, .variant-card, .task-item');
            if (rippleTarget) {
                const circle = document.createElement("span");
                const diameter = Math.max(rippleTarget.clientWidth, rippleTarget.clientHeight);
                const radius = diameter / 2;
                const rect = rippleTarget.getBoundingClientRect();
                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${e.clientX - rect.left - radius}px`;
                circle.style.top = `${e.clientY - rect.top - radius}px`;
                circle.classList.add("ripple");
                const oldRipple = rippleTarget.getElementsByClassName("ripple")[0];
                if (oldRipple) oldRipple.remove();
                rippleTarget.appendChild(circle);
            }

            // 2. Data Action Routing (Logic)
            const actionTarget = e.target.closest('[data-action]');
            if (actionTarget) {
                const action = actionTarget.getAttribute('data-action');
                switch (action) {
                    case 'toggle-ui-scale': this.toggleUIScale(); break;
                    case 'toggle-mode': this.toggleMode(); break;
                    case 'set-language':
                        AudioManager.play('click');
                        EventBus.publish('action:set-language', actionTarget.getAttribute('data-lang'));
                        break;
                    case 'login': EventBus.publish('action:login'); break;
                    case 'reset-layout': this.resetLayout(); break;
                    case 'close-window': WindowManager.close(actionTarget.getAttribute('data-target')); break;
                    case 'minimize-window': WindowManager.minimize(actionTarget.getAttribute('data-target')); break;
                    case 'maximize-window': WindowManager.toggleMaximize(actionTarget.getAttribute('data-target')); break;
                    case 'switch-window':
                        WindowManager.close(actionTarget.getAttribute('data-close'));
                        WindowManager.open(actionTarget.getAttribute('data-open'));
                        AudioManager.play('click');
                        break;
                    case 'change-brief-image':
                        e.preventDefault();
                        e.stopPropagation();
                        this.changeBriefImage(parseInt(actionTarget.getAttribute('data-dir')));
                        break;
                    case 'render-grid':
                        EventBus.publish('action:render-grid', { sort: actionTarget.getAttribute('data-sort'), target: actionTarget });
                        break;

                    // Viewer Actions
                    case 'viewer-zoom': Viewer3D.adjustZoom(parseFloat(actionTarget.getAttribute('data-zoom'))); break;
                    case 'viewer-reset': Viewer3D.reset(); break;

                    // Assistant Actions
                    case 'assistant-close-perm': this.permanentlyCloseAssistant(); break;
                    case 'assistant-next': this.nextAssistantStep(); break;
                    case 'assistant-close': this.closeAssistant(); break;

                    // WindowManager Base Actions
                    case 'show-desktop': WindowManager.showDesktop(); break;

                    // Sound Actions
                    case 'play-sound': AudioManager.play(actionTarget.getAttribute('data-sound')); break;

                    // Divination Actions (Dynamically routed to prevent strict coupling)
                    case 'divination-set-slot':
                        DivinationSystem.setActiveSlot(parseInt(actionTarget.getAttribute('data-slot')));
                        break;
                    case 'divination-random':
                        DivinationSystem.randomReading();
                        break;
                    case 'divination-clear-search':
                        DivinationSystem.setSearchQuery('');
                        break;
                    case 'divination-select-card':
                        DivinationSystem.selectCard(actionTarget.getAttribute('data-card'));
                        break;
                    case 'divination-reset':
                        DivinationSystem.reset();
                        break;
                    case 'divination-reveal-resonance':
                        if (window.DivinationSystem) {
                            const container = actionTarget.closest('.resonate-content') || document.querySelector('.resonate-content');
                            if (container) window.DivinationSystem.revealResonance(container);
                        }
                        break;
                }
            }
        });

        // Global Mouseover Routing
        document.addEventListener('mouseover', (e) => {
            const hoverSoundTarget = e.target.closest('[data-hover-sound]');
            if (hoverSoundTarget && hoverSoundTarget.getAttribute('data-hover-sound') === 'hover') {
                AudioManager.play('hover');
            }

            const hoverHighlight = e.target.closest('[data-hover-highlight]');
            if (hoverHighlight) {
                const action = hoverHighlight.getAttribute('data-hover-highlight');
                const slot = parseInt(hoverHighlight.getAttribute('data-slot'));
                if (action === 'highlight-slot' && DivinationSystem) {
                    DivinationSystem.highlightSlot(slot);
                } else if (action === 'highlight-body' && DivinationSystem) {
                    DivinationSystem.highlightBodyPoint(slot);
                }
            }
        });

        // Global Mouseout Routing
        document.addEventListener('mouseout', (e) => {
            const leaveHighlight = e.target.closest('[data-leave-highlight]');
            if (leaveHighlight) {
                const action = leaveHighlight.getAttribute('data-leave-highlight');
                if (action === 'highlight-slot' && DivinationSystem) {
                    DivinationSystem.highlightSlot(-1);
                } else if (action === 'highlight-body' && DivinationSystem) {
                    DivinationSystem.highlightBodyPoint(DivinationSystem.state.activeSlotIndex);
                }
            }
        });

        // Global Keydown Routing
        document.addEventListener('keydown', (e) => {
            // Login Enter Handling
            if (e.target.id === 'login-input' && e.key === 'Enter') {
                EventBus.publish('action:login');
            }

            // Keyboard accessibility for divinations (Enter / Space)
            if (e.key === 'Enter' || e.key === ' ') {
                const actionTarget = e.target.closest('[data-action="divination-set-slot"]');
                if (actionTarget) {
                    e.preventDefault();
                    DivinationSystem.setActiveSlot(parseInt(actionTarget.getAttribute('data-slot')));
                }
                const cardTarget = e.target.closest('[data-action="divination-select-card"]');
                if (cardTarget) {
                    e.preventDefault();
                    DivinationSystem.selectCard(cardTarget.getAttribute('data-card'));
                }
            }
        });

        // Desktop Icons logic (Replaces explicit window binding loop in HTML)
        document.addEventListener('click', (e) => {
            const icon = e.target.closest('.desktop-icon');
            if (icon) {
                const winId = icon.getAttribute('data-window');
                if (winId) {
                    WindowManager.open(winId);
                }
            }
        });

        // ASSISTANT ICON - Special handler to open OOBOT (no window)
        document.addEventListener('click', (e) => {
            const assistantIcon = e.target.closest('.desktop-icon.assistant-icon');
            if (assistantIcon) {
                const overlay = document.getElementById('assistant-overlay');
                if (overlay) {
                    overlay.style.display = 'flex';
                    overlay.classList.add('active');

                    // Properly initialize state
                    this.assistantIdx = 0;
                    this.assistantSteps = I18n.get('assistant_steps');
                    this.setAssistantText(this.assistantSteps[0]);

                    // Show controls for tutorial
                    const controls = overlay.querySelector('.assistant-controls');
                    if (controls) controls.style.display = 'flex';
                }
                AudioManager.play('click');
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

    getRandomCatLine() { return I18n.get('cat_lines')[Math.floor(Math.random() * I18n.get('cat_lines').length)]; },
    setAssistantText(msg) { if (document.getElementById('assistant-text')) document.getElementById('assistant-text').innerText = msg; },

    initAssistant() {
        // Always init - removed localStorage check that was causing issues
        setTimeout(() => {
            this.openAssistant();
            // Open overview window for tutorial flow only
            WindowManager.open('win-overview');
        }, 2000);
    },

    openAssistant() {
        const overlay = document.getElementById('assistant-overlay');
        if (overlay) {
            // Force show in case it was hidden
            overlay.style.display = 'flex';
            overlay.classList.add('active');

            this.assistantIdx = 0;
            this.assistantSteps = I18n.get('assistant_steps');
            this.showBubble(this.assistantSteps[0]);

            const controls = overlay.querySelector('.assistant-controls');
            if (controls) controls.style.display = 'flex';

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
        const overlay = document.getElementById('assistant-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.style.display = 'none'; // Remove inline style set by openAssistant
            if (this.chatterInterval) clearInterval(this.chatterInterval);
        }
    },

    permanentlyCloseAssistant() {
        const overlay = document.getElementById('assistant-overlay');
        if (overlay) {
            // Play goodbye sound
            AudioManager.play('hiss');

            // Clear any intervals
            if (this.chatterInterval) clearInterval(this.chatterInterval);

            // Close it - remove both class and inline style
            overlay.classList.remove('active');
            overlay.style.display = 'none'; // Remove inline style set by openAssistant
        }
    },

    openSelector(card) {
        const variants = DB.EMPLOYEES.filter(e => e.cardId === card.id);
        if (variants.length > 1) {
            const grid = document.getElementById('selector-grid'); grid.innerHTML = '';
            // labels dynamically requested
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
        Viewer3D.reset(); // labels dynamically requested
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
