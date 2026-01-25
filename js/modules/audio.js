
export const AudioManager = {
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
