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

        // Update Button State & Disable while loading
        const buttons = document.querySelectorAll('.archive-btn');
        buttons.forEach(b => {
            b.classList.remove('active');
            b.disabled = true; // Disable state while rendering
        });

        if (clickedBtn) {
            clickedBtn.classList.add('active');
        } else {
            // Programmatic update
            let targetKey = 'btn_view_all'; 
            if (sortType === 'id') targetKey = 'btn_sort_tarot';
            if (sortType === 'name') targetKey = 'btn_sort_name';

            const targetBtn = Array.from(buttons).find(b => b.getAttribute('data-i18n') === targetKey);
            if (targetBtn) targetBtn.classList.add('active');
        }

        // Helper to create stateful card elements
        const createCard = (imgSrc, labelHtml, onClick) => {
            const el = document.createElement('div');
            el.className = 'card-file is-loading';
            
            const img = document.createElement('img');
            img.src = imgSrc;
            img.className = 'img-loaded';
            img.loading = 'lazy';
            img.decoding = 'async';
            
            img.onload = () => el.classList.remove('is-loading');
            img.onerror = () => {
                el.classList.remove('is-loading');
                el.classList.add('is-error');
            };
            
            const label = document.createElement('div');
            label.className = 'file-label text-truncate';
            label.innerHTML = labelHtml;
            
            el.appendChild(img);
            el.appendChild(label);
            el.onclick = onClick;
            return el;
        };

        if (sortType === 'all') {
            // --- SHOW ALL VARIANTS ---
            let variants = [...DB.EMPLOYEES];
            variants.sort((a, b) => a.cardId - b.cardId); // Keep tarot order

            if (variants.length === 0) {
                grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">!</div><div>NO DATA FOUND</div></div>';
            } else {
                variants.forEach(variant => {
                    const parent = DB.CARDS.find(c => c.id === variant.cardId);
                    if (!parent) return;

                    const labelHtml = `<div class="text-truncate" style="font-size:0.7em;color:var(--gold-dim);margin-bottom:2px;">${parent.title[lang]}</div><div class="text-truncate">${variant.char[lang] || variant.char.en}</div>`;
                    grid.appendChild(createCard(variant.variantImage, labelHtml, () => this.openViewer(parent, variant)));
                });
            }
        } else {
            // --- SHOW CATEGORIES (DEFAULT) ---
            let cards = [...DB.CARDS];
            if (sortType === 'name') cards.sort((a, b) => a.title[lang].localeCompare(b.title[lang]));
            else cards.sort((a, b) => a.id - b.id);

            if (cards.length === 0) {
                grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">!</div><div>NO DATA FOUND</div></div>';
            } else {
                cards.forEach(card => {
                    grid.appendChild(createCard(card.image, card.title[lang], () => this.openSelector(card)));
                });
            }
        }

        // Re-enable buttons after rendering is dispatched
        setTimeout(() => {
            buttons.forEach(b => b.disabled = false);
        }, 100);
    },

    openSelector(card) {
        const lang = I18n.getCurrentLang();
        const variants = DB.EMPLOYEES.filter(e => e.cardId === card.id);
        
        if (variants.length > 1) {
            const grid = document.getElementById('selector-grid'); 
            if(!grid) return;
            
            grid.innerHTML = '';
            document.getElementById('selector-title').innerText = `${I18n.get('selector_prefix') || ''}${card.title[lang]}`;
            
            variants.forEach(v => {
                const div = document.createElement('div'); div.className = 'variant-card is-loading';
                
                const img = document.createElement('img');
                img.src = v.variantImage;
                img.loading = 'lazy';
                img.decoding = 'async';
                img.onload = () => div.classList.remove('is-loading');
                img.onerror = () => { div.classList.remove('is-loading'); div.classList.add('is-error'); };

                const info = document.createElement('div');
                info.className = 'variant-info text-truncate';
                info.innerHTML = `<div class="variant-char text-truncate">${v.char[lang] || v.char.en}</div><div class="variant-artist text-truncate">${I18n.get('viewer_illus_label') || 'ARTIST'}: ${v.artist}</div>`;
                
                const imgBox = document.createElement('div'); imgBox.className = 'variant-img-box';
                imgBox.appendChild(img);
                div.appendChild(imgBox);
                div.appendChild(info);
                
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
