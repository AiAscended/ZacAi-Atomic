/**
 * Recovery Methods - Pure Deterministic Functions
 * Error classification and recovery strategy selection
 */

export type FailureType = "TRANSIENT" | "PERMANENT" | "CRITICAL";
export type RecoveryStrategy = "RETRY" | "SKIP" | "ESCALATE" | "RESTART";

/**
 * Classify error type based on error properties
 */
export function classifyFailure(error: Error): FailureType {
  const message = error.message || "";

  // Critical errors
  if (
    message.includes("OOM") ||
    message.includes("OutOfMemory") ||
    message.includes("FATAL")
  ) {
    return "CRITICAL";
  }

  // Permanent errors
  if (
    message.includes("ENOENT") ||
    message.includes("EACCES") ||
    message.includes("EINVAL")
  ) {
    return "PERMANENT";
  }

  // Default to transient
  return "TRANSIENT";
}

/**
 * Select recovery strategy based on failure type and context
 */
export function selectRecoveryStrategy(
  failureType: FailureType,
  attempt: number = 0,
  maxAttempts: number = 3
): RecoveryStrategy {
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
export function explainFailure(error: Error): string {
  const type = classifyFailure(error);
  const strategy = selectRecoveryStrategy(type);

  return `[${type}] ${error.message} - Recovery: ${strategy}`;
}

