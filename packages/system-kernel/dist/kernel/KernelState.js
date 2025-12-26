"use strict";
/**
 * Kernel State Machine
 * Immutable state snapshots with strict mode transitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KernelState = void 0;
class KernelState {
    state = {
        mode: "BOOT",
        tick: 0,
        healthy: true,
        timestamp: Date.now(),
    };
    /**
     * Get immutable snapshot of current state
     */
    get snapshot() {
        return Object.freeze({ ...this.state });
    }
    /**
     * Get current mode
     */
    get mode() {
        return this.state.mode;
    }
    /**
     * Get current tick count
     */
    get tick() {
        return this.state.tick;
    }
    /**
     * Check if system is healthy
     */
    get isHealthy() {
        return this.state.healthy;
    }
    /**
     * Transition to new mode
     * Validates transition is legal
     */
    transition(newMode) {
        const validTransitions = {
            BOOT: ["RUN"],
            RUN: ["SAFE", "SHUTDOWN"],
            SAFE: ["RUN", "SHUTDOWN"],
            SHUTDOWN: [],
        };
        if (!validTransitions[this.state.mode].includes(newMode)) {
            return false;
        }
        this.state.mode = newMode;
        this.state.timestamp = Date.now();
        return true;
    }
    /**
     * Increment tick counter
     */
    tick() {
        this.state.tick += 1;
        this.state.timestamp = Date.now();
    }
    /**
     * Mark system as failed
     */
    fail(error) {
        this.state.healthy = false;
        this.state.lastError = error;
        this.state.mode = "SAFE";
        this.state.timestamp = Date.now();
    }
    /**
     * Recover from failed state
     */
    recover() {
        this.state.healthy = true;
        this.state.lastError = undefined;
        this.state.timestamp = Date.now();
    }
}
exports.KernelState = KernelState;
//# sourceMappingURL=KernelState.js.map