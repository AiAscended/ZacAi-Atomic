"use strict";
/**
 * Lifecycle Methods - Pure Deterministic Functions
 * All transitions, validations, and state logic
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLifecycleTransition = validateLifecycleTransition;
exports.getValidTransitions = getValidTransitions;
exports.isSafeMode = isSafeMode;
exports.getModeDescription = getModeDescription;
/**
 * Validate if transition from one mode to another is legal
 * @param from Current mode
 * @param to Target mode
 * @returns true if transition is allowed
 */
function validateLifecycleTransition(from, to) {
    const transitions = {
        BOOT: ["RUN"],
        RUN: ["SAFE", "SHUTDOWN"],
        SAFE: ["RUN", "SHUTDOWN"],
        SHUTDOWN: [],
    };
    return transitions[from]?.includes(to) ?? false;
}
/**
 * Get next valid modes from current mode
 */
function getValidTransitions(from) {
    const transitions = {
        BOOT: ["RUN"],
        RUN: ["SAFE", "SHUTDOWN"],
        SAFE: ["RUN", "SHUTDOWN"],
        SHUTDOWN: [],
    };
    return transitions[from] ?? [];
}
/**
 * Check if mode is safe for operations
 */
function isSafeMode(mode) {
    return mode === "RUN" || mode === "SAFE";
}
/**
 * Get mode description
 */
function getModeDescription(mode) {
    const descriptions = {
        BOOT: "System initializing",
        RUN: "System operating normally",
        SAFE: "System in safe/degraded mode",
        SHUTDOWN: "System shutting down",
    };
    return descriptions[mode];
}
//# sourceMappingURL=lifecycle.js.map