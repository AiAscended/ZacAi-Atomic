/**
 * System Metrics Integration for AI Self-Awareness
 * Provides real-time system diagnostics and performance data to AI inference pipeline
 * Critical for hybrid AI models that need system-specific knowledge
 * 2025 AI Industry Standards Compliant
 */

import { metricsCollector } from './metricsCollector';

export interface SystemHealthMetrics {
  cpu: {
    usage: number;
    loadAverage: number[];
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    free: number;
    usagePercent: number;
  };
  process: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    pid: number;
  };
  performance: {
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    successRate: number;
  };
}

export interface AIInferenceMetrics {
  totalInferences: number;
  avgConfidence: number;
  avgProcessingTime: number;
  domainDistribution: Record<string, number>;
  modelStatus: {
    llm: string;
    transformer: string;
    domains: number;
  };
}

export interface DiagnosticInfo {
  timestamp: string;
  systemHealth: SystemHealthMetrics;
  aiPerformance: AIInferenceMetrics;
  alerts: Array<{
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    component: string;
  }>;
}

/**
 * System Metrics Integration for AI Models
 * Provides comprehensive system awareness for AI inference and diagnostics
 */
class SystemMetricsIntegration {
  private metricsCache: DiagnosticInfo | null = null;
  private cacheTimeout: number = 5000; // 5 seconds
  private lastCacheUpdate: number = 0;
  
  /**
   * Get comprehensive system diagnostics for AI inference
   * Used by AI models to understand system state and performance
   */
  async getSystemDiagnostics(): Promise<DiagnosticInfo> {
    // Return cached data if fresh
    const now = Date.now();
    if (this.metricsCache && (now - this.lastCacheUpdate) < this.cacheTimeout) {
      return this.metricsCache;
    }

    const diagnostics: DiagnosticInfo = {
      timestamp: new Date().toISOString(),
      systemHealth: await this.collectSystemHealth(),
      aiPerformance: await this.collectAIMetrics(),
      alerts: this.generateAlerts(),
    };

    this.metricsCache = diagnostics;
    this.lastCacheUpdate = now;

    return diagnostics;
  }

  /**
   * Collect system health metrics
   */
  private async collectSystemHealth(): Promise<SystemHealthMetrics> {
    const memoryUsage = process.memoryUsage();
    const loadAvg = typeof process.loadavg === 'function' ? process.loadavg() : [0, 0, 0];
    
    // Estimate CPU count
    const cpuCount = typeof process.env.UV_THREADPOOL_SIZE !== 'undefined' 
      ? parseInt(process.env.UV_THREADPOOL_SIZE) 
      : 4;

    const totalMemory = memoryUsage.heapTotal + memoryUsage.external;
    const usedMemory = memoryUsage.heapUsed;
    
    return {
      cpu: {
        usage: loadAvg[0] / cpuCount,
        loadAverage: loadAvg,
        cores: cpuCount,
      },
      memory: {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        free: Math.round((totalMemory - usedMemory) / 1024 / 1024), // MB
        usagePercent: Math.round((usedMemory / totalMemory) * 100),
      },
      process: {
        uptime: Math.floor(process.uptime()),
        memoryUsage,
        pid: process.pid,
      },
      performance: this.calculatePerformanceMetrics(),
    };
  }

  /**
   * Calculate performance metrics from collected data
   */
  private calculatePerformanceMetrics() {
    const perfMetrics = metricsCollector.getPerformanceMetrics();
    
    return {
      avgResponseTime: Math.round(perfMetrics.averageLatency),
      p95ResponseTime: Math.round(perfMetrics.p95Latency),
      p99ResponseTime: Math.round(perfMetrics.p99Latency),
      successRate: perfMetrics.totalRequests > 0
        ? Math.round((perfMetrics.successfulRequests / perfMetrics.totalRequests) * 100)
        : 100,
    };
  }

  /**
   * Collect AI inference metrics
   */
  private async collectAIMetrics(): Promise<AIInferenceMetrics> {
    // This would be populated by actual inference data
    // For now, provide structure for integration
    return {
      totalInferences: 0,
      avgConfidence: 0,
      avgProcessingTime: 0,
      domainDistribution: {},
      modelStatus: {
        llm: 'disabled',
        transformer: 'active',
        domains: 23,
      },
    };
  }

  /**
   * Generate system alerts based on metrics
   */
  private generateAlerts(): Array<{
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    component: string;
  }> {
    const alerts: Array<{
      severity: 'info' | 'warning' | 'error' | 'critical';
      message: string;
      component: string;
    }> = [];

    if (!this.metricsCache) return alerts;

    const { systemHealth } = this.metricsCache;

    // Memory alerts
    if (systemHealth.memory.usagePercent > 90) {
      alerts.push({
        severity: 'critical',
        message: `Memory usage critical: ${systemHealth.memory.usagePercent}%`,
        component: 'memory',
      });
    } else if (systemHealth.memory.usagePercent > 75) {
      alerts.push({
        severity: 'warning',
        message: `Memory usage high: ${systemHealth.memory.usagePercent}%`,
        component: 'memory',
      });
    }

    // CPU alerts
    if (systemHealth.cpu.usage > 0.9) {
      alerts.push({
        severity: 'warning',
        message: `CPU load high: ${Math.round(systemHealth.cpu.usage * 100)}%`,
        component: 'cpu',
      });
    }

    // Performance alerts
    if (systemHealth.performance.successRate < 95) {
      alerts.push({
        severity: 'error',
        message: `Success rate low: ${systemHealth.performance.successRate}%`,
        component: 'inference',
      });
    }

    if (systemHealth.performance.p95ResponseTime > 5000) {
      alerts.push({
        severity: 'warning',
        message: `Response time high: P95 ${systemHealth.performance.p95ResponseTime}ms`,
        component: 'performance',
      });
    }

    return alerts;
  }

  /**
   * Format diagnostics for AI consumption
   * Returns human-readable text that AI can understand and reason about
   */
  formatForAI(diagnostics: DiagnosticInfo): string {
    const { systemHealth, aiPerformance, alerts } = diagnostics;
    
    let report = '=== SYSTEM DIAGNOSTICS REPORT ===\n\n';
    
    // System Health
    report += '** System Health **\n';
    report += `Memory: ${systemHealth.memory.used}MB used of ${systemHealth.memory.total}MB (${systemHealth.memory.usagePercent}%)\n`;
    report += `CPU Load: ${Math.round(systemHealth.cpu.usage * 100)}% (${systemHealth.cpu.cores} cores)\n`;
    report += `Uptime: ${this.formatUptime(systemHealth.process.uptime)}\n\n`;
    
    // Performance
    report += '** Performance Metrics **\n';
    report += `Average Response Time: ${systemHealth.performance.avgResponseTime}ms\n`;
    report += `P95 Response Time: ${systemHealth.performance.p95ResponseTime}ms\n`;
    report += `Success Rate: ${systemHealth.performance.successRate}%\n\n`;
    
    // AI Performance
    report += '** AI Inference Status **\n';
    report += `Total Inferences: ${aiPerformance.totalInferences}\n`;
    report += `Average Confidence: ${(aiPerformance.avgConfidence * 100).toFixed(1)}%\n`;
    report += `LLM Status: ${aiPerformance.modelStatus.llm}\n`;
    report += `Active Domains: ${aiPerformance.modelStatus.domains}\n\n`;
    
    // Alerts
    if (alerts.length > 0) {
      report += '** Alerts **\n';
      for (const alert of alerts) {
        report += `[${alert.severity.toUpperCase()}] ${alert.component}: ${alert.message}\n`;
      }
    } else {
      report += '** Alerts **\nNo active alerts. System operating normally.\n';
    }
    
    return report;
  }

  /**
   * Format uptime into human-readable string
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    
    return parts.length > 0 ? parts.join(' ') : '< 1m';
  }

  /**
   * Get system status summary (quick check)
   */
  async getStatusSummary(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    message: string;
  }> {
    const diagnostics = await this.getSystemDiagnostics();
    const { systemHealth, alerts } = diagnostics;
    
    // Check for critical alerts
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      return {
        status: 'critical',
        message: `System critical: ${criticalAlerts.map(a => a.message).join(', ')}`,
      };
    }
    
    // Check for warnings
    const warningAlerts = alerts.filter(a => a.severity === 'warning' || a.severity === 'error');
    if (warningAlerts.length > 0) {
      return {
        status: 'degraded',
        message: `System degraded: ${warningAlerts.length} warning(s)`,
      };
    }
    
    // All good
    return {
      status: 'healthy',
      message: `System healthy. Memory: ${systemHealth.memory.usagePercent}%, CPU: ${Math.round(systemHealth.cpu.usage * 100)}%`,
    };
  }

  /**
   * Record a metric for tracking
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    metricsCollector.record(name, value, tags);
  }

  /**
   * Clear metrics cache (force refresh)
   */
  clearCache(): void {
    this.metricsCache = null;
    this.lastCacheUpdate = 0;
  }
}

// Singleton instance
export const systemMetricsIntegration = new SystemMetricsIntegration();
