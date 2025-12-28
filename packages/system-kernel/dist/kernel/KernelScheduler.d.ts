/**
 * Kernel Task Scheduler
 * Deterministic, priority-based task scheduling
 */
export type ScheduledTask = () => Promise<void> | void;
export interface TaskDescriptor {
    id: string;
    task: ScheduledTask;
    priority: number;
    retries?: number;
}
export declare class KernelScheduler {
    private queue;
    private taskIdCounter;
    /**
     * Enqueue a task with optional priority (higher = runs first)
     */
    enqueue(task: ScheduledTask, priority?: number): string;
    /**
     * Run all queued tasks in order
     */
    runCycle(): Promise<void>;
    /**
     * Get queue length
     */
    get length(): number;
    /**
     * Clear all queued tasks
     */
    clear(): void;
}
//# sourceMappingURL=KernelScheduler.d.ts.map