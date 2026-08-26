import { I18n } from './i18n.js';
import { WindowManager } from './windows.js';

export const Viewer3D = {
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
        this.state = { scale: 1, rotX: 0, rotY: 0 }; 
        this.updateTransform(); 
    },
    
    open(card, variant = null) {
        this.reset();
        const lang = I18n.getCurrentLang();
        
        document.getElementById('viewer-img').src = variant ? variant.variantImage : card.image;
        document.getElementById('viewer-title').innerText = card.title[lang];
        document.getElementById('viewer-desc').innerText = card.description[lang];
        document.getElementById('viewer-id').innerText = `00${card.id}-ALPHA`;

        // Artist and Pen Name info in Viewer
        const artistInfo = variant ? `
                    <div style="border-left:2px solid var(--gold-primary);padding-left:15px;">
                        <div style="color:var(--terminal-green);font-size:0.9rem;">${I18n.get('viewer_char_label')}</div>
                        <div style="color:white;font-size:1.8rem;margin-bottom:8px;">${variant.char[lang] || variant.char.en}</div>
                        <div style="color:var(--gold-dim);font-size:0.8rem;">${I18n.get('viewer_illus_label')}</div>
                        <div style="color:#ddd;font-size:1.3rem;">${variant.artist} <span style="font-size:0.9rem;opacity:0.6;font-family:'Share Tech Mono';">(@${variant.pen})</span></div>
                        <div style="color:rgba(0,240,255,0.7);font-size:0.85rem;margin-top:4px;text-transform:uppercase;">${variant.role[lang] || variant.role.en}</div>
                    </div>
                ` : `<div>${I18n.get('viewer_no_variant')}</div>`;

        document.getElementById('viewer-artist').innerHTML = artistInfo;

        // Socials rendering logic
        const socialsDiv = document.getElementById('viewer-socials');
        if (socialsDiv) {
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
        }

        WindowManager.open('win-viewer');
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
