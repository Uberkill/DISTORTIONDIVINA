const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'js', 'modules', 'divination_v4.js');
let code = fs.readFileSync(target, 'utf8');

const eventDelegationStr = `
        // Listen for language changes to re-render divination with new translations
        document.addEventListener('language-changed', () => {
            console.log('[Divination] Language changed, re-rendering');
            this.render();
        });

        // --- ROBUST EVENT DELEGATION FOR V4 ARCHITECTURE ---
        // By using event delegation on the document, we avoid memory leaks
        // and ensure events work even after the DOM is aggressively re-rendered.
        document.addEventListener('click', (e) => {
            if (!this.root || !this.root.contains(e.target)) return;

            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const action = btn.getAttribute('data-action');
            
            try {
                if (action === 'divination-random') this.randomReading();
                else if (action === 'divination-read') this.read();
                else if (action === 'divination-reset') this.reset();
                else if (action === 'divination-set-slot') this.setActiveSlot(Number(btn.dataset.slot));
                else if (action === 'divination-select-card') this.selectCard(btn.dataset.id);
            } catch (err) {
                console.error("[Divination] Error handling action:", action, err);
            }
        });

        document.addEventListener('mouseover', (e) => {
            if (!this.root || !this.root.contains(e.target)) return;
            const el = e.target.closest('[data-hover-highlight="highlight-slot"]');
            if (el) this.highlightSlot(Number(el.dataset.slot));
        });

        document.addEventListener('mouseout', (e) => {
            if (!this.root || !this.root.contains(e.target)) return;
            const el = e.target.closest('[data-leave-highlight="highlight-slot"]');
            if (el) this.highlightSlot(-1);
        });
`;

code = code.replace(
    /\/\/ Listen for language changes to re-render divination with new translations\s+document\.addEventListener\('language-changed', \(\) => \{\s+console\.log\('\[Divination\] Language changed, re-rendering'\);\s+this\.render\(\);\s+\}\);/,
    eventDelegationStr
);

fs.writeFileSync(target, code);
console.log('Event Delegation Patched for divination_v4.js');
