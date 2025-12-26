/**
 * Kernel Recovery & Error Handling
 * Implements recovery strategies for kernel failures
 */
import { KernelState } from "./KernelState";
import { KernelLogger } from "../utils/logging";
export type RecoveryStrategy = "RESTART" | "SKIP" | "ESCALATE";
export interface RecoveryOptions {
    maxRetries?: number;
    backoffMs?: number;
    strategy?: RecoveryStrategy;
}
export declare class KernelRecovery {
    private state;
    private logger;
    constructor(state: KernelState, logger: KernelLogger);
    /**
     * Recover from an error
     */
    recover(error: Error, options?: RecoveryOptions): void;
    /**
     * Check if recovery is possible
     */
    isRecoverable(error: Error): boolean;
}
//# sourceMappingURL=KernelRecovery.d.ts.map