/**
 * Doomsday Live Wallpaper - Configuration & Lively Wallpaper Bridge Module
 */

const DEFAULT_CONFIG = {
    TARGET_DATE: "2026-12-18T00:00:00",
    TIMEZONE: "auto", // "auto" uses browser/system local timezone
    SHOW_DATE: true,
    SHOW_TAGLINE: true,
    TAGLINE_TEXT: "THE END IS COMING",
    ENABLE_PARTICLES: true,
    ENABLE_FOG: true,
    ENABLE_GRAIN: true,
    ENABLE_VIGNETTE: true,
    ENABLE_CHROMATIC_ABERRATION: false,
    ANIMATION_QUALITY: "high", // "low", "medium", "high"
    DEBUG_MODE: false
};

// Global active configuration object
window.CONFIG = Object.assign({}, DEFAULT_CONFIG);

// Event emitter for dynamic configuration updates
window.CONFIG_LISTENERS = [];
window.onConfigChange = function(callback) {
    if (typeof callback === 'function') {
        window.CONFIG_LISTENERS.push(callback);
    }
};

window.updateConfig = function(newPartialConfig) {
    Object.assign(window.CONFIG, newPartialConfig);
    window.CONFIG_LISTENERS.forEach(cb => cb(window.CONFIG));
};

// Lively Wallpaper property listener API bridge
window.livelyPropertyListener = function(name, val) {
    if (name === "targetDate") {
        window.updateConfig({ TARGET_DATE: val });
    } else if (name === "taglineText") {
        window.updateConfig({ TAGLINE_TEXT: val });
    } else if (name === "showTagline") {
        window.updateConfig({ SHOW_TAGLINE: !!val });
    } else if (name === "showDate") {
        window.updateConfig({ SHOW_DATE: !!val });
    } else if (name === "animationQuality") {
        // Lively dropdown index: 0 = High, 1 = Medium, 2 = Low
        const qMap = ["high", "medium", "low"];
        const quality = typeof val === 'number' ? (qMap[val] || "high") : val;
        window.updateConfig({ ANIMATION_QUALITY: quality });
    } else if (name === "enableParticles") {
        window.updateConfig({ ENABLE_PARTICLES: !!val });
    } else if (name === "enableFog") {
        window.updateConfig({ ENABLE_FOG: !!val });
    } else if (name === "enableGrain") {
        window.updateConfig({ ENABLE_GRAIN: !!val });
    } else if (name === "enableVignette") {
        window.updateConfig({ ENABLE_VIGNETTE: !!val });
    }
};
