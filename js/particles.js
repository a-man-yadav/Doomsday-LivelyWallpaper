/**
 * Doomsday Live Wallpaper - Atmospheric Emerald Particle & Fog Engine
 */

class ParticleEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.fogNodes = [];
        this.width = 0;
        this.height = 0;
        this.dpr = 1;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        if (window.onConfigChange) {
            window.onConfigChange(() => this.reinit());
        }
    }

    resize() {
        const quality = window.CONFIG ? window.CONFIG.ANIMATION_QUALITY : 'high';
        this.dpr = quality === 'low' ? 0.75 : Math.min(window.devicePixelRatio || 1, 2);
        
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.canvas.width = Math.floor(this.width * this.dpr);
        this.canvas.height = Math.floor(this.height * this.dpr);
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;

        this.reinit();
    }

    reinit() {
        const quality = window.CONFIG ? window.CONFIG.ANIMATION_QUALITY : 'high';
        let particleCount = 70;
        let fogCount = 4;

        if (quality === 'medium') {
            particleCount = 35;
            fogCount = 2;
        } else if (quality === 'low') {
            particleCount = 15;
            fogCount = 1;
        }

        // Initialize dust motes and emerald embers
        this.particles = [];
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 1.8 + 0.5,
                alpha: Math.random() * 0.5 + 0.15,
                vx: (Math.random() - 0.5) * 0.15,
                vy: -Math.random() * 0.25 - 0.05, // Slow upward float
                pulseSpeed: Math.random() * 0.02 + 0.005,
                pulseAngle: Math.random() * Math.PI * 2,
                color: Math.random() > 0.35 ? 'rgba(0, 255, 102,' : 'rgba(160, 230, 190,'
            });
        }

        // Initialize slow drifting emerald fog nodes
        this.fogNodes = [];
        for (let i = 0; i < fogCount; i++) {
            this.fogNodes.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 300 + 250,
                vx: (Math.random() - 0.5) * 0.08,
                vy: (Math.random() - 0.5) * 0.08,
                alpha: Math.random() * 0.07 + 0.03
            });
        }
    }

    update(dt) {
        if (!window.CONFIG.ENABLE_PARTICLES && !window.CONFIG.ENABLE_FOG) return;

        const timeStep = Math.min(dt, 0.1) * 60; // Standardized frame step

        // Update dust particles
        if (window.CONFIG.ENABLE_PARTICLES) {
            for (let p of this.particles) {
                p.x += p.vx * timeStep;
                p.y += p.vy * timeStep;
                p.pulseAngle += p.pulseSpeed * timeStep;

                if (p.y < -10) {
                    p.y = this.height + 10;
                    p.x = Math.random() * this.width;
                }
                if (p.x < -10) p.x = this.width + 10;
                if (p.x > this.width + 10) p.x = -10;
            }
        }

        // Update fog nodes
        if (window.CONFIG.ENABLE_FOG) {
            for (let f of this.fogNodes) {
                f.x += f.vx * timeStep;
                f.y += f.vy * timeStep;

                if (f.x < -f.radius) f.x = this.width + f.radius;
                if (f.x > this.width + f.radius) f.x = -f.radius;
                if (f.y < -f.radius) f.y = this.height + f.radius;
                if (f.y > this.height + f.radius) f.y = -f.radius;
            }
        }
    }

    render() {
        const ctx = this.ctx;
        const w = this.width * this.dpr;
        const h = this.height * this.dpr;
        const scale = this.dpr;

        ctx.clearRect(0, 0, w, h);

        // 1. Central ominous radial emerald green light bloom behind the countdown
        const centerX = w / 2;
        const centerY = h / 2;
        const radialGlow = ctx.createRadialGradient(
            centerX, centerY, 50 * scale,
            centerX, centerY, Math.max(w, h) * 0.55
        );
        radialGlow.addColorStop(0, 'rgba(0, 255, 102, 0.2)');
        radialGlow.addColorStop(0.4, 'rgba(5, 45, 25, 0.1)');
        radialGlow.addColorStop(1, 'rgba(2, 6, 4, 0)');

        ctx.fillStyle = radialGlow;
        ctx.fillRect(0, 0, w, h);

        // 2. Draw Fog Layers
        if (window.CONFIG.ENABLE_FOG) {
            for (let f of this.fogNodes) {
                const fx = f.x * scale;
                const fy = f.y * scale;
                const fr = f.radius * scale;
                const fogGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
                fogGrad.addColorStop(0, `rgba(0, 200, 90, ${f.alpha})`);
                fogGrad.addColorStop(0.5, `rgba(10, 30, 20, ${f.alpha * 0.5})`);
                fogGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

                ctx.fillStyle = fogGrad;
                ctx.beginPath();
                ctx.arc(fx, fy, fr, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // 3. Draw Particles
        if (window.CONFIG.ENABLE_PARTICLES) {
            for (let p of this.particles) {
                const px = p.x * scale;
                const py = p.y * scale;
                const pr = p.radius * scale;
                const alpha = p.alpha + Math.sin(p.pulseAngle) * 0.15;

                ctx.fillStyle = `${p.color}${Math.max(0, Math.min(1, alpha))})`;
                ctx.beginPath();
                ctx.arc(px, py, pr, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

window.ParticleEngine = ParticleEngine;
