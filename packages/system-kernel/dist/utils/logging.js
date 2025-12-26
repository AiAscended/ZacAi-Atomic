"use strict";
/**
 * Kernel Logging Utilities
 * Enterprise-grade logging for kernel operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KernelLogger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class KernelLogger {
    logs = [];
    maxLogs = 1000;
    log(scope, message, level = LogLevel.INFO, metadata) {
        const entry = {
            timestamp: Date.now(),
            level,
            scope,
            message,
            metadata,
        };
        this.logs.push(entry);
        // Prevent memory bloat
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
        if (process.env.KERNEL_DEBUG) {
            console.log(`[${entry.level}][${scope}]`, message, metadata);
        }
    }
    getLogs(filter) {
        if (!filter)
            return [...this.logs];
        return this.logs.filter((log) => {
            if (filter.level && log.level !== filter.level)
                return false;
            if (filter.scope && log.scope !== filter.scope)
                return false;
            return true;
        });
    }
}
exports.KernelLogger = KernelLogger;
//# sourceMappingURL=logging.js.map