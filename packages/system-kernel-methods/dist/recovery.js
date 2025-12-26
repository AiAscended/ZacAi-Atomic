"use strict";
/**
 * Recovery Methods - Pure Deterministic Functions
 * Error classification and recovery strategy selection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyFailure = classifyFailure;
exports.selectRecoveryStrategy = selectRecoveryStrategy;
exports.explainFailure = explainFailure;
/**
 * Classify error type based on error properties
 */
function classifyFailure(error) {
    const message = error.message || "";
    // Critical errors
    if (message.includes("OOM") ||
        message.includes("OutOfMemory") ||
        message.includes("FATAL")) {
        return "CRITICAL";
    }
    // Permanent errors
    if (message.includes("ENOENT") ||
        message.includes("EACCES") ||
        message.includes("EINVAL")) {
        return "PERMANENT";
    }
    // Default to transient
    return "TRANSIENT";
}
/**
 * Select recovery strategy based on failure type and context
 */
function selectRecoveryStrategy(failureType, attempt = 0, maxAttempts = 3) {
    if (failureType === "CRITICAL") {
        return "RESTART";
    }
    if (failureType === "PERMANENT") {
        return "ESCALATE";
    }
    // Transient
    if (attempt < maxAttempts) {
        return "RETRY";
    }
    return "ESCALATE";
}
/**
 * Get human-readable explanation of failure
 */
function explainFailure(error) {
    const type = classifyFailure(error);
    const strategy = selectRecoveryStrategy(type);
    return `[${type}] ${error.message} - Recovery: ${strategy}`;
}
//# sourceMappingURL=recovery.js.map