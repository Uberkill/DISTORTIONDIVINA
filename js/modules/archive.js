import { DB } from './data.js';
import { EventBus } from './event_bus.js';
import { I18n } from './i18n.js';
import { WindowManager } from './windows.js';
import { Viewer3D } from './viewer.js';

export const ArchiveSystem = {
    init() {
        // Listen for requests to render the grid (from UI buttons)
        EventBus.subscribe('action:render-grid', (data) => {
            this.renderGrid(data.sort, data.target);
        });

        // Re-render when language changes
        EventBus.subscribe('language-changed', () => {
            this.renderGrid('all'); // Or maintain current sort state
        });
    },

    renderGrid(sortType = 'id', clickedBtn = null) {
        const grid = document.getElementById('cardGrid');
        if (!grid) return;

        grid.innerHTML = '';
        const lang = I18n.getCurrentLang();

        // Update Button State
        const buttons = document.querySelectorAll('.archive-btn');
        if (clickedBtn) {
            buttons.forEach(b => b.classList.remove('active'));
            clickedBtn.classList.add('active');
        } else {
            // Programmatic update
            buttons.forEach(b => b.classList.remove('active'));
            let targetKey = 'btn_view_all'; 
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
                el.innerHTML = `
                            <img src="${variant.img}" class="img-loaded" loading="lazy" decoding="async">
                            <div class="file-label">
                                <div style="font-size:0.7em;color:var(--gold-dim);margin-bottom:2px;">${parent.arcana}</div>
                                ${variant.charName[lang] || variant.charName.en}
                            </div>`;

                el.onclick = () => this.openViewer(parent, variant);
                grid.appendChild(el);
            });
        } else {
            // --- SHOW CATEGORIES (DEFAULT) ---
            let cards = [...DB.CARDS];
            if (sortType === 'name') cards.sort((a, b) => a.title[lang].localeCompare(b.title[lang]));
            else cards.sort((a, b) => a.id - b.id);

            cards.forEach(card => {
                const el = document.createElement('div'); el.className = 'card-file';
                el.innerHTML = `<img src="${card.coverImg}" class="img-loaded" loading="lazy" decoding="async"><div class="file-label">${card.title[lang]}</div>`;
                el.onclick = () => this.openSelector(card);
                grid.appendChild(el);
            });
        }
    },

    openSelector(card) {
        const lang = I18n.getCurrentLang();
        const variants = DB.EMPLOYEES.filter(e => e.cardId === card.id);
        
        if (variants.length > 1) {
            const grid = document.getElementById('selector-grid'); 
            if(!grid) return;
            
            grid.innerHTML = '';
            document.getElementById('selector-title').innerText = `${card.title[lang]} // RECORDS`;
            
            variants.forEach(v => {
                const div = document.createElement('div'); div.className = 'variant-card';
                div.innerHTML = `<div class="variant-img-box"><img src="${v.img}" loading="lazy" decoding="async"></div><div class="variant-info"><div class="variant-char">${v.charName[lang] || v.charName.en}</div><div class="variant-artist">${I18n.get('ui_artist') || 'ARTIST'}: ${v.artist}</div></div>`;
                div.onclick = () => { WindowManager.close('win-selector'); this.openViewer(card, v); };
                grid.appendChild(div);
            });
            WindowManager.open('win-selector');
        } else {
            // Fallback for single variant
            this.openViewer(card, variants[0] || null);
        }
    },

    openViewer(card, variant = null) {
        Viewer3D.open(card, variant);
    }
};
