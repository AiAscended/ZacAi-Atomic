/**
 * Health Monitor
 * Tracks system health metrics, performance, and alerts
 * Provides observable metrics for hospital-grade systems
 */

import { SystemKernel, type KernelStateSnapshot } from '@zacai/system-kernel';
import * as methods from '@zacai/system-kernel-methods';

export interface HealthMetrics {
  /** System uptime in milliseconds */
  uptime: number;
  /** Total ticks/cycles executed */
  cycleCount: number;
  /** Average cycle duration in milliseconds */
  averageCycleDuration: number;
  /** Minimum cycle duration */
  minCycleDuration: number;
  /** Maximum cycle duration */
  maxCycleDuration: number;
  /** Total errors encountered */
  errorCount: number;
  /** Total successful operations */
  successCount: number;
  /** Success rate (0-1) */
  successRate: number;
  /** Last error message */
  lastError?: string;
  /** Current system mode */
  systemMode: string;
  /** ISO 8601 timestamp */
  timestamp: string;
}

export interface HealthAlert {
  level: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  timestamp: string;
  metric?: string;
  threshold?: number;
  actual?: number;
}

export type AlertLevel = 'INFO' | 'WARNING' | 'CRITICAL';

/**
 * Health Monitor - Track system health and performance
 */
export class HealthMonitor {
  private kernel: SystemKernel;
  private startTime = Date.now();
  private cycleMetrics: number[] = [];
  private errorCount = 0;
  private successCount = 0;
  private lastError?: string;
  private monitoringInterval?: NodeJS.Timeout;
  private alerts: HealthAlert[] = [];
  private readonly maxCycleHistory = 1000;
  private readonly maxAlertHistory = 100;

  // Thresholds
  private readonly successRateThreshold = 0.95; // Alert if < 95%
  private readonly cycleTimeThreshold = 10000; // Alert if > 10s
  private readonly memoryThreshold = 0.9; // Alert if > 90% heap

  constructor(kernel: SystemKernel) {
    this.kernel = kernel;
  }

  /**
   * Start health monitoring background task
   */
  start(): void {
    if (this.monitoringInterval) {
      return; // Already running
    }

    // Health checks every 5 seconds
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, 5000);

    this.addAlert('INFO', 'Health monitoring started');
  }

  /**
   * Stop health monitoring
   */
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    this.addAlert('INFO', 'Health monitoring stopped');
  }

  /**
   * Record cycle metrics
   */
  recordCycleMetrics(tick: number, duration: number): void {
    this.cycleMetrics.push(duration);
    this.successCount++;

    // Keep last N cycles
    if (this.cycleMetrics.length > this.maxCycleHistory) {
      this.cycleMetrics = this.cycleMetrics.slice(-this.maxCycleHistory);
    }

    // Check if tick interval is valid
    const isValid = methods.heartbeat.isTickIntervalValid(duration);
    if (!isValid) {
      this.addAlert('WARNING', `Abnormal cycle duration: ${duration}ms`);
    }
  }

  /**
   * Record error
   */
  recordError(error: Error): void {
    this.errorCount++;
    this.lastError = error.message;

    this.addAlert('WARNING', `Error recorded: ${error.message}`);
  }

  /**
   * Get current health metrics
   */
  getMetrics(): HealthMetrics {
    const uptime = Date.now() - this.startTime;
    const state = this.kernel.getState();

    const cycleDurations = this.cycleMetrics;
    const avgDuration =
      cycleDurations.length > 0
        ? cycleDurations.reduce((a, b) => a + b, 0) / cycleDurations.length
        : 0;

    const minDuration = cycleDurations.length > 0 ? Math.min(...cycleDurations) : 0;
    const maxDuration = cycleDurations.length > 0 ? Math.max(...cycleDurations) : 0;

    const total = this.successCount + this.errorCount;
    const successRate = total > 0 ? this.successCount / total : 0;

    return {
      uptime,
      cycleCount: state.tick,
      averageCycleDuration: avgDuration,
      minCycleDuration: minDuration,
      maxCycleDuration: maxDuration,
      errorCount: this.errorCount,
      successCount: this.successCount,
      successRate,
      lastError: this.lastError,
      systemMode: state.mode,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get health status summary
   */
  getHealthStatus(): {
    overall: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    metrics: HealthMetrics;
    alerts: HealthAlert[];
    isHealthy: boolean;
  } {
    const metrics = this.getMetrics();
    const isHealthy = this.checkHealth();

    // Determine overall status
    let overall: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = isHealthy ? 'HEALTHY' : 'DEGRADED';

    // Check for critical issues
    if (metrics.successRate < 0.8) {
      overall = 'CRITICAL';
    }

    // Get recent critical alerts
    const criticalAlerts = this.getAlerts('CRITICAL');
    if (criticalAlerts.length > 0) {
      overall = 'CRITICAL';
    }

    return {
      overall,
      metrics,
      alerts: this.getRecentAlerts(10),
      isHealthy,
    };
  }

  /**
   * Check system health against thresholds
   */
  checkHealth(): boolean {
    const metrics = this.getMetrics();

    // Check success rate
    if (metrics.successRate < this.successRateThreshold) {
      this.addAlert(
        'WARNING',
        `Success rate degraded: ${(metrics.successRate * 100).toFixed(2)}%`
      );
      return false;
    }

    // Check cycle time
    if (metrics.averageCycleDuration > this.cycleTimeThreshold) {
      this.addAlert(
        'WARNING',
        `Cycle time degraded: ${metrics.averageCycleDuration.toFixed(0)}ms`
      );
      return false;
    }

    // Check memory (if running in Node.js)
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memory = process.memoryUsage();
      const heapUsedPercent = memory.heapUsed / memory.heapTotal;

      if (heapUsedPercent > this.memoryThreshold) {
        this.addAlert(
          'WARNING',
          `Memory usage high: ${(heapUsedPercent * 100).toFixed(1)}%`
        );
        return false;
      }
    }

    // Check heartbeat validity
    if (this.cycleMetrics.length > 0) {
      const isHealthy = methods.heartbeat.isHeartbeatHealthy(
        this.cycleMetrics[this.cycleMetrics.length - 1]
      );
      if (!isHealthy) {
        this.addAlert('WARNING', 'Heartbeat unhealthy');
        return false;
      }
    }

    return true;
  }

  /**
   * Alert operators
   */
  alertOperators(message: string, level: AlertLevel = 'WARNING'): void {
    this.addAlert(level, message);

    // In production, send to monitoring/alerting system
    console.error(`[${level}]`, message);
  }

  /**
   * Get all alerts
   */
  getAlerts(level?: AlertLevel): HealthAlert[] {
    if (level) {
      return this.alerts.filter(a => a.level === level);
    }
    return [...this.alerts];
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(count: number = 20): HealthAlert[] {
    return this.alerts.slice(-count);
  }

  /**
   * Clear old alerts
   */
  private pruneAlerts(): void {
    if (this.alerts.length > this.maxAlertHistory) {
      this.alerts = this.alerts.slice(-this.maxAlertHistory);
    }
  }

  /**
   * Get detailed health report
   */
  getDetailedReport(): {
    summary: string;
    metrics: HealthMetrics;
    performance: {
      avgCycleDuration: number;
      minCycleDuration: number;
      maxCycleDuration: number;
      p95CycleDuration: number;
      p99CycleDuration: number;
    };
    reliability: {
      successRate: string;
      errorCount: number;
      uptime: string;
    };
    alerts: HealthAlert[];
  } {
    const metrics = this.getMetrics();

    // Calculate percentiles
    const sorted = [...this.cycleMetrics].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] ?? 0;

    // Format uptime
    const uptimeHours = Math.floor(metrics.uptime / 3600000);
    const uptimeMinutes = Math.floor((metrics.uptime % 3600000) / 60000);

    return {
      summary:
        metrics.successRate > 0.99
          ? '✓ System healthy'
          : metrics.successRate > 0.95
            ? '⚠ System degraded'
            : '✗ System critical',
      metrics,
      performance: {
        avgCycleDuration: metrics.averageCycleDuration,
        minCycleDuration: metrics.minCycleDuration,
        maxCycleDuration: metrics.maxCycleDuration,
        p95CycleDuration: p95,
        p99CycleDuration: p99,
      },
      reliability: {
        successRate: `${(metrics.successRate * 100).toFixed(2)}%`,
        errorCount: metrics.errorCount,
        uptime: `${uptimeHours}h ${uptimeMinutes}m`,
      },
      alerts: this.getRecentAlerts(10),
    };
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify(
      {
        metrics: this.getMetrics(),
        health: this.getHealthStatus(),
        report: this.getDetailedReport(),
      },
      null,
      2
    );
  }

  // Private helper methods

  private addAlert(level: AlertLevel, message: string, metric?: string): void {
    const alert: HealthAlert = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metric,
    };

    this.alerts.push(alert);
    this.pruneAlerts();
  }

  private performHealthCheck(): void {
    const status = this.getHealthStatus();

    if (status.overall !== 'HEALTHY') {
      console.log(
        `[HEALTH] System status: ${status.overall} (${(status.metrics.successRate * 100).toFixed(2)}% success rate)`
      );
    }
  }
}
