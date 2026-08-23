/**
 * Doomsday Live Wallpaper - Animation & Loop Renderer Module
 */

class RendererLoop {
    constructor(particleEngine, effectsManager) {
        this.particleEngine = particleEngine;
        this.effectsManager = effectsManager;

        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.fps = 60;
        this.frameCount = 0;
        this.fpsTimer = performance.now();
        this.rafId = null;

        // Visibility API listener to save CPU/GPU when hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    pause() {
        this.isPaused = true;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    resume() {
        if (!this.isRunning || !this.isPaused) return;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    loop(now) {
        if (this.isPaused) return;

        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        // FPS Calculation
        this.frameCount++;
        if (now - this.fpsTimer >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.fpsTimer));
            this.frameCount = 0;
            this.fpsTimer = now;
            
            // Dispatch FPS event for Debug Overlay
            if (window.onFpsUpdate) {
                window.onFpsUpdate(this.fps);
            }
        }

        // Particle & Background Canvas update/render
        if (this.particleEngine) {
            this.particleEngine.update(dt);
            this.particleEngine.render();
        }

        // Film Grain update/render
        if (this.effectsManager) {
            this.effectsManager.renderGrain();
        }

        this.rafId = requestAnimationFrame((t) => this.loop(t));
    }
}

window.RendererLoop = RendererLoop;
