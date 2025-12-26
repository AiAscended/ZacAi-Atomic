/**
 * System Kernel - Main Orchestrator
 * Coordinates state, scheduling, clock, and recovery
 */

import { KernelState } from "./KernelState";
import { KernelScheduler, ScheduledTask } from "./KernelScheduler";
import { KernelRecovery, RecoveryOptions } from "./KernelRecovery";
import { SystemClock } from "../clock/SystemClock";
import { KernelLogger } from "../utils/logging";
import { KernelConfig, KernelEvent } from "../types/kernel";

export type EventListener<T extends KernelEvent> = (payload: any) => void | Promise<void>;

export class SystemKernel {
  readonly state = new KernelState();
  readonly scheduler = new KernelScheduler();
  readonly logger = new KernelLogger();
  readonly recovery = new KernelRecovery(this.state, this.logger);
  readonly clock = new SystemClock();

  private eventListeners = new Map<KernelEvent, EventListener<any>[]>();
  private config: Required<KernelConfig>;

  constructor(config: KernelConfig = {}) {
    this.config = {
      tickIntervalMs: config.tickIntervalMs ?? 1000,
      enableLogging: config.enableLogging ?? false,
      recoveryMode: config.recoveryMode ?? "CONSERVATIVE",
    };
  }

  /**
   * Boot the kernel
   */
  boot(): void {
    this.logger.log("SystemKernel", "Booting kernel", "INFO" as any);

    this.state.transition("BOOT");
    this.emit(KernelEvent.BOOT, { mode: "BOOT" });

    // Set up tick handler
    this.clock.onTick((tick) => this.cycle(tick));

    // Start clock
    this.state.transition("RUN");
    this.clock.start(this.config.tickIntervalMs);

    this.emit(KernelEvent.RUN, { tick: 0 });
    this.logger.log("SystemKernel", "Kernel ready", "INFO" as any);
  }

  /**
   * Run one cycle (called on each tick)
   */
  private async cycle(tick: number): Promise<void> {
    const startTime = Date.now();

    try {
      this.state.tick();
      await this.scheduler.runCycle();

      const duration = Date.now() - startTime;
      this.emit(KernelEvent.CYCLE, { tick, duration });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.emit(KernelEvent.ERROR, {
        error,
        severity: "HIGH",
      });
      this.recovery.recover(error);
    }
  }

  /**
   * Enqueue a task to run in next cycle
   */
  enqueueTask(task: ScheduledTask, priority?: number): string {
    return this.scheduler.enqueue(task, priority);
  }

  /**
   * Shutdown kernel gracefully
   */
  async shutdown(): Promise<void> {
    this.logger.log("SystemKernel", "Initiating shutdown", "INFO" as any);

    this.clock.stop();
    this.state.transition("SHUTDOWN");

    this.emit(KernelEvent.SHUTDOWN, { graceful: true });
    this.logger.log("SystemKernel", "Shutdown complete", "INFO" as any);
  }

  /**
   * Get current state snapshot
   */
  getState() {
    return this.state.snapshot;
  }

  /**
   * Register event listener
   */
  on<T extends KernelEvent>(
    event: T,
    listener: EventListener<T>
  ): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }

    const listeners = this.eventListeners.get(event)!;
    listeners.push(listener);

    // Return unsubscribe
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }

  /**
   * Emit event
   */
  private emit<T extends KernelEvent>(event: T, payload: any): void {
    const listeners = this.eventListeners.get(event) || [];
    for (const listener of listeners) {
      try {
        listener(payload);
      } catch (error) {
        this.logger.log(
          "SystemKernel",
          `Event listener failed: ${error}`,
          "WARN" as any
        );
      }
    }
  }
}

