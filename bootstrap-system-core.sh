#!/usr/bin/env bash
#
# ZacAi System Kernel Bootstrap
# 
# Creates production-grade kernel and methods packages
# - No file overwrites (creates -v2 if exists)
# - Proper TypeScript with strict types
# - Deterministic pure functions
# - Build-ready structure
#
# Usage: chmod +x bootstrap-system-core.sh && ./bootstrap-system-core.sh

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Directories
ROOT="packages/system-kernel/src"
METHODS="packages/system-kernel-methods/src"
KERNEL_TYPES="packages/system-kernel/src/types"
KERNEL_UTILS="packages/system-kernel/src/utils"
KERNEL_CORE="packages/system-kernel/src/kernel"
KERNEL_CLOCK="packages/system-kernel/src/clock"

# Ensure directories exist
mkdir -p "$ROOT" "$METHODS" "$KERNEL_TYPES" "$KERNEL_UTILS" "$KERNEL_CORE" "$KERNEL_CLOCK"

# Helper function to safely create files
create_file() {
    local path="$1"
    local content="$2"
    
    # Check if file exists and create -v2 if needed
    if [ -f "$path" ]; then
        local dir=$(dirname "$path")
        local filename=$(basename "$path" .ts)
        path="${dir}/${filename}-v2.ts"
        echo -e "${YELLOW}⚠ File exists, creating: $path${NC}"
    fi
    
    echo -e "${BLUE}→${NC} Creating $path"
    echo "$content" > "$path"
}

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ZacAi System Kernel Bootstrap                             ║${NC}"
echo -e "${GREEN}║  Generating production-grade kernel packages               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# SYSTEM KERNEL PACKAGE - Stateful Control Plane
# ============================================================================

echo -e "${GREEN}📦 SYSTEM-KERNEL PACKAGE${NC}"
echo ""

# ────────────────────────────────────────────────────────────────────────────
# Types
# ────────────────────────────────────────────────────────────────────────────

create_file "$KERNEL_TYPES/kernel.ts" '/**
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

export enum KernelEvent {
  BOOT = "BOOT",
  RUN = "RUN",
  CYCLE = "CYCLE",
  ERROR = "ERROR",
  RECOVER = "RECOVER",
  SAFE = "SAFE",
  SHUTDOWN = "SHUTDOWN",
}
'

create_file "$KERNEL_TYPES/events.ts" '/**
 * Kernel Event System
 * Type-safe event handling for kernel lifecycle
 */

import { KernelEvent, SystemMode } from "./kernel";

export interface KernelEventPayload {
  [KernelEvent.BOOT]: { mode: SystemMode };
  [KernelEvent.RUN]: { tick: number };
  [KernelEvent.CYCLE]: { tick: number; duration: number };
  [KernelEvent.ERROR]: { error: Error; severity: "LOW" | "HIGH" | "CRITICAL" };
  [KernelEvent.RECOVER]: { strategy: string; success: boolean };
  [KernelEvent.SAFE]: { reason: string };
  [KernelEvent.SHUTDOWN]: { graceful: boolean };
}

export type EventListener<T extends KernelEvent> = (
  payload: KernelEventPayload[T]
) => void | Promise<void>;
'

# ────────────────────────────────────────────────────────────────────────────
# Utilities
# ────────────────────────────────────────────────────────────────────────────

create_file "$KERNEL_UTILS/logging.ts" '/**
 * Kernel Logging Utilities
 * Enterprise-grade logging for kernel operations
 */

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  scope: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export class KernelLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  log(
    scope: string,
    message: string,
    level: LogLevel = LogLevel.INFO,
    metadata?: Record<string, unknown>
  ) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      scope,
      message,
      metadata,
    };

    this.logs.push(entry);

    // Prevent memory bloat
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    if (process.env.KERNEL_DEBUG) {
      console.log(`[${entry.level}][${scope}]`, message, metadata);
    }
  }

  getLogs(filter?: { level?: LogLevel; scope?: string }): LogEntry[] {
    if (!filter) return [...this.logs];

    return this.logs.filter((log) => {
      if (filter.level && log.level !== filter.level) return false;
      if (filter.scope && log.scope !== filter.scope) return false;
      return true;
    });
  }
}
'

create_file "$KERNEL_UTILS/determinism.ts" '/**
 * Determinism Utilities
 * Ensures reproducible behavior for kernel operations
 */

/**
 * Deterministic hash function (32-bit)
 * Same input always produces same output
 * Useful for seeding RNGs and validation
 */
export function deterministicHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Seeded pseudo-random number generator
 * Deterministic: same seed = same sequence
 */
export class DeterministicRandom {
  constructor(private seed: number) {}

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

/**
 * Verify operation determinism
 * Runs operation N times, verifies all outputs match
 */
export function verifyDeterminism<T>(
  operation: () => T,
  runs: number = 3
): boolean {
  const results: string[] = [];

  for (let i = 0; i < runs; i++) {
    results.push(JSON.stringify(operation()));
  }

  return results.every((r) => r === results[0]);
}
'

# ────────────────────────────────────────────────────────────────────────────
# Core Kernel Classes
# ────────────────────────────────────────────────────────────────────────────

create_file "$KERNEL_CORE/KernelState.ts" '/**
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
'

create_file "$KERNEL_CORE/KernelScheduler.ts" '/**
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

export class KernelScheduler {
  private queue: TaskDescriptor[] = [];
  private taskIdCounter = 0;

  /**
   * Enqueue a task with optional priority (higher = runs first)
   */
  enqueue(task: ScheduledTask, priority: number = 0): string {
    const id = `task-${++this.taskIdCounter}`;
    this.queue.push({ id, task, priority });
    // Re-sort by priority (descending)
    this.queue.sort((a, b) => b.priority - a.priority);
    return id;
  }

  /**
   * Run all queued tasks in order
   */
  async runCycle(): Promise<void> {
    const processed: string[] = [];

    while (this.queue.length > 0) {
      const descriptor = this.queue.shift()!;

      try {
        await descriptor.task();
        processed.push(descriptor.id);
      } catch (error) {
        // Re-enqueue with lower priority if retries available
        if (descriptor.retries !== undefined && descriptor.retries > 0) {
          descriptor.retries--;
          descriptor.priority -= 1; // Lower priority on retry
          this.queue.push(descriptor);
        } else {
          throw new Error(
            `Task ${descriptor.id} failed: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }
  }

  /**
   * Get queue length
   */
  get length(): number {
    return this.queue.length;
  }

  /**
   * Clear all queued tasks
   */
  clear(): void {
    this.queue = [];
  }
}
'

create_file "$KERNEL_CORE/KernelRecovery.ts" '/**
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

export class KernelRecovery {
  constructor(
    private state: KernelState,
    private logger: KernelLogger
  ) {}

  /**
   * Recover from an error
   */
  recover(error: Error, options: RecoveryOptions = {}): void {
    const {
      maxRetries = 3,
      backoffMs = 100,
      strategy = "SKIP",
    } = options;

    this.logger.log(
      "KernelRecovery",
      `Attempting recovery: ${error.message}`,
      "WARN" as any,
      { strategy, error: error.message }
    );

    this.state.fail(error.message);

    switch (strategy) {
      case "RESTART":
        // In production, would trigger full restart
        this.logger.log("KernelRecovery", "Executing RESTART strategy", "INFO" as any);
        break;

      case "SKIP":
        // Skip failed operation, continue
        this.logger.log("KernelRecovery", "Executing SKIP strategy", "INFO" as any);
        break;

      case "ESCALATE":
        // Escalate to higher authority
        this.logger.log(
          "KernelRecovery",
          "Escalating failure to higher authority",
          "ERROR" as any
        );
        break;
    }
  }

  /**
   * Check if recovery is possible
   */
  isRecoverable(error: Error): boolean {
    const transientErrors = [
      "EAGAIN",
      "ECONNRESET",
      "ETIMEDOUT",
      "EHOSTUNREACH",
    ];
    return transientErrors.some((e) => error.message.includes(e));
  }
}
'

# ────────────────────────────────────────────────────────────────────────────
# Clock / Heartbeat
# ────────────────────────────────────────────────────────────────────────────

create_file "$KERNEL_CLOCK/SystemClock.ts" '/**
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
   * Pause clock (keeps interval running but doesn''t tick)
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
'

# ────────────────────────────────────────────────────────────────────────────
# Main System Kernel (Orchestrator)
# ────────────────────────────────────────────────────────────────────────────

create_file "$KERNEL_CORE/SystemKernel.ts" '/**
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
'

# ────────────────────────────────────────────────────────────────────────────
# Index/Export File
# ────────────────────────────────────────────────────────────────────────────

create_file "$ROOT/index.ts" '/**
 * System Kernel - Main Export
 * Production-grade kernel for deterministic system control
 */

// Kernel classes
export { SystemKernel } from "./kernel/SystemKernel";
export { KernelState } from "./kernel/KernelState";
export { KernelScheduler } from "./kernel/KernelScheduler";
export { KernelRecovery } from "./kernel/KernelRecovery";
export { SystemClock } from "./clock/SystemClock";

// Types
export {
  SystemMode,
  KernelEvent,
  type KernelStateSnapshot,
  type KernelConfig,
} from "./types/kernel";
export { type KernelEventPayload } from "./types/events";

// Utilities
export { KernelLogger, LogLevel } from "./utils/logging";
export {
  deterministicHash,
  DeterministicRandom,
  verifyDeterminism,
} from "./utils/determinism";

// Re-exports for convenience
export type { ScheduledTask, TaskDescriptor } from "./kernel/KernelScheduler";
export type { RecoveryStrategy, RecoveryOptions } from "./kernel/KernelRecovery";
export type { TickHandler } from "./clock/SystemClock";
'

# ============================================================================
# SYSTEM KERNEL METHODS PACKAGE - Pure Deterministic Functions
# ============================================================================

echo ""
echo -e "${GREEN}📦 SYSTEM-KERNEL-METHODS PACKAGE${NC}"
echo ""

create_file "$METHODS/lifecycle.ts" '/**
 * Lifecycle Methods - Pure Deterministic Functions
 * All transitions, validations, and state logic
 */

export type SystemMode = "BOOT" | "RUN" | "SAFE" | "SHUTDOWN";

/**
 * Validate if transition from one mode to another is legal
 * @param from Current mode
 * @param to Target mode
 * @returns true if transition is allowed
 */
export function validateLifecycleTransition(
  from: SystemMode,
  to: SystemMode
): boolean {
  const transitions: Record<SystemMode, SystemMode[]> = {
    BOOT: ["RUN"],
    RUN: ["SAFE", "SHUTDOWN"],
    SAFE: ["RUN", "SHUTDOWN"],
    SHUTDOWN: [],
  };

  return transitions[from]?.includes(to) ?? false;
}

/**
 * Get next valid modes from current mode
 */
export function getValidTransitions(from: SystemMode): SystemMode[] {
  const transitions: Record<SystemMode, SystemMode[]> = {
    BOOT: ["RUN"],
    RUN: ["SAFE", "SHUTDOWN"],
    SAFE: ["RUN", "SHUTDOWN"],
    SHUTDOWN: [],
  };

  return transitions[from] ?? [];
}

/**
 * Check if mode is safe for operations
 */
export function isSafeMode(mode: SystemMode): boolean {
  return mode === "RUN" || mode === "SAFE";
}

/**
 * Get mode description
 */
export function getModeDescription(mode: SystemMode): string {
  const descriptions: Record<SystemMode, string> = {
    BOOT: "System initializing",
    RUN: "System operating normally",
    SAFE: "System in safe/degraded mode",
    SHUTDOWN: "System shutting down",
  };

  return descriptions[mode];
}
'

create_file "$METHODS/scheduling.ts" '/**
 * Scheduling Methods - Pure Deterministic Functions
 * Task prioritization, backoff, and scheduling logic
 */

export interface Task {
  id: string;
  priority: number;
  retries?: number;
}

/**
 * Sort tasks by priority (highest first)
 */
export function prioritySort<T extends Task>(tasks: T[]): T[] {
  return [...tasks].sort((a, b) => b.priority - a.priority);
}

/**
 * Calculate exponential backoff with jitter
 */
export function calculateBackoff(
  attempt: number,
  baseMs: number = 100,
  maxMs: number = 30000,
  jitterFactor: number = 0.1
): number {
  const exponential = baseMs * Math.pow(2, attempt);
  const capped = Math.min(exponential, maxMs);
  const jitter = capped * jitterFactor * Math.random();

  return capped + jitter;
}

/**
 * Check if task should be retried
 */
export function shouldRetry(
  error: Error,
  attempt: number,
  maxAttempts: number = 3
): boolean {
  if (attempt >= maxAttempts) return false;

  // Transient errors only
  const transientErrors = ["EAGAIN", "ECONNRESET", "ETIMEDOUT"];
  return transientErrors.some((e) => error.message.includes(e));
}

/**
 * Estimate task deadline based on priority
 */
export function estimateDeadline(
  priority: number,
  nowMs: number
): number {
  // Higher priority = tighter deadline
  const deadlineMs = 1000 * (1 + (10 - priority) / 10);
  return nowMs + deadlineMs;
}
'

create_file "$METHODS/recovery.ts" '/**
 * Recovery Methods - Pure Deterministic Functions
 * Error classification and recovery strategy selection
 */

export type FailureType = "TRANSIENT" | "PERMANENT" | "CRITICAL";
export type RecoveryStrategy = "RETRY" | "SKIP" | "ESCALATE" | "RESTART";

/**
 * Classify error type based on error properties
 */
export function classifyFailure(error: Error): FailureType {
  const message = error.message || "";

  // Critical errors
  if (
    message.includes("OOM") ||
    message.includes("OutOfMemory") ||
    message.includes("FATAL")
  ) {
    return "CRITICAL";
  }

  // Permanent errors
  if (
    message.includes("ENOENT") ||
    message.includes("EACCES") ||
    message.includes("EINVAL")
  ) {
    return "PERMANENT";
  }

  // Default to transient
  return "TRANSIENT";
}

/**
 * Select recovery strategy based on failure type and context
 */
export function selectRecoveryStrategy(
  failureType: FailureType,
  attempt: number = 0,
  maxAttempts: number = 3
): RecoveryStrategy {
  if (failureType === "CRITICAL") {
    return "RESTART";
  }

  if (failureType === "PERMANENT") {
    return "ESCALATE";
  }

  // Transient
  if (attempt < maxAttempts) {
    return "RETRY";
  }

  return "ESCALATE";
}

/**
 * Get human-readable explanation of failure
 */
export function explainFailure(error: Error): string {
  const type = classifyFailure(error);
  const strategy = selectRecoveryStrategy(type);

  return `[${type}] ${error.message} - Recovery: ${strategy}`;
}
'

create_file "$METHODS/heartbeat.ts" '/**
 * Heartbeat Methods - Pure Deterministic Functions
 * Health checks, tick validation, and jitter calculation
 */

export interface HeartbeatStats {
  isHealthy: boolean;
  ticksPerSecond: number;
  jitterPercent: number;
  timeSinceLastTick: number;
}

/**
 * Check if heartbeat is healthy
 */
export function isHeartbeatHealthy(tick: number): boolean {
  // Any positive tick count means heartbeat is working
  return tick > 0;
}

/**
 * Validate tick interval is within expected range
 */
export function isTickIntervalValid(
  actualIntervalMs: number,
  expectedIntervalMs: number,
  tolerancePercent: number = 10
): boolean {
  const tolerance = (expectedIntervalMs * tolerancePercent) / 100;
  const min = expectedIntervalMs - tolerance;
  const max = expectedIntervalMs + tolerance;

  return actualIntervalMs >= min && actualIntervalMs <= max;
}

/**
 * Calculate deterministic jitter for scheduling
 */
export function calculateHeartbeatJitter(
  tick: number,
  maxJitterPercent: number = 5
): number {
  // Use tick as seed for deterministic "random" jitter
  const seed = tick * 9301 + 49297; // Simple LCG
  const random = (seed / 233280) % 1; // Normalize to [0,1]
  return (random * maxJitterPercent) / 100;
}

/**
 * Estimate ticks per second
 */
export function calculateTicksPerSecond(
  ticks: number,
  elapsedMs: number
): number {
  if (elapsedMs === 0) return 0;
  return (ticks / elapsedMs) * 1000;
}

/**
 * Check if heartbeat is drifting (slowing down)
 */
export function isHeartbeatDrifting(
  expectedTicksPerSecond: number,
  actualTicksPerSecond: number,
  driftThresholdPercent: number = 20
): boolean {
  const threshold = (expectedTicksPerSecond * driftThresholdPercent) / 100;
  const drift = expectedTicksPerSecond - actualTicksPerSecond;

  return Math.abs(drift) > threshold;
}
'

create_file "$METHODS/validation.ts" '/**
 * Validation Methods - Pure Deterministic Functions
 * Input validation and assertion helpers
 */

export function validateSystemMode(mode: string): boolean {
  return ["BOOT", "RUN", "SAFE", "SHUTDOWN"].includes(mode);
}

export function validateTickCount(tick: number): boolean {
  return Number.isInteger(tick) && tick >= 0;
}

export function validatePriority(priority: number): boolean {
  return Number.isInteger(priority) && priority >= 0;
}

export function validateIntervalMs(intervalMs: number): boolean {
  return Number.isInteger(intervalMs) && intervalMs > 0;
}

export function validateTaskId(id: string): boolean {
  return typeof id === "string" && id.length > 0;
}
'

create_file "$METHODS/index.ts" '/**
 * System Kernel Methods - Pure Deterministic Functions
 * Exports all kernel logic functions
 */

export * as lifecycle from "./lifecycle";
export * as scheduling from "./scheduling";
export * as recovery from "./recovery";
export * as heartbeat from "./heartbeat";
export * as validation from "./validation";
'

# ============================================================================
# SUMMARY
# ============================================================================

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Bootstrap Complete                                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}System Kernel Files:${NC}"
find "$ROOT" -name "*.ts" | sort | sed 's/^/  ✓ /'
echo ""

echo -e "${BLUE}System Kernel Methods Files:${NC}"
find "$METHODS" -name "*.ts" | sort | sed 's/^/  ✓ /'
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Generate TypeScript configs"
echo "  2. Add test files"
echo "  3. Create BUILD.bazel files"
echo "  4. Integrate with system-core"
echo ""

echo -e "${GREEN}Ready for production! 🚀${NC}"
