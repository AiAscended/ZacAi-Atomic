/**
 * System Clock (Heartbeat)
 * Provides predictable tick-based execution
 */

export type TickHandler = (tick: number) => void | Promise<void>;

export class SystemClock {
  private tickCount = 0;
  private handlers: TickHandler[] = [];
  private interval?: NodeJS.Timeout;
  private paused = false;

  /**
   * Start clock with given interval
   */
  start(periodMs: number = 1000): void {
    if (this.interval) return;

    this.interval = setInterval(() => {
      if (!this.paused) {
        this.pulse();
      }
    }, periodMs);
  }

  /**
   * Stop clock
   */
  stop(): void {
    if (this.interval) clearInterval(this.interval);
    this.interval = undefined;
  }

  /**
   * Pause clock (keeps interval running but doesnt tick)
   */
  pause(): void {
    this.paused = true;
  }

  /**
   * Resume clock
   */
  resume(): void {
    this.paused = false;
  }

  /**
   * Register handler to run on each tick
   */
  onTick(handler: TickHandler): () => void {
    this.handlers.push(handler);

    // Return unsubscribe function
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  /**
   * Get current tick count
   */
  get ticks(): number {
    return this.tickCount;
  }

  /**
   * Check if running
   */
  get isRunning(): boolean {
    return this.interval !== undefined;
  }

  /**
   * Internal: execute one tick
   */
  private async pulse(): Promise<void> {
    this.tickCount++;
    for (const handler of this.handlers) {
      try {
        await handler(this.tickCount);
      } catch (error) {
        console.error("Tick handler failed:", error);
      }
    }
  }
}

