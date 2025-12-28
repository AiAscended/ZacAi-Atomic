"use strict";
/**
 * System Clock (Heartbeat)
 * Provides predictable tick-based execution
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemClock = void 0;
class SystemClock {
    tickCount = 0;
    handlers = [];
    interval;
    paused = false;
    /**
     * Start clock with given interval
     */
    start(periodMs = 1000) {
        if (this.interval)
            return;
        this.interval = setInterval(() => {
            if (!this.paused) {
                this.pulse();
            }
        }, periodMs);
    }
    /**
     * Stop clock
     */
    stop() {
        if (this.interval)
            clearInterval(this.interval);
        this.interval = undefined;
    }
    /**
     * Pause clock (keeps interval running but doesnt tick)
     */
    pause() {
        this.paused = true;
    }
    /**
     * Resume clock
     */
    resume() {
        this.paused = false;
    }
    /**
     * Register handler to run on each tick
     */
    onTick(handler) {
        this.handlers.push(handler);
        // Return unsubscribe function
        return () => {
            this.handlers = this.handlers.filter((h) => h !== handler);
        };
    }
    /**
     * Get current tick count
     */
    get ticks() {
        return this.tickCount;
    }
    /**
     * Check if running
     */
    get isRunning() {
        return this.interval !== undefined;
    }
    /**
     * Internal: execute one tick
     */
    async pulse() {
        this.tickCount++;
        for (const handler of this.handlers) {
            try {
                await handler(this.tickCount);
            }
            catch (error) {
                console.error("Tick handler failed:", error);
            }
        }
    }
}
exports.SystemClock = SystemClock;
//# sourceMappingURL=SystemClock.js.map