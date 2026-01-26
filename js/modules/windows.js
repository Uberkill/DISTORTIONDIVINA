
import { AudioManager } from './audio.js';

export const WindowManager = {
    zIndex: 30000, // Start above overlays (9999) and loader (20000)
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
                // SMART POSITIONING: Check if window is off-screen
                const rect = win.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                // Check if the window is currently off-screen (e.g. from a previous session on a larger screen)
                // Use computed style because rect might be 0 if display is none
                const style = window.getComputedStyle(win);
                const currentLeft = parseFloat(style.left) || 0;
                const currentTop = parseFloat(style.top) || 0;

                // Heuristic: If top is negative or left is way off
                // Since we don't know exact width if hidden, we assume a safe zone

                // Simply default to Center if it has no manual position set OR if it seems weird
                // But to persist positions, we trust the browser unless it's obviously bad.
                // Actually, the safest "Smart Open" is to just respect strict bounds if they are set.

                // If it's the first open (no inline style), it defaults to CSS center.
                // If it has inline style, check it.
                if (win.style.left && win.style.top) {
                    // It has a saved position. Validate it.
                    const headerHeight = 50;
                    if (currentTop < 0 || currentTop > viewportHeight - headerHeight ||
                        currentLeft < -200 || currentLeft > viewportWidth - 50) {
                        // Reset to center
                        win.style.top = '50%';
                        win.style.left = '50%';
                        win.style.transform = 'translate(-50%, -50%)';
                    }
                } else {
                    // No saved position, ensure center
                    win.style.top = '50%';
                    win.style.left = '50%';
                    win.style.transform = 'translate(-50%, -50%)';
                }
            }

            win.style.display = 'flex';
            this.bringToFront(win);
            win.classList.remove('minimized');
            requestAnimationFrame(() => win.classList.add('window-open'));
            AudioManager.play('click');
            if (window.lucide) lucide.createIcons({ root: win });

            // Dispatch event for other modules to react
            document.dispatchEvent(new CustomEvent('window-opened', { detail: { id } }));
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
