/**
 * Recovery Methods - Pure Deterministic Functions
 * Error classification and recovery strategy selection
 */
export type FailureType = "TRANSIENT" | "PERMANENT" | "CRITICAL";
export type RecoveryStrategy = "RETRY" | "SKIP" | "ESCALATE" | "RESTART";
/**
 * Classify error type based on error properties
 */
export declare function classifyFailure(error: Error): FailureType;
/**
 * Select recovery strategy based on failure type and context
 */
export declare function selectRecoveryStrategy(failureType: FailureType, attempt?: number, maxAttempts?: number): RecoveryStrategy;
/**
 * Get human-readable explanation of failure
 */
export declare function explainFailure(error: Error): string;
//# sourceMappingURL=recovery.d.ts.map