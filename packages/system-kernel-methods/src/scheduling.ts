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
export function prioritySort<T extends Task>(tasks: T[]): T[] {
  return [...tasks].sort((a, b) => b.priority - a.priority);
}

/**
 * Calculate exponential backoff with jitter
 */
export function calculateBackoff(
  attempt: number,
  baseMs: number = 100,
  maxMs: number = 30000,
  jitterFactor: number = 0.1
): number {
  const exponential = baseMs * Math.pow(2, attempt);
  const capped = Math.min(exponential, maxMs);
  const jitter = capped * jitterFactor * Math.random();

  return capped + jitter;
}

/**
 * Check if task should be retried
 */
export function shouldRetry(
  error: Error,
  attempt: number,
  maxAttempts: number = 3
): boolean {
  if (attempt >= maxAttempts) return false;

  // Transient errors only
  const transientErrors = ["EAGAIN", "ECONNRESET", "ETIMEDOUT"];
  return transientErrors.some((e) => error.message.includes(e));
}

/**
 * Estimate task deadline based on priority
 */
export function estimateDeadline(
  priority: number,
  nowMs: number
): number {
  // Higher priority = tighter deadline
  const deadlineMs = 1000 * (1 + (10 - priority) / 10);
  return nowMs + deadlineMs;
}

