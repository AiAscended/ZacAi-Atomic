/**
 * Lifecycle Methods - Pure Deterministic Functions
 * All transitions, validations, and state logic
 */
export type SystemMode = "BOOT" | "RUN" | "SAFE" | "SHUTDOWN";
/**
 * Validate if transition from one mode to another is legal
 * @param from Current mode
 * @param to Target mode
 * @returns true if transition is allowed
 */
export declare function validateLifecycleTransition(from: SystemMode, to: SystemMode): boolean;
/**
 * Get next valid modes from current mode
 */
export declare function getValidTransitions(from: SystemMode): SystemMode[];
/**
 * Check if mode is safe for operations
 */
export declare function isSafeMode(mode: SystemMode): boolean;
/**
 * Get mode description
 */
export declare function getModeDescription(mode: SystemMode): string;
//# sourceMappingURL=lifecycle.d.ts.map