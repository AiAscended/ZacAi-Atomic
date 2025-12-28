/**
 * Heartbeat Methods - Pure Deterministic Functions
 * Health checks, tick validation, and jitter calculation
 */
export interface HeartbeatStats {
    isHealthy: boolean;
    ticksPerSecond: number;
    jitterPercent: number;
    timeSinceLastTick: number;
}
/**
 * Check if heartbeat is healthy
 */
export declare function isHeartbeatHealthy(tick: number): boolean;
/**
 * Validate tick interval is within expected range
 */
export declare function isTickIntervalValid(actualIntervalMs: number, expectedIntervalMs: number, tolerancePercent?: number): boolean;
/**
 * Calculate deterministic jitter for scheduling
 */
export declare function calculateHeartbeatJitter(tick: number, maxJitterPercent?: number): number;
/**
 * Estimate ticks per second
 */
export declare function calculateTicksPerSecond(ticks: number, elapsedMs: number): number;
/**
 * Check if heartbeat is drifting (slowing down)
 */
export declare function isHeartbeatDrifting(expectedTicksPerSecond: number, actualTicksPerSecond: number, driftThresholdPercent?: number): boolean;
//# sourceMappingURL=heartbeat.d.ts.map