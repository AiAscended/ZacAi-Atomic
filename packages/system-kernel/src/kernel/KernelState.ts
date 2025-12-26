/**
 * Kernel State Machine
 * Immutable state snapshots with strict mode transitions
 */

import { SystemMode, KernelStateSnapshot } from "../types/kernel";

export class KernelState {
  private state: KernelStateSnapshot = {
    mode: "BOOT",
    tick: 0,
    healthy: true,
    timestamp: Date.now(),
  };

  /**
   * Get immutable snapshot of current state
   */
  get snapshot(): KernelStateSnapshot {
    return Object.freeze({ ...this.state });
  }

  /**
   * Get current mode
   */
  get mode(): SystemMode {
    return this.state.mode;
  }

  /**
   * Get current tick count
   */
  get tick(): number {
    return this.state.tick;
  }

  /**
   * Check if system is healthy
   */
  get isHealthy(): boolean {
    return this.state.healthy;
  }

  /**
   * Transition to new mode
   * Validates transition is legal
   */
  transition(newMode: SystemMode): boolean {
    const validTransitions: Record<SystemMode, SystemMode[]> = {
      BOOT: ["RUN"],
      RUN: ["SAFE", "SHUTDOWN"],
      SAFE: ["RUN", "SHUTDOWN"],
      SHUTDOWN: [],
    };

    if (!validTransitions[this.state.mode].includes(newMode)) {
      return false;
    }

    this.state.mode = newMode;
    this.state.timestamp = Date.now();
    return true;
  }

  /**
   * Increment tick counter
   */
  tick(): void {
    this.state.tick += 1;
    this.state.timestamp = Date.now();
  }

  /**
   * Mark system as failed
   */
  fail(error: string): void {
    this.state.healthy = false;
    this.state.lastError = error;
    this.state.mode = "SAFE";
    this.state.timestamp = Date.now();
  }

  /**
   * Recover from failed state
   */
  recover(): void {
    this.state.healthy = true;
    this.state.lastError = undefined;
    this.state.timestamp = Date.now();
  }
}

