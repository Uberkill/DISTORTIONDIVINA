
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
    reset() { this.state = { scale: 1, rotX: 0, rotY: 0 }; this.updateTransform(); },
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
