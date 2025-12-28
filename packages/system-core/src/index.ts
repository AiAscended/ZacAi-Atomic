/**
 * ZacAi System Core
 * Enterprise hospital-grade orchestration system
 *
 * Provides:
 * - Kernel integration (lifecycle, execution)
 * - Compliance tracking (audit trails)
 * - Health monitoring (metrics, alerts)
 * - Recovery management (error handling)
 */

// Export kernel integration
export { CoreKernel, type CoreKernelConfig, type WorkloadOptions } from './kernel/CoreKernel';

// Export compliance
export {
  ComplianceTracker,
  type ComplianceEvent,
  type ComplianceFilter,
  type ComplianceLevel,
} from './compliance/ComplianceTracker';

// Export health
export {
  HealthMonitor,
  type HealthMetrics,
  type HealthAlert,
  type AlertLevel,
} from './health/HealthMonitor';

// Re-export kernel types for convenience
export {
  SystemKernel,
  KernelState,
  SystemClock,
  KernelEvent,
  type KernelStateSnapshot,
  type KernelConfig,
} from '@zacai/system-kernel';

// Re-export methods for convenience
export * as kernelMethods from '@zacai/system-kernel-methods';
