/**
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

