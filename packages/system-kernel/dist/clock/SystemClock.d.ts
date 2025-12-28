/**
 * System Clock (Heartbeat)
 * Provides predictable tick-based execution
 */
export type TickHandler = (tick: number) => void | Promise<void>;
export declare class SystemClock {
    private tickCount;
    private handlers;
    private interval?;
    private paused;
    /**
     * Start clock with given interval
     */
    start(periodMs?: number): void;
    /**
     * Stop clock
     */
    stop(): void;
    /**
     * Pause clock (keeps interval running but doesnt tick)
     */
    pause(): void;
    /**
     * Resume clock
     */
    resume(): void;
    /**
     * Register handler to run on each tick
     */
    onTick(handler: TickHandler): () => void;
    /**
     * Get current tick count
     */
    get ticks(): number;
    /**
     * Check if running
     */
    get isRunning(): boolean;
    /**
     * Internal: execute one tick
     */
    private pulse;
}
//# sourceMappingURL=SystemClock.d.ts.map