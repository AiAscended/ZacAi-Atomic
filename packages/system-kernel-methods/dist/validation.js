"use strict";
/**
 * Validation Methods - Pure Deterministic Functions
 * Input validation and assertion helpers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSystemMode = validateSystemMode;
exports.validateTickCount = validateTickCount;
exports.validatePriority = validatePriority;
exports.validateIntervalMs = validateIntervalMs;
exports.validateTaskId = validateTaskId;
function validateSystemMode(mode) {
    return ["BOOT", "RUN", "SAFE", "SHUTDOWN"].includes(mode);
}
function validateTickCount(tick) {
    return Number.isInteger(tick) && tick >= 0;
}
function validatePriority(priority) {
    return Number.isInteger(priority) && priority >= 0;
}
function validateIntervalMs(intervalMs) {
    return Number.isInteger(intervalMs) && intervalMs > 0;
}
function validateTaskId(id) {
    return typeof id === "string" && id.length > 0;
}
//# sourceMappingURL=validation.js.map