/**
 * File: src/ai/monitoring/metricsCollector.ts
 * Purpose: Collects and aggregates performance metrics for AI system monitoring
 * Depends on: None (atomic module)
 * Depended on by: src/ai/orchestration/aiOrchestrator.ts
 * Creator: Vercel v0 Coding Assistant
 */

interface Metric {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

class MetricsCollector {
  private metrics: Metric[] = []
  private aggregates: Map<string, { sum: number; count: number; min: number; max: number }> = new Map()

  /**
   * Record a metric value
   */
  public record(name: string, value: number, tags?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    }

    this.metrics.push(metric)

    // Update aggregates
    const key = this.getAggregateKey(name, tags)
    const existing = this.aggregates.get(key)

    if (existing) {
      existing.sum += value
      existing.count += 1
      existing.min = Math.min(existing.min, value)
      existing.max = Math.max(existing.max, value)
    } else {
      this.aggregates.set(key, {
        sum: value,
        count: 1,
        min: value,
        max: value,
      })
    }

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  /**
   * Get average value for a metric
   */
  public getAverage(name: string, tags?: Record<string, string>): number | null {
    const key = this.getAggregateKey(name, tags)
    const agg = this.aggregates.get(key)
    return agg ? agg.sum / agg.count : null
  }

  /**
   * Get all metrics for a name
   */
  public getMetrics(name: string): Metric[] {
    return this.metrics.filter((m) => m.name === name)
  }

  /**
   * Get summary statistics
   */
  public getSummary(
    name: string,
    tags?: Record<string, string>,
  ): {
    avg: number
    min: number
    max: number
    count: number
  } | null {
    const key = this.getAggregateKey(name, tags)
    const agg = this.aggregates.get(key)

    if (!agg) return null

    return {
      avg: agg.sum / agg.count,
      min: agg.min,
      max: agg.max,
      count: agg.count,
    }
  }

  /**
   * Clear all metrics
   */
  public clear(): void {
    this.metrics = []
    this.aggregates.clear()
  }

  private getAggregateKey(name: string, tags?: Record<string, string>): string {
    if (!tags) return name
    const tagStr = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(",")
    return `${name}|${tagStr}`
  }
}

// Singleton instance
const metricsCollector = new MetricsCollector()

export { metricsCollector, type Metric }
export const recordMetric = (name: string, value: number, tags?: Record<string, string>) =>
  metricsCollector.record(name, value, tags)
export const getMetricAverage = (name: string, tags?: Record<string, string>) => metricsCollector.getAverage(name, tags)
export const getMetricSummary = (name: string, tags?: Record<string, string>) => metricsCollector.getSummary(name, tags)
