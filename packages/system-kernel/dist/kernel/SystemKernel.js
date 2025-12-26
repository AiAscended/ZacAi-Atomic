"use strict";
/**
 * System Kernel - Main Orchestrator
 * Coordinates state, scheduling, clock, and recovery
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemKernel = void 0;
const KernelState_1 = require("./KernelState");
const KernelScheduler_1 = require("./KernelScheduler");
const KernelRecovery_1 = require("./KernelRecovery");
const SystemClock_1 = require("../clock/SystemClock");
const logging_1 = require("../utils/logging");
const kernel_1 = require("../types/kernel");
class SystemKernel {
    state = new KernelState_1.KernelState();
    scheduler = new KernelScheduler_1.KernelScheduler();
    logger = new logging_1.KernelLogger();
    recovery = new KernelRecovery_1.KernelRecovery(this.state, this.logger);
    clock = new SystemClock_1.SystemClock();
    eventListeners = new Map();
    config;
    constructor(config = {}) {
        this.config = {
            tickIntervalMs: config.tickIntervalMs ?? 1000,
            enableLogging: config.enableLogging ?? false,
            recoveryMode: config.recoveryMode ?? "CONSERVATIVE",
        };
    }
    /**
     * Boot the kernel
     */
    boot() {
        this.logger.log("SystemKernel", "Booting kernel", "INFO");
        this.state.transition("BOOT");
        this.emit(kernel_1.KernelEvent.BOOT, { mode: "BOOT" });
        // Set up tick handler
        this.clock.onTick((tick) => this.cycle(tick));
        // Start clock
        this.state.transition("RUN");
        this.clock.start(this.config.tickIntervalMs);
        this.emit(kernel_1.KernelEvent.RUN, { tick: 0 });
        this.logger.log("SystemKernel", "Kernel ready", "INFO");
    }
    /**
     * Run one cycle (called on each tick)
     */
    async cycle(tick) {
        const startTime = Date.now();
        try {
            this.state.tick();
            await this.scheduler.runCycle();
            const duration = Date.now() - startTime;
            this.emit(kernel_1.KernelEvent.CYCLE, { tick, duration });
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            this.emit(kernel_1.KernelEvent.ERROR, {
                error,
                severity: "HIGH",
            });
            this.recovery.recover(error);
        }
    }
    /**
     * Enqueue a task to run in next cycle
     */
    enqueueTask(task, priority) {
        return this.scheduler.enqueue(task, priority);
    }
    /**
     * Shutdown kernel gracefully
     */
    async shutdown() {
        this.logger.log("SystemKernel", "Initiating shutdown", "INFO");
        this.clock.stop();
        this.state.transition("SHUTDOWN");
        this.emit(kernel_1.KernelEvent.SHUTDOWN, { graceful: true });
        this.logger.log("SystemKernel", "Shutdown complete", "INFO");
    }
    /**
     * Get current state snapshot
     */
    getState() {
        return this.state.snapshot;
    }
    /**
     * Register event listener
     */
    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        const listeners = this.eventListeners.get(event);
        listeners.push(listener);
        // Return unsubscribe
        return () => {
            const idx = listeners.indexOf(listener);
            if (idx !== -1)
                listeners.splice(idx, 1);
        };
    }
    /**
     * Emit event
     */
    emit(event, payload) {
        const listeners = this.eventListeners.get(event) || [];
        for (const listener of listeners) {
            try {
                listener(payload);
            }
            catch (error) {
                this.logger.log("SystemKernel", `Event listener failed: ${error}`, "WARN");
            }
        }
    }
}
exports.SystemKernel = SystemKernel;
//# sourceMappingURL=SystemKernel.js.map