/**
 * System Kernel - Main Orchestrator
 * Coordinates state, scheduling, clock, and recovery
 */
import { KernelState } from "./KernelState";
import { KernelScheduler, ScheduledTask } from "./KernelScheduler";
import { KernelRecovery } from "./KernelRecovery";
import { SystemClock } from "../clock/SystemClock";
import { KernelLogger } from "../utils/logging";
import { KernelConfig, KernelEvent } from "../types/kernel";
export type EventListener<T extends KernelEvent> = (payload: any) => void | Promise<void>;
export declare class SystemKernel {
    readonly state: KernelState;
    readonly scheduler: KernelScheduler;
    readonly logger: KernelLogger;
    readonly recovery: KernelRecovery;
    readonly clock: SystemClock;
    private eventListeners;
    private config;
    constructor(config?: KernelConfig);
    /**
     * Boot the kernel
     */
    boot(): void;
    /**
     * Run one cycle (called on each tick)
     */
    private cycle;
    /**
     * Enqueue a task to run in next cycle
     */
    enqueueTask(task: ScheduledTask, priority?: number): string;
    /**
     * Shutdown kernel gracefully
     */
    shutdown(): Promise<void>;
    /**
     * Get current state snapshot
     */
    getState(): import("../types/kernel").KernelStateSnapshot;
    /**
     * Register event listener
     */
    on<T extends KernelEvent>(event: T, listener: EventListener<T>): () => void;
    /**
     * Emit event
     */
    private emit;
}
//# sourceMappingURL=SystemKernel.d.ts.map