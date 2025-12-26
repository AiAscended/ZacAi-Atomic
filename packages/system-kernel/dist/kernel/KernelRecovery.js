"use strict";
/**
 * Kernel Recovery & Error Handling
 * Implements recovery strategies for kernel failures
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KernelRecovery = void 0;
class KernelRecovery {
    state;
    logger;
    constructor(state, logger) {
        this.state = state;
        this.logger = logger;
    }
    /**
     * Recover from an error
     */
    recover(error, options = {}) {
        const { maxRetries = 3, backoffMs = 100, strategy = "SKIP", } = options;
        this.logger.log("KernelRecovery", `Attempting recovery: ${error.message}`, "WARN", { strategy, error: error.message });
        this.state.fail(error.message);
        switch (strategy) {
            case "RESTART":
                // In production, would trigger full restart
                this.logger.log("KernelRecovery", "Executing RESTART strategy", "INFO");
                break;
            case "SKIP":
                // Skip failed operation, continue
                this.logger.log("KernelRecovery", "Executing SKIP strategy", "INFO");
                break;
            case "ESCALATE":
                // Escalate to higher authority
                this.logger.log("KernelRecovery", "Escalating failure to higher authority", "ERROR");
                break;
        }
    }
    /**
     * Check if recovery is possible
     */
    isRecoverable(error) {
        const transientErrors = [
            "EAGAIN",
            "ECONNRESET",
            "ETIMEDOUT",
            "EHOSTUNREACH",
        ];
        return transientErrors.some((e) => error.message.includes(e));
    }
}
exports.KernelRecovery = KernelRecovery;
//# sourceMappingURL=KernelRecovery.js.map