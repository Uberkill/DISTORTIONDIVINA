
import { DB } from './data.js?v=nuclear';
import { AudioManager } from './audio.js';
import { I18n } from './i18n.js';

const STATE_VERSION = 2; // Increment this to force localStorage clear

export const DivinationSystem = {
    state: {
        version: STATE_VERSION,
        slots: [null, null, null, null, null],
        activeSlotIndex: 0,
        searchQuery:"",
        isComplete: false
    },

    init: function () {
        this.root = document.getElementById('divination-root');
        if (!this.root) return;

        // Load saved state if exists
        if (this.loadState()) {
            this.render();
            // If complete, ensure we show the results
            if (this.state.isComplete) {
                setTimeout(() => this.runTypewriterEffect(), 500);
            }
        } else {
            this.showBootSequence();
        }

        
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

    },

    saveState: function () {
        try {
            const stateToSave = {
                slots: this.state.slots,
                activeSlotIndex: this.state.activeSlotIndex,
                isComplete: this.state.isComplete,
                viewMode: this.state.viewMode
            };
            localStorage.setItem('divination_state', JSON.stringify(stateToSave));
        } catch (e) {
            console.warn("Failed to save state:", e);
        }
    },

    loadState: function () {
        try {
            const saved = localStorage.getItem('divination_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Check version - if mismatch, clear old state
                if (parsed.version !== STATE_VERSION) {
                    console.log('State version mismatch, clearing old state');
                    localStorage.removeItem('divination_state');
                    return false;
                }
                this.state = { ...this.state, ...parsed };
                return true;
            }
        } catch (e) {
            console.warn("Failed to load state:", e);
        }
        return false;
    },

    showBootSequence: function () {
        // Boot Sequence Simulation
        let step = 0;
        const lang = I18n.getCurrentLang() || 'en';
        const steps = [
            DB.TRANSLATIONS[lang].divination_boot_init,
            DB.TRANSLATIONS[lang].divination_boot_connect,
            DB.TRANSLATIONS[lang].divination_boot_load,
            DB.TRANSLATIONS[lang].divination_boot_sync,
            DB.TRANSLATIONS[lang].divination_boot_ready
        ];

        const renderBoot = () => {
            if (step>= steps.length) {
                setTimeout(() => {
                    this.render();
                    AudioManager.play('confirm');
                }, 800);
                return;
            }

            this.root.innerHTML = `
                <div class="divination-scanlines"></div>
                <div class="divination-boot-screen">
                    <div class="boot-text">${steps[step]}</div>
                    <div class="divination-loader" style="width: ${step * 20}%; height: 2px; background: var(--gold-primary); margin-top: 10px;"></div>
                </div>
             `;
            AudioManager.play('click');
            step++;
            setTimeout(renderBoot, 400); // Fast boot
        };

        renderBoot();
    },

    reset: function () {
        this.state.slots = [null, null, null, null, null];
        this.state.activeSlotIndex = 0;
        this.state.searchQuery ="";
        this.state.isComplete = false;
        this.state.viewMode = 'story';
        if (this.state.typewriterIntervals) {
            this.state.typewriterIntervals.forEach(clearInterval);
            this.state.typewriterIntervals = [];
        }
        AudioManager.play('glitch'); // Glitch sound on reset
        this.saveState();
        this.render();
    },

    setSearchQuery: function (query) {
        this.state.searchQuery = query;
        this.renderSearchList(); // Optimization: only re-render list
    },

    setActiveSlot: function (index) {
        if (this.state.isComplete) return;
        this.state.activeSlotIndex = index;
        this.saveState();
        this.render();
        AudioManager.play('hover');

        // Highlight Body Point (Visual Sync)
        this.highlightBodyPoint(index);
    },

    highlightSlot: function (index) {
        document.querySelectorAll('.divination-slot').forEach(el => el.classList.remove('highlight'));
        if (index !== -1) {
            const slots = document.querySelectorAll('.divination-slot');
            if (slots[index]) slots[index].classList.add('highlight');
        }
    },

    highlightBodyPoint: function (activeIndex) {
        // ... (existing logic) ...
        // Reset all points
        document.querySelectorAll('.chakra-point').forEach(el => {
            el.classList.remove('active');
            el.classList.remove('filled');
        });

        // 1. Mark Filled Slots (Steady Glow)
        this.state.slots.forEach((slot, index) => {
            if (slot !== null) {
                const points = document.querySelectorAll(`.chakra-point[data-slot="${index}"]`);
                points.forEach(p => p.classList.add('filled'));
            }
        });

        // 2. Mark Active Slot (Pulsing)
        // If we are passing a specific index (like hover), that takes precedence as"active"
        if (activeIndex !== -1) {
            const points = document.querySelectorAll(`.chakra-point[data-slot="${activeIndex}"]`);
            points.forEach(p => {
                p.classList.remove('filled');
                p.classList.add('active');
            });
        }
    },

    selectCard: function (cardId) {
        const card = DB.DIVINATION_CARDS.find(c => c.id === cardId);
        if (!card) return;

        // Fill slot
        const newSlots = [...this.state.slots];
        newSlots[this.state.activeSlotIndex] = card;
        this.state.slots = newSlots;
        this.state.searchQuery ="";

        // Advance to next empty slot or finish
        const nextEmpty = newSlots.findIndex(s => s === null);
        if (nextEmpty === -1) {
            this.state.isComplete = true;
            this.state.activeSlotIndex = -1;
            AudioManager.play('confirm');
        } else {
            this.state.activeSlotIndex = nextEmpty;
            AudioManager.play('reveal') || AudioManager.play('click'); // Try reveal sound, fallback to click
        }

        this.saveState();
        this.render();
    },

    // Random Reading - Auto-fill with 5 random cards
    randomReading: function () {
        // Get all available cards
        const allCards = [...DB.DIVINATION_CARDS];

        // Shuffle and pick 5 random cards
        const shuffled = allCards.sort(() => Math.random() - 0.5);
        const randomCards = shuffled.slice(0, 5);

        // Fill all slots
        this.state.slots = randomCards;
        this.state.isComplete = true;
        this.state.activeSlotIndex = -1;

        AudioManager.play('confirm');
        this.saveState();
        this.render();
    },



    // Calculate EGO Score (0 = Distortion, 100 = Awakening)
    calculateEGO: function () {
        const slots = this.state.slots;
        if (slots.every(s => s === null)) return 50; // Neutral start

        let score = 50;
        slots.forEach(card => {
            if (!card) return;
            // Keywords affecting alignment
            const kw = card.keywords.en.join(' ').toLowerCase();

            // Awakening traits (Light, Order, Hope) -> Increase Score
            if (kw.includes('light') || kw.includes('hope') || kw.includes('order') || kw.includes('truth')) score += 10;
            if (kw.includes('justice') || kw.includes('strength') || kw.includes('peace')) score += 5;

            // Distortion traits (Darkness, Chaos, Despair) -> Decrease Score
            if (kw.includes('dark') || kw.includes('despair') || kw.includes('chaos') || kw.includes('fear')) score -= 10;
            if (kw.includes('death') || kw.includes('tower') || kw.includes('devil')) score -= 5;
        });

        // Clamp between 0 and 100
        return Math.max(0, Math.min(100, score));
    },

    // --- RENDER METHODS ---

    render: function () {
        // Calculate EGO Score
        const egoScore = this.calculateEGO();
        // 0 = Full Distortion, 50 = Balanced, 100 = Full Awakening
        // We want the bar to start from center (50%)
        // If score < 50: Width is (50 - score)%, Right is 50%
        // If score> 50: Width is (score - 50)%, Left is 50%

        let barStyle ="";
        let barClass ="";

        if (egoScore < 50) {
            const width = 50 - egoScore;
            barStyle = `width: ${width}%; right: 50%;`;
            barClass ="distortion";
        } else {
            const width = egoScore - 50;
            barStyle = `width: ${width}%; left: 50%;`;
            barClass ="awakening";
        }

        // Main Container
        let html = `
            <div class="divination-container">
                 <div class="divination-scanlines"></div>
                 
                 <div class="divination-layout-grid-v3">
                    <!-- LEFT SIDEBAR (30%) -->
                    <div class="div-sidebar">
                        <!-- TOP: Body Viz (Orange/Yellow) -->
                        <div class="div-col-body">
                            <div class="body-viz-container">
                                <div class="body-silhouette"></div>
                                <!-- Chakra Points -->
                                <div class="chakra-point point-head" data-slot="0" data-action="divination-set-slot" data-slot="0" data-hover-highlight="highlight-slot" data-slot="0" data-leave-highlight="highlight-slot" data-label="${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_head}" role="button" tabindex="0"></div>
                                <div class="chakra-point point-heart" data-slot="1" data-action="divination-set-slot" data-slot="1" data-hover-highlight="highlight-slot" data-slot="1" data-leave-highlight="highlight-slot" data-label="${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_heart}" role="button" tabindex="0"></div>
                                <div class="chakra-point point-hands" data-slot="2" data-action="divination-set-slot" data-slot="2" data-hover-highlight="highlight-slot" data-slot="2" data-leave-highlight="highlight-slot" data-label="${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_hands}" role="button" tabindex="0"></div>
                                <div class="chakra-point point-shadow" data-slot="3" data-action="divination-set-slot" data-slot="3" data-hover-highlight="highlight-slot" data-slot="3" data-leave-highlight="highlight-slot" data-label="${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_shadow}" role="button" tabindex="0"></div>
                                <div class="chakra-point point-soul" data-slot="4" data-action="divination-set-slot" data-slot="4" data-hover-highlight="highlight-slot" data-slot="4" data-leave-highlight="highlight-slot" data-label="${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_soul}" role="button" tabindex="0"></div>
                            </div>
                        </div>

                        <!-- BOTTOM: Tarot System Explanation -->
                        <div class="div-col-text">
                            <div class="divination-guidance-panel">
                                <h4 style="color: var(--gold-primary); margin-bottom: 15px; font-size: 0.9rem; border-bottom: 1px solid var(--gold-dim); padding-bottom: 5px;">// READING GUIDE</h4>
                                <div style="color: #bbb; font-size: 0.85rem; line-height: 1.6; text-align: left;">
                                    <p style="margin: 0 0 12px 0; color: var(--gold-dim);"><strong>${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_positions_title}</strong></p>
                                    <p style="margin: 0 0 8px 0;">${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_head_desc}</p>
                                    <p style="margin: 0 0 8px 0;">${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_heart_desc}</p>
                                    <p style="margin: 0 0 8px 0;">${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_hands_desc}</p>
                                    <p style="margin: 0 0 8px 0;">${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_shadow_desc}</p>
                                    <p style="margin: 0 0 12px 0;">${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_soul_desc}</p>
                                    
                                    <p style="margin: 12px 0 8px 0; color: var(--gold-dim);"><strong>${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_resonance_title}</strong></p>
                                    <p style="margin: 0 0 8px 0;">${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_resonance_desc}</p>
                                    <p style="margin: 0 0 6px 0; padding-left: 12px;">${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_numerology}</p>
                                    <p style="margin: 0 0 6px 0; padding-left: 12px;">${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_conflicts}</p>
                                    <p style="margin: 0 0 6px 0; padding-left: 12px;">${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_patterns}</p>
                                    <p style="margin: 8px 0 0 0; font-style: italic; color: #999;">${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_unique}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT MAIN (70%) -->
                    <div class="div-col-main">
                        <div class="divination-top-panel">
                            <div style="display: flex; justify-content: flex-end; padding: 5px; margin-bottom: 5px;">
                                <button data-action="divination-random" 
                                        style="padding: 6px 12px; 
                                               background: rgba(212, 175, 55, 0.15); 
                                               border: 1px solid rgba(212, 175, 55, 0.4); 
                                               color: var(--gold-dim); 
                                               cursor: pointer; 
                                               border-radius: 3px;
                                               font-family: 'Courier New', monospace;
                                               font-size: 0.7rem;
                                               font-weight: normal;
                                               text-transform: lowercase;
                                               letter-spacing: 1px;
                                               box-shadow: none;
                                               transition: all 0.2s ease;
                                               opacity: 0.7;">
                                    ${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_random_button}
                                </button>
                            </div>
                            ${this.getSlotsHTML()}
                        </div>

                        <!-- EGO METER (Moved Below Slots) -->
                        <div class="ego-meter-container">
                            <div class="ego-bar-bg"></div>
                            <div class="ego-indicator" style="left: ${egoScore}%"></div>
                            <div class="ego-fill ${barClass}" style="${barStyle}"></div>
                            
                            <div class="ego-label left">${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_distortion}</div>
                            <div class="ego-label center">${Math.abs(egoScore - 50) * 2}${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_res}</div>
                            <div class="ego-label right">${DB.TRANSLATIONS[I18n.getCurrentLang()].divination_awakening}</div>
                        </div>

                        <div class="divination-bottom-panel intro-anim" style="flex: 1;">
                            ${this.state.isComplete ? this.getResultsHTML() : this.getSearchHTML()}
                        </div>
                    </div>
                 </div>
            </div>
        `;
        this.root.innerHTML = html;

        // Re-attach listeners for inputs since innerHTML wipes them
        if (!this.state.isComplete) {
            const input = document.getElementById('divination-search');
            if (input) {
                input.value = this.state.searchQuery;
                input.focus();
                input.addEventListener('input', (e) => this.setSearchQuery(e.target.value));
            }
        } else {
            // Run Typewriter if complete
            this.runTypewriterEffect();
        }

        // Ensure body points are highlighted
        this.highlightBodyPoint(this.state.activeSlotIndex);
    },

    runTypewriterEffect: function () {
        const narratives = document.querySelectorAll('.div-narrative-content');
        narratives.forEach((el, index) => {
            const originalText = el.getAttribute('data-full-text') || el.innerText;
            // Store original text if not already stored (to prevent double processing)
            if (!el.getAttribute('data-full-text')) el.setAttribute('data-full-text', originalText);

            el.innerText = '';
            el.classList.add('typewriter-cursor');

            // Stagger start times
            setTimeout(() => {
                let i = 0;
                const typeInterval = setInterval(() => {
                    el.innerText = originalText.substring(0, i + 1);
                    i++;
                    if (i === originalText.length) {
                        clearInterval(typeInterval);
                        el.classList.remove('typewriter-cursor');
                    }
                }, 20); // Typing speed

                if (window.AudioManager) window.AudioManager.play('click');
            }, index * 1200 + 500); // Wait for slide-in animation
        });
    },

    getSlotsHTML: function () {
        return this.state.slots.map((slot, index) => {
            const position = DB.DIVINATION_POSITIONS[index];
            const isActive = index === this.state.activeSlotIndex;
            const isFilled = slot !== null;
            const lang = I18n.getCurrentLang() || 'en';

            let content = '';
            if (isFilled) {
                // Determine image path (logic from original code: specific character images or default)
                // Original code used internal imports. Here we match ID logic or use mapped images in DB.
                // For now, let's look up the card image from the main DB.CARDS if possible, or use a placeholder/styling.
                // The new data has `id:"0_fool_hod"`. We need to map this to an image.
                // The DB.CARDS array has images. Let's try to match by number.

                // Start Update: 2026-02-12 - Robust Image Lookup Refactor
                const imgSrc = this.getCardImage(slot);
                // End Update

                content = `
                    <div class="slot-filled">
                        <img src="${imgSrc}" class="slot-card-img" />
                        <div class="slot-card-name">${slot.name[lang]}</div>
                        <div class="slot-card-char">${slot.character[lang]}</div>
                    </div>
                `;
            } else {
                // Polish: Pulsing waiting text if active
                const emptyText = isActive ? `<span style="font-size: 1rem; color: var(--gold-primary); animation: blink 1s infinite;">[ AWAITING ]</span>` : `<span class="slot-empty-num">${position.id + 1}</span>`;
                content = emptyText;
            }

            return `
                <div class="divination-slot ${isActive ? 'active' : ''} ${isFilled ? 'filled' : ''}" 
                     data-action="divination-set-slot" data-slot="${index}"
                     data-hover-highlight="highlight-body" data-slot="${index}"
                     data-leave-highlight="highlight-body"
                     role="button"
                     tabindex="0"
                     aria-label="${position.title[lang]} Slot: ${isFilled ? slot.character[lang] : 'Empty'}"
>
                    <div class="slot-header">
                        <span class="slot-title">${position.title[lang]}</span>
                        <span class="slot-desc">${position.desc[lang]}</span>
                    </div>
                    <div class="slot-body">
                        ${content}
                    </div>
                </div>
            `;
        }).join('');
    },

    getSearchHTML: function () {
        const lang = I18n.getCurrentLang() || 'en';
        const position = DB.DIVINATION_POSITIONS[this.state.activeSlotIndex];

        return `
            <div class="search-container">
                <div class="search-interface">
                    <input type="text" id="divination-search" class="divination-search-input" 
                           placeholder="${DB.TRANSLATIONS[lang].search_placeholder || 'SEARCH_ARCHETYPE...'}" />
                    <div class="search-results" id="search-results-list">
                        ${this.getCardListHTML()}
                    </div>
                </div>
            </div>
        `;
    },

    renderSearchList: function () {
        const listEl = document.getElementById('search-results-list');
        if (listEl) {
            listEl.innerHTML = this.getCardListHTML();
        }
    },

    getCardListHTML: function () {
        const lang = I18n.getCurrentLang() || 'en';
        const query = this.state.searchQuery.toLowerCase();

        // Filter cards
        const filtered = DB.DIVINATION_CARDS.filter(card => {
            // Check if card is already used
            if (this.state.slots.includes(card)) return false;

            // Search text
            const name = card.name[lang].toLowerCase();
            const char = card.character[lang].toLowerCase();
            const keywords = card.keywords[lang].map(k => k.toLowerCase());

            return name.includes(query) || char.includes(query) || keywords.some(k => k.includes(query));
        });

        if (filtered.length === 0) {
            return `
                <div class="no-results">
                    <div style="margin-bottom: 5px;">${DB.TRANSLATIONS[lang].divination_no_results}</div>
                    <button class="clear-search-btn" data-action="divination-clear-search" style="font-size: 0.7rem; color: var(--gold-primary); background: transparent; border: 1px solid var(--gold-dim); padding: 4px 8px; cursor: pointer;">
                        ${DB.TRANSLATIONS[lang].divination_clear_search}
                    </button>
                </div>
            `;
        }

        return filtered.map(card => `
            <div class="search-item" data-action="divination-select-card" data-card="${card.id}" role="button" tabindex="0">
                <span class="item-name">${card.name[lang]}</span>
                <span class="item-char">// ${card.character[lang]}</span>
                <div class="item-keywords">
                    ${card.keywords[lang].map(k => `<span class="keyword">${k}</span>`).join('')}
                </div>
            </div>
        `).join('');
    },

    // --- UNIFIED RESULTS VIEW ---

    getResultsHTML: function () {
        const lang = I18n.getCurrentLang() || 'en';

        return `
            <div class="results-container">
                <div class="results-toolbar">
                    <div class="results-title">
                        ${DB.TRANSLATIONS[lang].divination_complete ||"SEQUENCE COMPLETE // ANALYSIS:"}
                    </div>
                    <button class="result-reset" data-action="divination-reset">
                        ${DB.TRANSLATIONS[lang].divination_reset ||"RESET SEQUENCE"}
                    </button>
                </div>
                <div class="results-content">
                    ${this.getUnifiedViewHTML()}
                </div>
            </div>
        `;
    },

    getUnifiedViewHTML: function () {
        const lang = I18n.getCurrentLang() || 'en';
        const s = this.state.slots;
        if (s.some(x => x === null)) return"";

        const transitions = [
            DB.TRANSLATIONS[lang].divination_transition_0 ||"Your conscious mind manifests as",
            DB.TRANSLATIONS[lang].divination_transition_1 ||"Beneath, your heart secretly harbors",
            DB.TRANSLATIONS[lang].divination_transition_2 ||"This drives your hands to act with",
            DB.TRANSLATIONS[lang].divination_transition_3 ||"Lurking in your shadow is",
            DB.TRANSLATIONS[lang].divination_transition_4 ||"Ultimately, your soul is revealed as"
        ];

        // Generate Rows
        const rowsHTML = s.map((card, i) => {
            const delay = i * 0.1; // Faster stagger
            return `
                <div class="divination-grid-row slide-in-anim" style="animation-delay: ${delay}s">
                    <!-- LEFT COL: DATA (The"Container") -->
                    <div class="div-grid-data-col">
                        <div class="div-grid-header">${DB.DIVINATION_POSITIONS[i].title[lang]}</div>
                        <div class="div-grid-char">${card.character[lang]}</div>
                        <div class="div-grid-cardname">${card.name[lang]}</div>
                    </div>
                    
                    <!-- RIGHT COL: NARRATIVE (The"Content") -->
                    <div class="div-grid-narrative-col">
                        <div class="div-text-wrapper">
                            <span class="div-narrative-prefix">${transitions[i]}</span>
                            <span class="div-narrative-content" data-full-text='"${card.readings[lang][i]}"'></span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Final Resonance with safe onclick handler
        const resonanceHTML = `
            <div class="divination-grid-row resonance-row slide-in-anim interactive-row" style="animation-delay: 0.8s" data-action="divination-reveal-resonance">
                <div class="div-grid-data-col resonate-label">
                    ${DB.TRANSLATIONS[lang].divination_final_resonance ||"FINAL RESONANCE"}
                </div>
                <div class="div-grid-narrative-col resonate-content censored">
                    <div class="div-scramble-text">
                        <span class="scramble-layer">${DB.TRANSLATIONS[lang].divination_data_expunged}</span>
                        <div class="click-instruction">${DB.TRANSLATIONS[lang].divination_click_decrypt}</div>
                    </div>
                    <div class="div-clear-text typewriter-target"></div>
                </div>
            </div>
        `;

        return `
            <div class="divination-grid-wrapper">
                ${rowsHTML}
                ${resonanceHTML}
            </div>
        `;
    },





    revealResonance: function (el) {
        if (!el.classList.contains('censored')) return;

        // FORCE PARENT LAYOUT (The Ultimate Fix)
        if (el.parentElement) {
            el.parentElement.style.display = 'flex';
            el.parentElement.style.flexDirection = 'row';
            el.parentElement.style.alignItems = 'stretch';
            el.parentElement.style.width = '100%';

            // CONSTRAIN SIBLING LABEL
            const label = el.parentElement.querySelector('.div-grid-data-col');
            if (label) {
                label.style.flex = '0 0 150px';
                label.style.width = '150px';
                label.style.overflow = 'hidden';
            }
        }

        // BRUTE FORCE: Direct Style Overrides for Container
        el.className = 'div-grid-narrative-col resonate-content revealed'; // Apply new CSS class

        // Dynamic Resonance Calculation - NEW SYSTEM returns full text
        const resonanceText = this.calculateResonance();

        // Use the text directly
        const text = resonanceText;

        // BIG REVEAL ANIMATION
        el.style.transform ="scale(1.02)"; // Subtle pop
        el.style.transition ="all 0.3s ease";

        setTimeout(() => {
            el.style.transform ="scale(1)";

            // CLEAR AND REPLACE CONTENT
            el.innerHTML = '';

            const msg = document.createElement('div');
            msg.className = 'div-clear-text';
            msg.innerHTML = text;

            el.appendChild(msg);
        }, 150);
    },

    // === ENHANCED TAROT RESONANCE SYSTEM ===

    // Extract card number from name (e.g.,"XIII - Death" -> 13)
    extractCardNumber: function (card) {
        if (!card) return 0;
        const romans = {
            '0': 0, 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
            'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
            'XI': 11, 'XII': 12, 'XIII': 13, 'XIV': 14, 'XV': 15,
            'XVI': 16, 'XVII': 17, 'XVIII': 18, 'XIX': 19, 'XX': 20, 'XXI': 21
        };
        const match = card.name.en.match(/^([IVXLC]+|[\d]+)/);
        if (!match) return 0;
        return romans[match[1]] !== undefined ? romans[match[1]] : parseInt(match[1]) || 0;
    },

    // Numerology: reduce number to single digit
    reduceToSingleDigit: function (num) {
        while (num> 9) {
            num = num.toString().split('').reduce((a, b) => a + parseInt(b), 0);
        }
        return num || 1; // Never return 0, default to 1
    },

    // Numerology analysis
    analyzeNumerology: function (slots) {
        const numbers = slots.map(s => this.extractCardNumber(s));
        const sum = numbers.reduce((a, b) => a + b, 0);
        const lifePath = this.reduceToSingleDigit(sum);

        // Count repeating numbers
        const counts = {};
        numbers.forEach(n => counts[n] = (counts[n] || 0) + 1);
        const hasRepeats = Object.values(counts).some(c => c>= 2);
        const mostCommon = Object.keys(counts).reduce((a, b) => counts[a]> counts[b] ? a : b);

        return {
            lifePath,
            sum,
            numbers,
            hasRepeats,
            mostCommonNumber: parseInt(mostCommon),
            highCards: numbers.filter(n => n>= 11).length, // 11-21
            lowCards: numbers.filter(n => n <= 5).length    // 0-5
        };
    },

    // Position relationship analysis
    analyzePositions: function (slots) {
        const [head, heart, hands, shadow, soul] = slots;

        // Extract key attributes for comparison
        const getTheme = (card) => {
            if (!card) return '';
            const kw = card.keywords.en.join(' ').toLowerCase();
            if (kw.includes('chaos') || kw.includes('upheaval')) return 'entropy';
            if (kw.includes('balance') || kw.includes('duty')) return 'order';
            if (kw.includes('hope') || kw.includes('passion')) return 'passion';
            if (kw.includes('grief') || kw.includes('end')) return 'sorrow';
            return 'neutral';
        };

        const headTheme = getTheme(head);
        const heartTheme = getTheme(heart);
        const handsTheme = getTheme(hands);
        const shadowTheme = getTheme(shadow);

        return {
            headHeartConflict: headTheme !== heartTheme && headTheme !== 'neutral' && heartTheme !== 'neutral',
            handsShadowConflict: handsTheme !== shadowTheme && handsTheme !== 'neutral' && shadowTheme !== 'neutral',
            headCard: head.name.en,
            heartCard: heart.name.en,
            handsCard: hands.name.en,
            shadowCard: shadow.name.en,
            soulCard: soul.name.en
        };
    },

    // Card progression patterns
    analyzeProgressions: function (slots) {
        const numbers = slots.map(s => this.extractCardNumber(s));

        // Check if ascending/descending
        const isAscending = numbers.every((n, i) => i === 0 || n>= numbers[i - 1]);
        const isDescending = numbers.every((n, i) => i === 0 || n <= numbers[i - 1]);

        // Check if all major arcana (0-21) vs minor  
        const allMajor = numbers.every(n => n>= 0 && n <= 21);

        // Hero's journey (starts low, ends high)
        const heroJourney = numbers[0] <= 5 && numbers[4]>= 15;

        return {
            isAscending,
            isDescending,
            allMajor,
            heroJourney,
            startCard: numbers[0],
            endCard: numbers[4],
            midCard: numbers[2]
        };
    },

    // Generate resonance text using all analysis
    calculateResonance: function () {
        const slots = this.state.slots;
        if (slots.some(s => !s)) return this.getDefaultResonance();

        const numerology = this.analyzeNumerology(slots);
        const positions = this.analyzePositions(slots);
        const progressions = this.analyzeProgressions(slots);

        // Select and generate reading
        return this.generateResonanceText(numerology, positions, progressions, slots);
    },

    // Generate unique resonance reading
    generateResonanceText: function (num, pos, prog, slots) {
        const lang = I18n.getCurrentLang() || 'en';
        const templates = this.getResonanceTemplates();
        let selected = null;

        // Priority 1: Special patterns
        if (prog.heroJourney) {
            selected = this.pickRandom(templates.heroJourney);
        } else if (prog.isAscending) {
            selected = this.pickRandom(templates.ascension);
        } else if (prog.isDescending) {
            selected = this.pickRandom(templates.descent);
        } else if (num.hasRepeats) {
            selected = this.pickRandom(templates.repeating);
            // Priority 2: Position conflicts
        } else if (pos.headHeartConflict) {
            selected = this.pickRandom(templates.headHeartConflict);
        } else if (pos.handsShadowConflict) {
            selected = this.pickRandom(templates.handsShadowConflict);
            // Priority 3: Numerology life path
        } else if (templates.numerology[num.lifePath]) {
            selected = this.pickRandom(templates.numerology[num.lifePath]);
            // Fallback: General templates
        } else {
            selected = this.pickRandom(templates.general);
        }

        // Fill template with actual card data
        return this.fillTemplate(selected, num, pos, prog, slots);
    },

    // Helper: pick random from array
    pickRandom: function (arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    // Fill template placeholders
    fillTemplate: function (template, num, pos, prog, slots) {
        const replacements = {
            '{LIFE_PATH}': num.lifePath,
            '{HEAD}': pos.headCard,
            '{HEART}': pos.heartCard,
            '{HANDS}': pos.handsCard,
            '{SHADOW}': pos.shadowCard,
            '{SOUL}': pos.soulCard,
            '{START}': slots[0].name.en,
            '{END}': slots[4].name.en,
            '{MID}': slots[2].name.en,
            '{SUM}': num.sum,
            '{HIGH_COUNT}': num.highCards,
            '{LOW_COUNT}': num.lowCards
        };

        let result = template;
        for (const [key, value] of Object.entries(replacements)) {
            result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
        }
        return result;
    },

    // Default fallback
    getDefaultResonance: function () {
        return"The cards are still forming their message. Complete the spread to receive guidance.";
    },

    // Resonance templates (50+ variations)
    getResonanceTemplates: function () {
        return {
            // Numerology-based (9 life paths)
            numerology: {
                1: [
"Life Path 1 - The Initiator: Your spread carries the energy of new beginnings. {SOUL} represents your ultimate destination, but the path starts with {HEAD}'s singular vision. Trust your individuality.",
"The number 1 guides this reading - independence incarnate. Where {HEAD} thinks alone, {HEART} must learn to stand alone as well, for {SOUL} demands self-reliance."
                ],
                2: [
"Life Path 2 - The Mediator: Duality defines this spread. {HEAD} and {HEART} seek partnership, yet {SHADOW} harbors division. {SOUL} will find peace only through balance.",
"The number 2 reveals cooperation's challenge. Your {HANDS} must unite what {HEAD} and {SHADOW} have torn apart, guided by {SOUL}'s wisdom."
                ],
                3: [
"Life Path 3 - The Creator: Creative expression flows through this reading. From {HEAD}'s conception through {HEART}'s passion to {HANDS}' manifestation - {SOUL} is the masterpiece.",
"The number 3 speaks of growth and expansion. {SHADOW} may doubt, but {SOUL} knows the truth: your {HEART} holds the key to authentic expression."
                ],
                4: [
"Life Path 4 - The Builder: Stability and structure ground this spread. {HEAD} lays the foundation, {HANDS} constructs the framework, but {SHADOW} tests every support beam. {SOUL} is the completed edifice.",
"The number 4 demands order from chaos. Where {HEART} desires and {HEAD} plans, only {HANDS} can build what {SOUL} envisions."
                ],
                5: [
"Life Path 5 - The Adventurer: Change and freedom surge through this reading. {HEAD} seeks the new, {HEART} craves experience, {HANDS} reaches for the horizon - but {SHADOW} fears the unknown. {SOUL} is the journey itself.",
"The number 5 heralds transformation. From {START} to {END}, nothing remains static. {SHADOW} clings to what was, but {SOUL} embraces what will be."
                ],
                6: [
"Life Path 6 - The Nurturer: Responsibility and service define this spread. {HEART} gives freely, perhaps too freely - {SHADOW} asks: at what cost? {SOUL} must learn that caring for others begins with caring for self.",
"The number 6 calls for harmony. {HEAD} understands duty, {HANDS} performs duty, but {SOUL} must transcend duty to find true purpose."
                ],
                7: [
"Life Path 7 - The Seeker: Spiritual wisdom permeates this reading. {HEAD} questions everything, {SHADOW} knows what others cannot see, and {SOUL} holds mysteries even you don't yet understand.",
"The number 7 speaks of introspection and truth. The path from {START} through {MID} to {END} is a journey inward, not outward."
                ],
                8: [
"Life Path 8 - The Manifester: Power and abundance flow here. {HANDS} can grasp anything, but {SHADOW} warns - what you gain in material success, you may lose in {HEART}. {SOUL} seeks balance between worlds.",
"The number 8 promises mastery, but demands integrity. {HEAD} strategizes, {HANDS} executes, yet {SOUL} reminds: true power is wielded with wisdom."
                ],
                9: [
"Life Path 9 - The Humanitarian: Completion and transcendence mark this spread. {START} began a cycle; {END} closes it. {SOUL} carries the weight of all that came before - release it to move forward.",
"The number 9 signals endings that birth beginnings. {SHADOW} mourns what must be released, but {SOUL} knows: only in letting go can you embrace what's next."
                ]
            },

            // Position-based conflicts
            headHeartConflict: [
"Mind wars with heart: {HEAD} speaks logic while {HEART} cries emotion. Your {HANDS} act caught between, and {SHADOW} feeds on this division. Only {SOUL} can reconcile the two.",
"Conflict emerges between thought and feeling. {HEAD} offers reason, {HEART} offers passion, but {SOUL} demands you honor both, not sever one for the other."
            ],

            handsShadowConflict: [
"What you do ({HANDS}) contradicts what you hide ({SHADOW}). This split manifests as inner turmoil. {SOUL} awaits your courage to bring {SHADOW} into light.",
"Your actions ({HANDS}) and your secret self ({SHADOW}) pull in opposite directions. {HEAD} may not see it, {HEART} may not admit it, but {SOUL} feels the friction."
            ],

            // Pattern-based
            heroJourney: [
"A hero's journey unfolds: from {START}'s beginning through trials to {END}'s culmination. This is transformation incarnate - you are not who you were when this began.",
"The Fool's journey made manifest: {START} set forth naive, but {END} arrives enlightened. {SOUL} has walked the entire path of becoming."
            ],

            ascension: [
"An upward climb: each card rises higher than the last. From {START} through {MID} to {END} - you are ascending. {SOUL} reaches toward apotheosis.",
"Rising energy permeates this spread. {START} was the foundation, {END} is the pinnacle. {SHADOW} may doubt the climb, but {SOUL} knows the summit awaits."
            ],

            descent: [
"A descent into shadow: {START} began high, but {END} arrives low. This is not failure - it is necessary descent to reclaim what was lost in {SHADOW}.",
"Downward movement signals depth, not decline. From {START} to {END}, you dive beneath surfaces. {SOUL} seeks truth in the depths."
            ],

            repeating: [
"Repeating numbers echo through this spread - the universe emphasizes certain lessons. Pay attention to patterns; {SOUL} is trying to tell you something important.",
"The same energy appears multiple times - this is no coincidence. {HEAD} may dismiss it, but {SOUL} recognizes significance in repetition."
            ],

            // General templates (when no special pattern detected)
            general: [
"Five cards, five aspects of self: {HEAD} thinks, {HEART} feels, {HANDS} act, {SHADOW} hides, {SOUL} integrates. Life Path {LIFE_PATH} guides the synthesis.",
"The spread reveals: {START} initiated this chapter, {MID} tests your resolve, {END} promises resolution. {SOUL} carries it all.",
"From conscious {HEAD} through passionate {HEART} to tangible {HANDS}, passing hidden {SHADOW} to arrive at essential {SOUL} - this is your current architecture of being.",
"What {HEAD} conceives, {HEART} desires, and {HANDS} manifest - but {SHADOW} sabotages and {SOUL} transcends. Life Path {LIFE_PATH} shows the way through.",
"{START} speaks of origins, {END} speaks of destination, but {MID} - {MID} is where you stand now. {SOUL} asks: will you move forward or remain frozen?"
            ]
        };
    },

    getCardImage: function (slot) {
        if (!slot) return './images/card_back.png';

        // 1. Try to find specific Employee Variant Image
        const charName = slot.character.en;
        const employee = DB.EMPLOYEES.find(e => e.char.en === charName || e.char.en.replace('&', '&amp;') === charName);
        if (employee && employee.variantImage) {
            return employee.variantImage;
        }

        // 2. Fallback to Generic Major Arcana Image
        // Parse"I - The Magician" -> 1
        const idPart = slot.name.en.split(' - ')[0].trim();
        let cardNum = parseInt(idPart);

        if (isNaN(cardNum)) {
            const romans = {
                '0': 0, 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
                'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
                'XI': 11, 'XII': 12, 'XIII': 13, 'XIV': 14, 'XV': 15,
                'XVI': 16, 'XVII': 17, 'XVIII': 18, 'XIX': 19, 'XX': 20, 'XXI': 21
            };
            cardNum = romans[idPart];
            if (cardNum === undefined) cardNum = -1;
        }

        if (cardNum !== -1) {
            const genericCard = DB.CARDS.find(c => c.id === cardNum);
            if (genericCard && genericCard.image) {
                return genericCard.image;
            }
        }

        // 3. Ultimate Fallback
        return './images/card_back.png';
    },

    calculateEGO: function () {
        const slots = this.state.slots;
        let score = 50; // Start Balanced

        // Weights
        const weights = {
            entropy: -15, // Moves to Distortion (0)
            sorrow: -10,
            passion: 10,  // Moves to Awakening (100)
            order: 15,
            balance: 5
        };

        // Reuse keyword map logic or simplified one
        const keywordMap = {
            entropy: ["chaos","instinct","glitch","disaster","upheaval","bondage","materialism","ignorance","devil","tower"],
            order: ["duty","balance","machine","censorship","observation","privilege","surveillance","temperance","justice"],
            passion: ["fire","hope","inspiration","spice","dragon","legend","star","sun"],
            sorrow: ["grief","end","heart","moonlight","cage","collapse","awakening","death","moon"]
        };

        slots.forEach(card => {
            if (!card) return;
            const kws = [...card.keywords.en, card.name.en].map(k => k.toLowerCase());

            kws.forEach(kw => {
                for (const [theme, mappedKws] of Object.entries(keywordMap)) {
                    if (mappedKws.some(m => kw.includes(m))) {
                        score += (weights[theme] || 0);
                    }
                }
            });
        });

        // Clamp
        return Math.max(0, Math.min(100, score));
    }
};
