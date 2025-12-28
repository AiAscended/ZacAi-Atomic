/**
 * Core Kernel Wrapper
 * Enterprise-grade integration point between system-core and @zacai/system-kernel
 * Handles lifecycle orchestration, compliance tracking, health monitoring
 */

import { SystemKernel, KernelEvent, type KernelStateSnapshot } from '@zacai/system-kernel';
import * as methods from '@zacai/system-kernel-methods';
import { ComplianceTracker } from '../compliance/ComplianceTracker';
import { HealthMonitor } from '../health/HealthMonitor';

export interface CoreKernelConfig {
  // Kernel settings
  tickIntervalMs?: number;
  enableLogging?: boolean;
  recoveryMode?: 'AGGRESSIVE' | 'CONSERVATIVE';

  // Enterprise settings
  complianceLevel?: 'HIPAA' | 'FDA' | 'SOC2' | 'ISO27001';
  healthCheckIntervalMs?: number;
  metricsCollectionMs?: number;
  auditTrailEnabled?: boolean;
  maxRetries?: number;
}

export interface WorkloadOptions {
  priority?: number;
  criticality?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  timeout?: number;
  maxRetries?: number;
}

interface WorkloadDescriptor {
  id: string;
  priority: number;
  criticality: string;
  timeout: number;
  maxRetries: number;
  enqueuedAt: number;
}

/**
 * Core Kernel - Hospital-grade system orchestrator
 * Manages kernel lifecycle, compliance, health, and recovery
 */
export class CoreKernel {
  private kernel: SystemKernel;
  private compliance: ComplianceTracker;
  private health: HealthMonitor;
  private config: Required<CoreKernelConfig>;
  private workload: Map<string, WorkloadDescriptor> = new Map();
  private isInitialized = false;

  constructor(config: CoreKernelConfig = {}) {
    // Validate and set configuration
    const complianceLevel = config.complianceLevel ?? 'SOC2';

    this.config = {
      tickIntervalMs: config.tickIntervalMs ?? 1000,
      enableLogging: config.enableLogging ?? true,
      recoveryMode: config.recoveryMode ?? 'CONSERVATIVE',
      complianceLevel,
      healthCheckIntervalMs: config.healthCheckIntervalMs ?? 5000,
      metricsCollectionMs: config.metricsCollectionMs ?? 10000,
      auditTrailEnabled: config.auditTrailEnabled ?? true,
      maxRetries: config.maxRetries ?? 3,
    };

    // Initialize kernel
    this.kernel = new SystemKernel({
      tickIntervalMs: this.config.tickIntervalMs,
      enableLogging: this.config.enableLogging,
      recoveryMode: this.config.recoveryMode,
    });

    // Initialize enterprise systems
    this.compliance = new ComplianceTracker(complianceLevel);
    this.health = new HealthMonitor(this.kernel);

    // Wire up event listeners
    this.setupEventListeners();
  }

  /**
   * Initialize system with enterprise startup procedures
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('System already initialized');
    }

    // Log initialization
    this.compliance.logEvent('SYSTEM_BOOT', {
      timestamp: new Date().toISOString(),
      complianceLevel: this.config.complianceLevel,
      version: '1.0.0',
      config: {
        tickIntervalMs: this.config.tickIntervalMs,
        recoveryMode: this.config.recoveryMode,
        maxRetries: this.config.maxRetries,
      },
    });

    try {
      // Perform startup checks
      await this.performStartupChecks();

      // Boot kernel
      this.kernel.boot();

      // Start health monitoring
      this.health.start();

      this.isInitialized = true;

      this.compliance.logEvent('SYSTEM_INITIALIZED', {
        timestamp: new Date().toISOString(),
        complianceLevel: this.config.complianceLevel,
      });

      console.log('✓ System initialized at compliance level: ' + this.config.complianceLevel);
    } catch (error) {
      this.compliance.logEvent('INITIALIZATION_FAILED', {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Perform startup checks (hospital-grade validation)
   */
  private async performStartupChecks(): Promise<void> {
    const checks = [
      this.checkSystemResources(),
      this.checkPersistence(),
      this.checkComplianceState(),
    ];

    const results = await Promise.allSettled(checks);

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'rejected') {
        const checkNames = ['resources', 'persistence', 'compliance'];
        throw new Error(
          `Startup check failed (${checkNames[i]}): ${
            result.reason instanceof Error ? result.reason.message : String(result.reason)
          }`
        );
      }
    }

    this.compliance.logEvent('STARTUP_CHECKS_PASSED', {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Setup enterprise event listeners
   */
  private setupEventListeners(): void {
    // BOOT: System initializing
    this.kernel.on(KernelEvent.BOOT, ({ mode }) => {
      this.compliance.logEvent('KERNEL_BOOT', {
        mode,
        timestamp: new Date().toISOString(),
      });
    });

    // RUN: System operational
    this.kernel.on(KernelEvent.RUN, ({ tick }) => {
      // Health check on each cycle
      this.health.checkHealth();
    });

    // CYCLE: Each tick completed
    this.kernel.on(KernelEvent.CYCLE, ({ tick, duration }) => {
      // Record metrics
      this.health.recordCycleMetrics(tick, duration);

      // Log audit trail periodically
      if (tick % 10 === 0) {
        this.compliance.logEvent('CYCLE_CHECKPOINT', {
          tick,
          durationMs: duration,
          workloadCount: this.workload.size,
          systemMode: this.kernel.getState().mode,
        });
      }
    });

    // ERROR: System error detected
    this.kernel.on(KernelEvent.ERROR, ({ error, severity }) => {
      this.health.recordError(error);

      this.compliance.logEvent('ERROR_DETECTED', {
        error: error.message,
        severity,
        timestamp: new Date().toISOString(),
        stack: error.stack,
      });

      // Classify and respond
      try {
        const failureType = methods.recovery.classifyFailure(error);
        const strategy = methods.recovery.selectRecoveryStrategy(failureType);

        this.compliance.logEvent('RECOVERY_STRATEGY_SELECTED', {
          failureType,
          strategy,
          errorMessage: error.message,
        });
      } catch (err) {
        this.compliance.logEvent('RECOVERY_STRATEGY_FAILED', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });

    // SAFE: System in safe mode
    this.kernel.on(KernelEvent.SAFE, ({ reason }) => {
      this.compliance.logEvent('SAFE_MODE_ACTIVATED', {
        reason,
        timestamp: new Date().toISOString(),
      });

      // Alert operators
      this.health.alertOperators('⚠ SAFE MODE: ' + reason);
    });

    // SHUTDOWN: System shutting down
    this.kernel.on(KernelEvent.SHUTDOWN, ({ graceful }) => {
      this.compliance.logEvent('SYSTEM_SHUTDOWN', {
        graceful,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Enqueue work to run in kernel
   */
  enqueueWork(id: string, work: () => Promise<void>, options: WorkloadOptions = {}): void {
    if (!this.isInitialized) {
      throw new Error('System not initialized');
    }

    const {
      priority = 0,
      criticality = 'NORMAL',
      timeout = 30000,
      maxRetries = this.config.maxRetries,
    } = options;

    // Log workload
    this.compliance.logEvent('WORKLOAD_ENQUEUED', {
      id,
      priority,
      criticality,
      timeout,
      maxRetries,
      timestamp: new Date().toISOString(),
    });

    // Track workload
    this.workload.set(id, {
      id,
      priority,
      criticality,
      timeout,
      maxRetries,
      enqueuedAt: Date.now(),
    });

    // Enqueue in kernel
    this.kernel.enqueueTask(async () => {
      const startTime = Date.now();
      let attempt = 0;

      while (attempt < maxRetries) {
        try {
          // Execute work with timeout
          await Promise.race([
            work(),
            new Promise<void>((_, reject) =>
              setTimeout(() => reject(new Error('Workload timeout')), timeout)
            ),
          ]);

          const duration = Date.now() - startTime;

          // Log success
          this.compliance.logEvent('WORKLOAD_SUCCESS', {
            id,
            durationMs: duration,
            attempts: attempt + 1,
            criticality,
          });

          // Clean up
          this.workload.delete(id);
          return;
        } catch (error) {
          attempt++;

          const errorObj = error instanceof Error ? error : new Error(String(error));
          const shouldRetry = attempt < maxRetries;

          this.compliance.logEvent('WORKLOAD_ERROR', {
            id,
            attempt,
            maxRetries,
            shouldRetry,
            error: errorObj.message,
            criticality,
          });

          if (!shouldRetry) {
            this.workload.delete(id);
            throw errorObj;
          }

          // Exponential backoff
          const delayMs = methods.scheduling.calculateBackoff(attempt);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }

      this.workload.delete(id);
    }, priority);
  }

  /**
   * Get current kernel state
   */
  getState(): KernelStateSnapshot {
    return this.kernel.getState();
  }

  /**
   * Get health metrics
   */
  getHealthMetrics() {
    return this.health.getMetrics();
  }

  /**
   * Get audit trail
   */
  getAuditTrail(filter?: { startTime?: number; endTime?: number; eventType?: string }) {
    return this.compliance.getAuditTrail(filter);
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    this.compliance.logEvent('SHUTDOWN_INITIATED', {
      timestamp: new Date().toISOString(),
      pendingWorkloads: this.workload.size,
    });

    this.health.stop();
    await this.kernel.shutdown();

    this.compliance.logEvent('SYSTEM_SHUTDOWN_COMPLETE', {
      timestamp: new Date().toISOString(),
    });

    this.isInitialized = false;
  }

  /**
   * Get configuration
   */
  getConfiguration(): Readonly<Required<CoreKernelConfig>> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Get workload tracking
   */
  getWorkloadStatus() {
    return {
      totalEnqueued: this.workload.size,
      workloads: Array.from(this.workload.values()),
    };
  }

  // Private helper methods

  private async checkSystemResources(): Promise<void> {
    // Check memory availability
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memory = process.memoryUsage();
      const heapUsedPercent = (memory.heapUsed / memory.heapTotal) * 100;

      if (heapUsedPercent > 90) {
        throw new Error(
          `Insufficient memory: ${heapUsedPercent.toFixed(1)}% heap used`
        );
      }
    }
  }

  private async checkPersistence(): Promise<void> {
    // Check if compliance tracker can store events
    try {
      this.compliance.logEvent('PERSISTENCE_CHECK', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw new Error(
        `Persistence check failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async checkComplianceState(): Promise<void> {
    // Verify compliance level is valid
    const validLevels = ['HIPAA', 'FDA', 'SOC2', 'ISO27001'];
    if (!validLevels.includes(this.config.complianceLevel)) {
      throw new Error(`Invalid compliance level: ${this.config.complianceLevel}`);
    }
  }
}
