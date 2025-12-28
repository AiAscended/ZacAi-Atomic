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
export function validateLifecycleTransition(
  from: SystemMode,
  to: SystemMode
): boolean {
  const transitions: Record<SystemMode, SystemMode[]> = {
    BOOT: ["RUN"],
    RUN: ["SAFE", "SHUTDOWN"],
    SAFE: ["RUN", "SHUTDOWN"],
    SHUTDOWN: [],
  };

  return transitions[from]?.includes(to) ?? false;
}

/**
 * Get next valid modes from current mode
 */
export function getValidTransitions(from: SystemMode): SystemMode[] {
  const transitions: Record<SystemMode, SystemMode[]> = {
    BOOT: ["RUN"],
    RUN: ["SAFE", "SHUTDOWN"],
    SAFE: ["RUN", "SHUTDOWN"],
    SHUTDOWN: [],
  };

  return transitions[from] ?? [];
}

/**
 * Check if mode is safe for operations
 */
export function isSafeMode(mode: SystemMode): boolean {
  return mode === "RUN" || mode === "SAFE";
}

/**
 * Get mode description
 */
export function getModeDescription(mode: SystemMode): string {
  const descriptions: Record<SystemMode, string> = {
    BOOT: "System initializing",
    RUN: "System operating normally",
    SAFE: "System in safe/degraded mode",
    SHUTDOWN: "System shutting down",
  };

  return descriptions[mode];
}

