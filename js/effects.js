/**
 * Doomsday Live Wallpaper - Atmospheric Post-Processing Effects Module
 */

class EffectsManager {
    constructor() {
        this.grainCanvas = document.getElementById('grain-canvas');
        this.grainCtx = this.grainCanvas ? this.grainCanvas.getContext('2d') : null;
        this.grainTileSize = 256;
        this.grainPattern = null;
        this.frameCounter = 0;

        if (this.grainCanvas) {
            this.initGrainTile();
            this.resizeGrainCanvas();
            window.addEventListener('resize', () => this.resizeGrainCanvas());
        }

        if (window.onConfigChange) {
            window.onConfigChange(() => this.applyConfigStates());
        }
        this.applyConfigStates();
    }

    initGrainTile() {
        // Create an offscreen tile canvas for GPU efficient grain pattern rendering
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = this.grainTileSize;
        tileCanvas.height = this.grainTileSize;
        const tileCtx = tileCanvas.getContext('2d');
        const imgData = tileCtx.createImageData(this.grainTileSize, this.grainTileSize);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            const val = Math.floor(Math.random() * 255);
            data[i] = val;     // R
            data[i + 1] = val; // G
            data[i + 2] = val; // B
            data[i + 3] = Math.floor(Math.random() * 18 + 8); // Low alpha noise
        }
        tileCtx.putImageData(imgData, 0, 0);

        if (this.grainCtx) {
            this.grainPattern = this.grainCtx.createPattern(tileCanvas, 'repeat');
        }
    }

    resizeGrainCanvas() {
        if (!this.grainCanvas) return;
        this.grainCanvas.width = window.innerWidth;
        this.grainCanvas.height = window.innerHeight;
    }

    applyConfigStates() {
        const config = window.CONFIG || {};

        // Vignette overlay
        const vignetteEl = document.getElementById('vignette-overlay');
        if (vignetteEl) {
            vignetteEl.style.display = config.ENABLE_VIGNETTE ? 'block' : 'none';
        }

        // Chromatic Aberration toggle
        const root = document.documentElement;
        if (config.ENABLE_CHROMATIC_ABERRATION) {
            root.classList.add('enable-chromatic');
        } else {
            root.classList.remove('enable-chromatic');
        }

        // Grain Canvas display
        if (this.grainCanvas) {
            this.grainCanvas.style.display = config.ENABLE_GRAIN ? 'block' : 'none';
        }
    }

    renderGrain() {
        if (!window.CONFIG || !window.CONFIG.ENABLE_GRAIN || !this.grainCtx || !this.grainPattern) return;

        // Subtle frame offset shift to make grain flicker slowly and realistically
        this.frameCounter++;
        if (this.frameCounter % 3 !== 0) return; // Update every 3rd frame for performance

        const ctx = this.grainCtx;
        const w = this.grainCanvas.width;
        const h = this.grainCanvas.height;

        ctx.save();
        ctx.clearRect(0, 0, w, h);
        ctx.translate((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50);
        ctx.fillStyle = this.grainPattern;
        ctx.fillRect(-50, -50, w + 100, h + 100);
        ctx.restore();
    }
}

window.EffectsManager = EffectsManager;
