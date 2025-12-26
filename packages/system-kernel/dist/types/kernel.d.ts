/**
 * Core Kernel Types
 * Defines system state machine and kernel contracts
 */
export type SystemMode = "BOOT" | "RUN" | "SAFE" | "SHUTDOWN";
export interface KernelStateSnapshot {
    mode: SystemMode;
    tick: number;
    healthy: boolean;
    lastError?: string;
    timestamp: number;
}
export interface KernelConfig {
    tickIntervalMs?: number;
    enableLogging?: boolean;
    recoveryMode?: "AGGRESSIVE" | "CONSERVATIVE";
}
export declare enum KernelEvent {
    BOOT = "BOOT",
    RUN = "RUN",
    CYCLE = "CYCLE",
    ERROR = "ERROR",
    RECOVER = "RECOVER",
    SAFE = "SAFE",
    SHUTDOWN = "SHUTDOWN"
}
//# sourceMappingURL=kernel.d.ts.map