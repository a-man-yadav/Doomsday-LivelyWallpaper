/**
 * Doomsday Live Wallpaper - Main Entry Point & UI Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Instantiate Engines & Controllers
    const countdown = new window.CountdownEngine();
    const particleCanvas = document.getElementById('bg-canvas');
    const particles = new window.ParticleEngine(particleCanvas);
    const effects = new window.EffectsManager();
    const loop = new window.RendererLoop(particles, effects);

    // DOM Elements
    const elDays = document.getElementById('val-days');
    const elHours = document.getElementById('val-hours');
    const elMinutes = document.getElementById('val-minutes');
    const elSeconds = document.getElementById('val-seconds');
    const elCountdownContainer = document.getElementById('countdown-container');
    const elZeroStateContainer = document.getElementById('zero-state-container');
    const elTagline = document.getElementById('tagline-text');
    const elDateIndicator = document.getElementById('date-indicator');
    const elDebugOverlay = document.getElementById('debug-overlay');
    const elDebugFps = document.getElementById('debug-fps');
    const elDebugCurrentTime = document.getElementById('debug-current-time');
    const elDebugTargetTime = document.getElementById('debug-target-time');
    const elDebugDiffMs = document.getElementById('debug-diff-ms');
    const elDebugViewport = document.getElementById('debug-viewport');

    let prevValues = { days: '', hours: '', minutes: '', seconds: '' };
    let currentFps = 60;
    let lastTickTimestamp = Date.now();

    // Start 60 FPS Canvas Loop
    loop.start();

    // FPS Listener for Debug Mode
    window.onFpsUpdate = (fps) => {
        currentFps = fps;
        if (elDebugFps) elDebugFps.textContent = fps;
    };

    // Helper: Update a single digit box with smooth slide/flip transition
    function updateDigitBox(element, newValue, prevValue) {
        if (!element) return;
        if (newValue !== prevValue) {
            element.classList.remove('digit-tick');
            // Trigger reflow to restart CSS animation
            void element.offsetWidth;
            element.textContent = newValue;
            element.classList.add('digit-tick');
        }
    }

    // 2. Main Countdown Tick Function (1s interval & instant sleep/wake sync)
    function tick() {
        const now = Date.now();
        // If more than 2 seconds elapsed since last tick (e.g. laptop lid was closed or asleep), force instant clock re-sync
        if (now - lastTickTimestamp > 2000) {
            prevValues = { days: '', hours: '', minutes: '', seconds: '' }; // Force fresh digit render
        }
        lastTickTimestamp = now;

        const state = countdown.getState();
        const config = window.CONFIG || {};

        // Handle Zero / Midnight State
        if (state.isZero) {
            if (elCountdownContainer) elCountdownContainer.style.display = 'none';
            if (elZeroStateContainer) elZeroStateContainer.style.display = 'flex';
        } else {
            if (elCountdownContainer) elCountdownContainer.style.display = 'flex';
            if (elZeroStateContainer) elZeroStateContainer.style.display = 'none';

            updateDigitBox(elDays, state.formatted.days, prevValues.days);
            updateDigitBox(elHours, state.formatted.hours, prevValues.hours);
            updateDigitBox(elMinutes, state.formatted.minutes, prevValues.minutes);
            updateDigitBox(elSeconds, state.formatted.seconds, prevValues.seconds);

            prevValues = { ...state.formatted };
        }

        // Update Optional Text
        if (elTagline) {
            elTagline.style.display = config.SHOW_TAGLINE ? 'block' : 'none';
            elTagline.textContent = config.TAGLINE_TEXT || "THE END IS COMING";
        }

        if (elDateIndicator) {
            elDateIndicator.style.display = config.SHOW_DATE ? 'block' : 'none';
            if (config.TARGET_DATE) {
                const targetTimestamp = countdown.parseTargetDate(config.TARGET_DATE);
                const d = new Date(targetTimestamp);
                if (!isNaN(d.getTime())) {
                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                    elDateIndicator.textContent = d.toLocaleDateString('en-US', options).toUpperCase();
                }
            }
        }

        // Update Debug Mode Overlay
        if (elDebugOverlay) {
            elDebugOverlay.style.display = config.DEBUG_MODE ? 'block' : 'none';
            if (config.DEBUG_MODE) {
                if (elDebugCurrentTime) elDebugCurrentTime.textContent = new Date().toLocaleTimeString();
                if (elDebugTargetTime) elDebugTargetTime.textContent = new Date(config.TARGET_DATE).toLocaleString();
                if (elDebugDiffMs) elDebugDiffMs.textContent = `${state.diffMs} ms`;
                if (elDebugViewport) elDebugViewport.textContent = `${window.innerWidth} x ${window.innerHeight} (${config.ANIMATION_QUALITY.toUpperCase()})`;
            }
        }
    }

    // Run tick immediately and set 1 second interval
    tick();
    setInterval(tick, 1000);

    // Instant Wake / Laptop Lid Open Listeners
    window.addEventListener('focus', () => tick());
    window.addEventListener('pageshow', () => tick());
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) tick();
    });

    // Re-apply UI state when config changes dynamically
    if (window.onConfigChange) {
        window.onConfigChange(() => tick());
    }

    // 3. Keyboard Shortcuts Listener
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'f') {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        } else if (key === 'p') {
            window.updateConfig({ ENABLE_PARTICLES: !window.CONFIG.ENABLE_PARTICLES });
        } else if (key === 'g') {
            window.updateConfig({ ENABLE_GRAIN: !window.CONFIG.ENABLE_GRAIN });
        } else if (key === 'd') {
            window.updateConfig({ DEBUG_MODE: !window.CONFIG.DEBUG_MODE });
        } else if (key === '1') {
            window.updateConfig({ ANIMATION_QUALITY: 'low' });
        } else if (key === '2') {
            window.updateConfig({ ANIMATION_QUALITY: 'medium' });
        } else if (key === '3') {
            window.updateConfig({ ANIMATION_QUALITY: 'high' });
        }
    });

    // 4. Listen to Electron IPC Events (when hosted inside Electron Native App)
    if (window.electronAPI) {
        if (window.electronAPI.onUpdateConfig) {
            window.electronAPI.onUpdateConfig((newConfig) => {
                window.updateConfig(newConfig);
                tick();
            });
        }
        if (window.electronAPI.onPauseWallpaper) {
            window.electronAPI.onPauseWallpaper(() => {
                loop.pause();
            });
        }
        if (window.electronAPI.onResumeWallpaper) {
            window.electronAPI.onResumeWallpaper(() => {
                loop.resume();
                tick();
            });
        }
    }
});
