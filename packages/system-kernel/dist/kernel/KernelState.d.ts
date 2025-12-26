/**
 * Kernel State Machine
 * Immutable state snapshots with strict mode transitions
 */
import { SystemMode, KernelStateSnapshot } from "../types/kernel";
export declare class KernelState {
    private state;
    /**
     * Get immutable snapshot of current state
     */
    get snapshot(): KernelStateSnapshot;
    /**
     * Get current mode
     */
    get mode(): SystemMode;
    /**
     * Get current tick count
     */
    get tick(): number;
    /**
     * Check if system is healthy
     */
    get isHealthy(): boolean;
    /**
     * Transition to new mode
     * Validates transition is legal
     */
    transition(newMode: SystemMode): boolean;
    /**
     * Increment tick counter
     */
    tick(): void;
    /**
     * Mark system as failed
     */
    fail(error: string): void;
    /**
     * Recover from failed state
     */
    recover(): void;
}
//# sourceMappingURL=KernelState.d.ts.map