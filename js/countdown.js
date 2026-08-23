/**
 * Doomsday Live Wallpaper - Precise Countdown Engine Module
 */

class CountdownEngine {
    constructor() {
        this.targetDate = this.parseTargetDate(window.CONFIG ? window.CONFIG.TARGET_DATE : "2026-12-18T00:00:00");
    }

    parseTargetDate(dateStr) {
        if (!dateStr) return new Date(2026, 11, 18, 0, 0, 0).getTime(); // Dec 18, 2026 00:00:00 Local

        if (typeof dateStr === 'number') return dateStr;

        // Clean string and handle YYYY-MM-DD format explicitly to avoid UTC shift bug
        let cleaned = String(dateStr).trim();
        
        // If string is YYYY-MM-DD without time, parse as local midnight
        const ymdMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(cleaned);
        if (ymdMatch) {
            const year = parseInt(ymdMatch[1], 10);
            const month = parseInt(ymdMatch[2], 10) - 1;
            const day = parseInt(ymdMatch[3], 10);
            return new Date(year, month, day, 0, 0, 0).getTime();
        }

        // If ISO string like YYYY-MM-DDTHH:mm
        const parsed = new Date(cleaned);
        if (!isNaN(parsed.getTime())) {
            return parsed.getTime();
        }

        console.warn("Invalid TARGET_DATE format, defaulting to Dec 18, 2026 00:00:00");
        return new Date(2026, 11, 18, 0, 0, 0).getTime();
    }

    setTargetDate(dateStr) {
        this.targetDate = this.parseTargetDate(dateStr);
    }

    padZero(num, minLength = 2) {
        return String(num).padStart(minLength, '0');
    }

    getState() {
        if (window.CONFIG && window.CONFIG.TARGET_DATE) {
            const currentConfigTarget = this.parseTargetDate(window.CONFIG.TARGET_DATE);
            if (currentConfigTarget !== this.targetDate) {
                this.targetDate = currentConfigTarget;
            }
        }

        // Always fetch current hardware system time directly
        const now = Date.now();
        const diffMs = this.targetDate - now;

        if (diffMs <= 0) {
            return {
                isZero: true,
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                diffMs: 0,
                formatted: {
                    days: "00",
                    hours: "00",
                    minutes: "00",
                    seconds: "00"
                }
            };
        }

        const totalSec = Math.floor(diffMs / 1000);
        const days = Math.floor(totalSec / 86400);
        const hours = Math.floor((totalSec % 86400) / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;

        return {
            isZero: false,
            days,
            hours,
            minutes,
            seconds,
            diffMs,
            formatted: {
                days: this.padZero(days, days >= 100 ? 3 : 2),
                hours: this.padZero(hours, 2),
                minutes: this.padZero(minutes, 2),
                seconds: this.padZero(seconds, 2)
            }
        };
    }
}

window.CountdownEngine = CountdownEngine;
