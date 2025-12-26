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
export function isHeartbeatHealthy(tick: number): boolean {
  // Any positive tick count means heartbeat is working
  return tick > 0;
}

/**
 * Validate tick interval is within expected range
 */
export function isTickIntervalValid(
  actualIntervalMs: number,
  expectedIntervalMs: number,
  tolerancePercent: number = 10
): boolean {
  const tolerance = (expectedIntervalMs * tolerancePercent) / 100;
  const min = expectedIntervalMs - tolerance;
  const max = expectedIntervalMs + tolerance;

  return actualIntervalMs >= min && actualIntervalMs <= max;
}

/**
 * Calculate deterministic jitter for scheduling
 */
export function calculateHeartbeatJitter(
  tick: number,
  maxJitterPercent: number = 5
): number {
  // Use tick as seed for deterministic "random" jitter
  const seed = tick * 9301 + 49297; // Simple LCG
  const random = (seed / 233280) % 1; // Normalize to [0,1]
  return (random * maxJitterPercent) / 100;
}

/**
 * Estimate ticks per second
 */
export function calculateTicksPerSecond(
  ticks: number,
  elapsedMs: number
): number {
  if (elapsedMs === 0) return 0;
  return (ticks / elapsedMs) * 1000;
}

/**
 * Check if heartbeat is drifting (slowing down)
 */
export function isHeartbeatDrifting(
  expectedTicksPerSecond: number,
  actualTicksPerSecond: number,
  driftThresholdPercent: number = 20
): boolean {
  const threshold = (expectedTicksPerSecond * driftThresholdPercent) / 100;
  const drift = expectedTicksPerSecond - actualTicksPerSecond;

  return Math.abs(drift) > threshold;
}

