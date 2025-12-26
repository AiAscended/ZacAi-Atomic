"use strict";
/**
 * Heartbeat Methods - Pure Deterministic Functions
 * Health checks, tick validation, and jitter calculation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHeartbeatHealthy = isHeartbeatHealthy;
exports.isTickIntervalValid = isTickIntervalValid;
exports.calculateHeartbeatJitter = calculateHeartbeatJitter;
exports.calculateTicksPerSecond = calculateTicksPerSecond;
exports.isHeartbeatDrifting = isHeartbeatDrifting;
/**
 * Check if heartbeat is healthy
 */
function isHeartbeatHealthy(tick) {
    // Any positive tick count means heartbeat is working
    return tick > 0;
}
/**
 * Validate tick interval is within expected range
 */
function isTickIntervalValid(actualIntervalMs, expectedIntervalMs, tolerancePercent = 10) {
    const tolerance = (expectedIntervalMs * tolerancePercent) / 100;
    const min = expectedIntervalMs - tolerance;
    const max = expectedIntervalMs + tolerance;
    return actualIntervalMs >= min && actualIntervalMs <= max;
}
/**
 * Calculate deterministic jitter for scheduling
 */
function calculateHeartbeatJitter(tick, maxJitterPercent = 5) {
    // Use tick as seed for deterministic "random" jitter
    const seed = tick * 9301 + 49297; // Simple LCG
    const random = (seed / 233280) % 1; // Normalize to [0,1]
    return (random * maxJitterPercent) / 100;
}
/**
 * Estimate ticks per second
 */
function calculateTicksPerSecond(ticks, elapsedMs) {
    if (elapsedMs === 0)
        return 0;
    return (ticks / elapsedMs) * 1000;
}
/**
 * Check if heartbeat is drifting (slowing down)
 */
function isHeartbeatDrifting(expectedTicksPerSecond, actualTicksPerSecond, driftThresholdPercent = 20) {
    const threshold = (expectedTicksPerSecond * driftThresholdPercent) / 100;
    const drift = expectedTicksPerSecond - actualTicksPerSecond;
    return Math.abs(drift) > threshold;
}
//# sourceMappingURL=heartbeat.js.map