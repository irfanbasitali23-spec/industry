class SignaturePad {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.drawing = false;
        this.hasContent = false;

        this.resize();
        this.bindEvents();
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * ratio;
        this.canvas.height = rect.height * ratio;
        this.ctx.scale(ratio, ratio);
        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    getPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    bindEvents() {
        const start = (e) => {
            e.preventDefault();
            this.drawing = true;
            const pos = this.getPos(e);
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y);
        };

        const draw = (e) => {
            if (!this.drawing) return;
            e.preventDefault();
            const pos = this.getPos(e);
            this.ctx.lineTo(pos.x, pos.y);
            this.ctx.stroke();
            this.hasContent = true;
        };

        const stop = () => { this.drawing = false; };

        this.canvas.addEventListener('mousedown', start);
        this.canvas.addEventListener('mousemove', draw);
        this.canvas.addEventListener('mouseup', stop);
        this.canvas.addEventListener('mouseleave', stop);
        this.canvas.addEventListener('touchstart', start, { passive: false });
        this.canvas.addEventListener('touchmove', draw, { passive: false });
        this.canvas.addEventListener('touchend', stop);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.hasContent = false;
    }

    toDataURL() {
        if (!this.hasContent) return null;
        return this.canvas.toDataURL('image/png');
    }
}

const signaturePads = {};

function initSignaturePads() {
    document.querySelectorAll('.signature-canvas').forEach(canvas => {
        signaturePads[canvas.id] = new SignaturePad(canvas);
    });

    document.querySelectorAll('.clear-sig').forEach(btn => {
        btn.addEventListener('click', () => {
            const pad = signaturePads[btn.dataset.canvas];
            if (pad) pad.clear();
        });
    });
}

document.addEventListener('DOMContentLoaded', initSignaturePads);
