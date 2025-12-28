/**
 * ZacAi Application
 * Main entry point for hospital-grade hybrid AI system
 */

import { CoreKernel, type CoreKernelConfig } from './index';

export interface ZacAiApplicationConfig extends CoreKernelConfig {
  /** Enable verbose logging */
  verbose?: boolean;
  /** Application name */
  appName?: string;
  /** Application version */
  version?: string;
}

/**
 * Main application class
 */
export class ZacAiApplication {
  private coreKernel: CoreKernel;
  private config: Required<ZacAiApplicationConfig>;
  private isRunning = false;

  constructor(config: ZacAiApplicationConfig = {}) {
    // Set defaults with hospital-grade settings
    this.config = {
      appName: config.appName ?? 'ZacAi',
      version: config.version ?? '1.0.0',
      verbose: config.verbose ?? false,
      complianceLevel: config.complianceLevel ?? 'HIPAA',
      tickIntervalMs: config.tickIntervalMs ?? 1000,
      enableLogging: config.enableLogging ?? true,
      recoveryMode: config.recoveryMode ?? 'CONSERVATIVE',
      healthCheckIntervalMs: config.healthCheckIntervalMs ?? 5000,
      metricsCollectionMs: config.metricsCollectionMs ?? 10000,
      auditTrailEnabled: config.auditTrailEnabled ?? true,
      maxRetries: config.maxRetries ?? 3,
    };

    // Initialize kernel
    this.coreKernel = new CoreKernel({
      complianceLevel: this.config.complianceLevel,
      tickIntervalMs: this.config.tickIntervalMs,
      enableLogging: this.config.enableLogging,
      recoveryMode: this.config.recoveryMode,
      healthCheckIntervalMs: this.config.healthCheckIntervalMs,
      metricsCollectionMs: this.config.metricsCollectionMs,
      auditTrailEnabled: this.config.auditTrailEnabled,
      maxRetries: this.config.maxRetries,
    });

    if (this.config.verbose) {
      console.log(`[${this.config.appName}] Initialized`);
      console.log(`  Version: ${this.config.version}`);
      console.log(`  Compliance: ${this.config.complianceLevel}`);
      console.log(`  Recovery Mode: ${this.config.recoveryMode}`);
    }
  }

  /**
   * Start the application
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Application already running');
    }

    console.log(`🚀 Starting ${this.config.appName} v${this.config.version}`);

    try {
      await this.coreKernel.initialize();
      this.isRunning = true;
      console.log(
        `✓ ${this.config.appName} ready (compliance: ${this.config.complianceLevel})`
      );
    } catch (error) {
      console.error(
        `✗ Failed to start ${this.config.appName}:`,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  /**
   * Process work through the kernel
   */
  async process(
    work: () => Promise<void>,
    priority: number = 0,
    id?: string
  ): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Application not running');
    }

    const workId = id ?? `work-${Date.now()}`;

    return new Promise((resolve, reject) => {
      try {
        this.coreKernel.enqueueWork(workId, work, {
          priority,
          criticality: priority > 50 ? 'HIGH' : 'NORMAL',
          timeout: 30000,
        });

        // Simplified: wait a bit for execution
        // In production, you'd implement proper completion tracking
        setTimeout(() => resolve(), 100);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      appName: this.config.appName,
      version: this.config.version,
      isRunning: this.isRunning,
      complianceLevel: this.config.complianceLevel,
      kernel: {
        state: this.coreKernel.getState(),
        health: this.coreKernel.getHealthMetrics(),
        workload: this.coreKernel.getWorkloadStatus(),
      },
      compliance: {
        auditTrailEntries: this.coreKernel.getAuditTrail().length,
      },
    };
  }

  /**
   * Get detailed health report
   */
  getHealthReport() {
    const health = this.coreKernel.getHealthMetrics();
    const state = this.coreKernel.getState();

    return {
      summary: {
        uptime: `${(health.uptime / 1000 / 60).toFixed(2)} minutes`,
        cycles: health.cycleCount,
        mode: state.mode,
        successRate: `${(health.successRate * 100).toFixed(2)}%`,
        errors: health.errorCount,
      },
      performance: {
        avgCycleDuration: `${health.averageCycleDuration.toFixed(2)}ms`,
        minCycleDuration: `${health.minCycleDuration.toFixed(2)}ms`,
        maxCycleDuration: `${health.maxCycleDuration.toFixed(2)}ms`,
      },
      compliance: this.coreKernel.getAuditTrail().length,
    };
  }

  /**
   * Get audit trail for compliance reporting
   */
  getComplianceReport(filter?: { eventType?: string; startTime?: number; endTime?: number }) {
    const trail = this.coreKernel.getAuditTrail(filter);

    return {
      count: trail.length,
      events: trail.slice(-100), // Last 100 events
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log(`Shutting down ${this.config.appName}...`);

    try {
      await this.coreKernel.shutdown();
      this.isRunning = false;
      console.log('✓ Shutdown complete');
    } catch (error) {
      console.error(
        'Error during shutdown:',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  /**
   * Check if application is running
   */
  isApplicationRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get configuration
   */
  getConfiguration(): Readonly<Required<ZacAiApplicationConfig>> {
    return Object.freeze({ ...this.config });
  }
}

/**
 * Quick start factory
 */
export async function createApplication(
  config?: ZacAiApplicationConfig
): Promise<ZacAiApplication> {
  const app = new ZacAiApplication(config);
  await app.start();
  return app;
}

// Quick start example
if (require.main === module) {
  const app = new ZacAiApplication({
    complianceLevel: 'HIPAA',
    verbose: true,
  });

  app
    .start()
    .then(async () => {
      console.log('\nSystem Status:');
      console.log(JSON.stringify(app.getStatus(), null, 2));

      // Simulate some work
      await app.process(async () => {
        console.log('Processing...');
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      console.log('\nHealth Report:');
      console.log(JSON.stringify(app.getHealthReport(), null, 2));

      await app.shutdown();
    })
    .catch(error => {
      console.error('Application error:', error);
      process.exit(1);
    });
}
