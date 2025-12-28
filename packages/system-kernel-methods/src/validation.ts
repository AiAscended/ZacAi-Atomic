/**
 * Validation Methods - Pure Deterministic Functions
 * Input validation and assertion helpers
 */

export function validateSystemMode(mode: string): boolean {
  return ["BOOT", "RUN", "SAFE", "SHUTDOWN"].includes(mode);
}

export function validateTickCount(tick: number): boolean {
  return Number.isInteger(tick) && tick >= 0;
}

export function validatePriority(priority: number): boolean {
  return Number.isInteger(priority) && priority >= 0;
}

export function validateIntervalMs(intervalMs: number): boolean {
  return Number.isInteger(intervalMs) && intervalMs > 0;
}

export function validateTaskId(id: string): boolean {
  return typeof id === "string" && id.length > 0;
}

