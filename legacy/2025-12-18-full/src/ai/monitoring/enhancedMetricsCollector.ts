/**
 * Enhanced System Metrics Collector with AI Self-Awareness
 *
 * This module extends metricsCollector to provide:
 * 1. Real-time system performance monitoring
 * 2. AI self-awareness metrics for the system domain
 * 3. Resource usage tracking (memory, CPU, latency)
 * 4. Model performance analytics
 * 5. Domain-specific inference metrics
 *
 * Used by:
 * - System knowledge domain for self-awareness
 * - Admin dashboard for monitoring
 * - MainOrchestrator for performance tracking
 * - Training pipeline for quality assessment
 */

import { metricsCollector } from "./metricsCollector";
import os from "os";

export interface SystemMetrics {
  timestamp: string;
  system: {
    platform: string;
    arch: string;
    cpuUsage: number;
    memoryUsage: {
      total: number;
      used: number;
      free: number;
      percentage: number;
    };
    uptime: number;
  };
  ai: {
    totalInferences: number;
    successfulInferences: number;
    failedInferences: number;
    averageConfidence: number;
    averageLatency: number;
    domainsActive: number;
    modelsActive: number;
    vocabularySize: number;
  };
  performance: {
    requestsPerMinute: number;
    errorRate: number;
    p95Latency: number;
    p99Latency: number;
  };
}

export interface DomainMetrics {
  domain: string;
  inferenceCount: number;
  averageConfidence: number;
  averageLatency: number;
  successRate: number;
  lastUsed: string;
}

export interface ModelMetrics {
  model: string;
  inferenceCount: number;
  averageLatency: number;
  tokensGenerated: number;
  successRate: number;
}

class EnhancedMetricsCollector {
  private inferences: Array<{
    timestamp: Date;
    confidence: number;
    latency: number;
    success: boolean;
    domain?: string;
    model?: string;
  }> = [];

  private domainStats = new Map<
    string,
    {
      count: number;
      totalConfidence: number;
      totalLatency: number;
      successes: number;
      lastUsed: Date;
    }
  >();

  private modelStats = new Map<
    string,
    {
      count: number;
      totalLatency: number;
      tokensGenerated: number;
      successes: number;
    }
  >();

  /**
   * Record an AI inference operation
   */
  recordInference(data: {
    confidence: number;
    latency: number;
    success: boolean;
    domain?: string;
    model?: string;
    tokensGenerated?: number;
  }): void {
    // Record in local array
    this.inferences.push({
      timestamp: new Date(),
      ...data,
    });

    // Keep only last 10,000 inferences
    if (this.inferences.length > 10000) {
      this.inferences.shift();
    }

    // Update domain stats
    if (data.domain) {
      const domainStat = this.domainStats.get(data.domain) || {
        count: 0,
        totalConfidence: 0,
        totalLatency: 0,
        successes: 0,
        lastUsed: new Date(),
      };

      domainStat.count++;
      domainStat.totalConfidence += data.confidence;
      domainStat.totalLatency += data.latency;
      if (data.success) domainStat.successes++;
      domainStat.lastUsed = new Date();

      this.domainStats.set(data.domain, domainStat);
    }

    // Update model stats
    if (data.model) {
      const modelStat = this.modelStats.get(data.model) || {
        count: 0,
        totalLatency: 0,
        tokensGenerated: 0,
        successes: 0,
      };

      modelStat.count++;
      modelStat.totalLatency += data.latency;
      modelStat.tokensGenerated += data.tokensGenerated || 0;
      if (data.success) modelStat.successes++;

      this.modelStats.set(data.model, modelStat);
    }

    // Record in base metrics collector
    metricsCollector.record("ai_inference", 1, {
      domain: data.domain || "unknown",
      model: data.model || "unknown",
      success: data.success.toString(),
    });
    metricsCollector.record("ai_confidence", data.confidence);
    metricsCollector.record("request_latency", data.latency);
  }

  /**
   * Get comprehensive system metrics
   * Used by system domain for self-awareness
   */
  getSystemMetrics(): SystemMetrics {
    const perfMetrics = metricsCollector.getPerformanceMetrics();
    const recentInferences = this.inferences.slice(-100);

    const totalInferences = this.inferences.length;
    const successfulInferences = this.inferences.filter(
      (i) => i.success,
    ).length;
    const averageConfidence =
      recentInferences.length > 0
        ? recentInferences.reduce((sum, i) => sum + i.confidence, 0) /
          recentInferences.length
        : 0;

    // Calculate requests per minute
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentRequests = this.inferences.filter(
      (i) => i.timestamp > oneMinuteAgo,
    ).length;

    return {
      timestamp: new Date().toISOString(),
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpuUsage: this.getCPUUsage(),
        memoryUsage: {
          total: os.totalmem(),
          used: os.totalmem() - os.freemem(),
          free: os.freemem(),
          percentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
        },
        uptime: os.uptime(),
      },
      ai: {
        totalInferences,
        successfulInferences,
        failedInferences: totalInferences - successfulInferences,
        averageConfidence,
        averageLatency: perfMetrics.averageLatency,
        domainsActive: this.domainStats.size,
        modelsActive: this.modelStats.size,
        vocabularySize: 436, // From vocabulary manager
      },
      performance: {
        requestsPerMinute: recentRequests,
        errorRate:
          totalInferences > 0
            ? ((totalInferences - successfulInferences) / totalInferences) * 100
            : 0,
        p95Latency: perfMetrics.p95Latency,
        p99Latency: perfMetrics.p99Latency,
      },
    };
  }

  /**
   * Get domain-specific metrics
   */
  getDomainMetrics(): DomainMetrics[] {
    const metrics: DomainMetrics[] = [];

    this.domainStats.forEach((stats, domain) => {
      metrics.push({
        domain,
        inferenceCount: stats.count,
        averageConfidence: stats.totalConfidence / stats.count,
        averageLatency: stats.totalLatency / stats.count,
        successRate: (stats.successes / stats.count) * 100,
        lastUsed: stats.lastUsed.toISOString(),
      });
    });

    return metrics.sort((a, b) => b.inferenceCount - a.inferenceCount);
  }

  /**
   * Get model-specific metrics
   */
  getModelMetrics(): ModelMetrics[] {
    const metrics: ModelMetrics[] = [];

    this.modelStats.forEach((stats, model) => {
      metrics.push({
        model,
        inferenceCount: stats.count,
        averageLatency: stats.totalLatency / stats.count,
        tokensGenerated: stats.tokensGenerated,
        successRate: (stats.successes / stats.count) * 100,
      });
    });

    return metrics.sort((a, b) => b.inferenceCount - a.inferenceCount);
  }

  /**
   * Get system health status
   */
  getHealthStatus(): {
    status: "healthy" | "degraded" | "critical";
    issues: string[];
    recommendations: string[];
  } {
    const metrics = this.getSystemMetrics();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check memory usage
    if (metrics.system.memoryUsage.percentage > 90) {
      issues.push("High memory usage (>90%)");
      recommendations.push(
        "Consider restarting the application or increasing memory allocation",
      );
    }

    // Check error rate
    if (metrics.performance.errorRate > 10) {
      issues.push(
        `High error rate (${metrics.performance.errorRate.toFixed(1)}%)`,
      );
      recommendations.push(
        "Review recent errors and check domain/model configurations",
      );
    }

    // Check latency
    if (metrics.performance.p95Latency > 5000) {
      issues.push("High latency detected (p95 > 5s)");
      recommendations.push(
        "Optimize inference engines or enable parallel processing",
      );
    }

    // Check AI confidence
    if (metrics.ai.averageConfidence < 0.5) {
      issues.push("Low average confidence (<0.5)");
      recommendations.push(
        "Train models with more data or adjust confidence thresholds",
      );
    }

    const status =
      issues.length === 0
        ? "healthy"
        : issues.length <= 2
          ? "degraded"
          : "critical";

    return { status, issues, recommendations };
  }

  /**
   * Get CPU usage (simplified)
   */
  private getCPUUsage(): number {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });

    return 100 - (100 * totalIdle) / totalTick;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.inferences = [];
    this.domainStats.clear();
    this.modelStats.clear();
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics() {
    return {
      systemMetrics: this.getSystemMetrics(),
      domainMetrics: this.getDomainMetrics(),
      modelMetrics: this.getModelMetrics(),
      healthStatus: this.getHealthStatus(),
      rawInferences: this.inferences.slice(-1000), // Last 1000 inferences
    };
  }
}

// Singleton instance
export const enhancedMetricsCollector = new EnhancedMetricsCollector();
