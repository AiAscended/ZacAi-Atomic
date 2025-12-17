/**
 * File: src/ai/monitoring/metricsCollector.ts
 * Purpose: Collects and tracks performance metrics for AI system
 * Depends on: src/ai/monitoring/logger.ts
 * Depended on by: src/ai/orchestration/aiOrchestrator.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { logger } from "../orchestration/logger"

export interface Metric {
  name: string
  value: number
  timestamp: Date
  tags?: Record<string, string>
}

export interface PerformanceMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageLatency: number
  minLatency: number
  maxLatency: number
  p95Latency: number
  p99Latency: number
}

/**
 * Collects and analyzes system metrics
 */
class MetricsCollector {
  private metrics: Metric[] = []
  private latencies: number[] = []
  private maxMetrics = 10000

  /**
   * Record a metric
   */
  record(name: string, value: number, tags?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      timestamp: new Date(),
      tags,
    }

    this.metrics.push(metric)

    // Track latencies separately for performance analysis
    if (name === "request_latency") {
      this.latencies.push(value)
      if (this.latencies.length > this.maxMetrics) {
        this.latencies.shift()
      }
    }

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    logger.debug("MetricsCollector recorded metric", { name, value, tags })
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const totalRequests = this.metrics.filter((m) => m.name === "request_total").length
    const successfulRequests = this.metrics.filter((m) => m.name === "request_success").length
    const failedRequests = this.metrics.filter((m) => m.name === "request_failure").length

    const sortedLatencies = [...this.latencies].sort((a, b) => a - b)
    const averageLatency =
      sortedLatencies.length > 0 ? sortedLatencies.reduce((sum, val) => sum + val, 0) / sortedLatencies.length : 0

    const p95Index = Math.floor(sortedLatencies.length * 0.95)
    const p99Index = Math.floor(sortedLatencies.length * 0.99)

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageLatency,
      minLatency: sortedLatencies[0] || 0,
      maxLatency: sortedLatencies[sortedLatencies.length - 1] || 0,
      p95Latency: sortedLatencies[p95Index] || 0,
      p99Latency: sortedLatencies[p99Index] || 0,
    }
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): Metric[] {
    return this.metrics.filter((m) => m.name === name)
  }

  /**
   * Get metrics by tag
   */
  getMetricsByTag(tagKey: string, tagValue: string): Metric[] {
    return this.metrics.filter((m) => m.tags && m.tags[tagKey] === tagValue)
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(count: number): Metric[] {
    return this.metrics.slice(-count)
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = []
    this.latencies = []
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const perfMetrics = this.getPerformanceMetrics()
    const uniqueMetricNames = new Set(this.metrics.map((m) => m.name))

    return {
      totalMetrics: this.metrics.length,
      uniqueMetricTypes: uniqueMetricNames.size,
      performance: perfMetrics,
      oldestMetric: this.metrics[0]?.timestamp,
      newestMetric: this.metrics[this.metrics.length - 1]?.timestamp,
    }
  }
}

// Singleton instance
export const metricsCollector = new MetricsCollector()
