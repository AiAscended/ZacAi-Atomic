/**
 * Scheduling Methods - Pure Deterministic Functions
 * Task prioritization, backoff, and scheduling logic
 */
export interface Task {
    id: string;
    priority: number;
    retries?: number;
}
/**
 * Sort tasks by priority (highest first)
 */
export declare function prioritySort<T extends Task>(tasks: T[]): T[];
/**
 * Calculate exponential backoff with jitter
 */
export declare function calculateBackoff(attempt: number, baseMs?: number, maxMs?: number, jitterFactor?: number): number;
/**
 * Check if task should be retried
 */
export declare function shouldRetry(error: Error, attempt: number, maxAttempts?: number): boolean;
/**
 * Estimate task deadline based on priority
 */
export declare function estimateDeadline(priority: number, nowMs: number): number;
//# sourceMappingURL=scheduling.d.ts.map