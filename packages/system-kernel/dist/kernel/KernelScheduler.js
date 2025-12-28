"use strict";
/**
 * Kernel Task Scheduler
 * Deterministic, priority-based task scheduling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KernelScheduler = void 0;
class KernelScheduler {
    queue = [];
    taskIdCounter = 0;
    /**
     * Enqueue a task with optional priority (higher = runs first)
     */
    enqueue(task, priority = 0) {
        const id = `task-${++this.taskIdCounter}`;
        this.queue.push({ id, task, priority });
        // Re-sort by priority (descending)
        this.queue.sort((a, b) => b.priority - a.priority);
        return id;
    }
    /**
     * Run all queued tasks in order
     */
    async runCycle() {
        const processed = [];
        while (this.queue.length > 0) {
            const descriptor = this.queue.shift();
            try {
                await descriptor.task();
                processed.push(descriptor.id);
            }
            catch (error) {
                // Re-enqueue with lower priority if retries available
                if (descriptor.retries !== undefined && descriptor.retries > 0) {
                    descriptor.retries--;
                    descriptor.priority -= 1; // Lower priority on retry
                    this.queue.push(descriptor);
                }
                else {
                    throw new Error(`Task ${descriptor.id} failed: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        }
    }
    /**
     * Get queue length
     */
    get length() {
        return this.queue.length;
    }
    /**
     * Clear all queued tasks
     */
    clear() {
        this.queue = [];
    }
}
exports.KernelScheduler = KernelScheduler;
//# sourceMappingURL=KernelScheduler.js.map