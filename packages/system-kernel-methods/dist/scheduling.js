"use strict";
/**
 * Scheduling Methods - Pure Deterministic Functions
 * Task prioritization, backoff, and scheduling logic
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.prioritySort = prioritySort;
exports.calculateBackoff = calculateBackoff;
exports.shouldRetry = shouldRetry;
exports.estimateDeadline = estimateDeadline;
/**
 * Sort tasks by priority (highest first)
 */
function prioritySort(tasks) {
    return [...tasks].sort((a, b) => b.priority - a.priority);
}
/**
 * Calculate exponential backoff with jitter
 */
function calculateBackoff(attempt, baseMs = 100, maxMs = 30000, jitterFactor = 0.1) {
    const exponential = baseMs * Math.pow(2, attempt);
    const capped = Math.min(exponential, maxMs);
    const jitter = capped * jitterFactor * Math.random();
    return capped + jitter;
}
/**
 * Check if task should be retried
 */
function shouldRetry(error, attempt, maxAttempts = 3) {
    if (attempt >= maxAttempts)
        return false;
    // Transient errors only
    const transientErrors = ["EAGAIN", "ECONNRESET", "ETIMEDOUT"];
    return transientErrors.some((e) => error.message.includes(e));
}
/**
 * Estimate task deadline based on priority
 */
function estimateDeadline(priority, nowMs) {
    // Higher priority = tighter deadline
    const deadlineMs = 1000 * (1 + (10 - priority) / 10);
    return nowMs + deadlineMs;
}
//# sourceMappingURL=scheduling.js.map