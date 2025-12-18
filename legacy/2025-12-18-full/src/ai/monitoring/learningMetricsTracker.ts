/**
 * Learning Metrics Tracker
 * Tracks inference metrics for continuous learning
 * Stores prompt, response, user feedback, and quality metrics
 */

import { promises as fs } from "fs";
import * as path from "path";

export interface InferenceMetrics {
  // Input
  prompt: string;
  preprocessedPrompt?: string;

  // Output
  response: string;
  confidence: number;
  domains: string[];
  modelsUsed: string[];

  // Performance metrics
  processingTime: number; // milliseconds
  tokensGenerated: number;

  // Quality metrics (to be filled by user feedback or automated scoring)
  userFeedback?: {
    rating?: number; // 1-5 stars
    helpful?: boolean;
    correct?: boolean;
    comment?: string;
  };

  // Automated quality scores
  qualityScores?: {
    coherence?: number; // 0-1
    relevance?: number; // 0-1
    completeness?: number; // 0-1
    accuracy?: number; // 0-1
  };

  // Metadata
  sessionId: string;
  timestamp: string;
  learnedFrom?: boolean; // Has this been used for training?
}

export interface LearningData {
  metrics: InferenceMetrics[];
  statistics: {
    totalInferences: number;
    avgConfidence: number;
    avgProcessingTime: number;
    domainUsage: Record<string, number>;
    lastUpdated: string;
  };
}

export class LearningMetricsTracker {
  private dataDir: string;
  private metricsFile: string;
  private cache: InferenceMetrics[] = [];
  private maxCacheSize: number = 1000;

  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.join(__dirname, "../../../data/learning");
    this.metricsFile = path.join(this.dataDir, "learnt.json");
  }

  /**
   * Record a new inference for learning
   */
  async recordInference(metrics: InferenceMetrics): Promise<void> {
    try {
      // Add to cache
      this.cache.push(metrics);

      // If cache is full, flush to disk
      if (this.cache.length >= this.maxCacheSize) {
        await this.flushToDisk();
      }
    } catch (error) {
      console.error(
        "[LearningMetricsTracker] Failed to record inference:",
        error,
      );
    }
  }

  /**
   * Flush cached metrics to disk
   */
  async flushToDisk(): Promise<void> {
    if (this.cache.length === 0) return;

    try {
      // Ensure directory exists
      await fs.mkdir(this.dataDir, { recursive: true });

      // Load existing data
      const existingData = await this.loadLearningData();

      // Append new metrics
      existingData.metrics.push(...this.cache);

      // Update statistics
      existingData.statistics = this.calculateStatistics(existingData.metrics);

      // Save to disk
      await fs.writeFile(
        this.metricsFile,
        JSON.stringify(existingData, null, 2),
        "utf-8",
      );

      console.log(`✅ Flushed ${this.cache.length} metrics to disk`);

      // Clear cache
      this.cache = [];
    } catch (error) {
      console.error("[LearningMetricsTracker] Failed to flush to disk:", error);
    }
  }

  /**
   * Load all learning data from disk
   */
  async loadLearningData(): Promise<LearningData> {
    try {
      const data = await fs.readFile(this.metricsFile, "utf-8");
      return JSON.parse(data) as LearningData;
    } catch {
      // File doesn't exist or is invalid, return empty data
      return {
        metrics: [],
        statistics: {
          totalInferences: 0,
          avgConfidence: 0,
          avgProcessingTime: 0,
          domainUsage: {},
          lastUpdated: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Get unlearned metrics (not yet used for training)
   */
  async getUnlearnedMetrics(): Promise<InferenceMetrics[]> {
    const data = await this.loadLearningData();
    return data.metrics.filter((m) => !m.learnedFrom);
  }

  /**
   * Mark metrics as learned
   */
  async markAsLearned(timestamps: string[]): Promise<void> {
    try {
      const data = await this.loadLearningData();

      // Mark matching metrics as learned
      for (const metric of data.metrics) {
        if (timestamps.includes(metric.timestamp)) {
          metric.learnedFrom = true;
        }
      }

      // Save updated data
      await fs.writeFile(
        this.metricsFile,
        JSON.stringify(data, null, 2),
        "utf-8",
      );

      console.log(`✅ Marked ${timestamps.length} metrics as learned`);
    } catch (error) {
      console.error(
        "[LearningMetricsTracker] Failed to mark as learned:",
        error,
      );
    }
  }

  /**
   * Calculate statistics from metrics
   */
  private calculateStatistics(metrics: InferenceMetrics[]) {
    if (metrics.length === 0) {
      return {
        totalInferences: 0,
        avgConfidence: 0,
        avgProcessingTime: 0,
        domainUsage: {},
        lastUpdated: new Date().toISOString(),
      };
    }

    const totalConfidence = metrics.reduce((sum, m) => sum + m.confidence, 0);
    const totalTime = metrics.reduce((sum, m) => sum + m.processingTime, 0);

    const domainUsage: Record<string, number> = {};
    for (const metric of metrics) {
      for (const domain of metric.domains) {
        domainUsage[domain] = (domainUsage[domain] || 0) + 1;
      }
    }

    return {
      totalInferences: metrics.length,
      avgConfidence: totalConfidence / metrics.length,
      avgProcessingTime: totalTime / metrics.length,
      domainUsage,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get learning statistics
   */
  async getStatistics() {
    const data = await this.loadLearningData();
    return data.statistics;
  }

  /**
   * Export metrics for training
   */
  async exportForTraining(
    minConfidence: number = 0.7,
    maxSamples: number = 1000,
  ): Promise<InferenceMetrics[]> {
    const data = await this.loadLearningData();

    // Filter high-quality metrics
    const highQuality = data.metrics.filter((m) => {
      // Must not be already learned
      if (m.learnedFrom) return false;

      // Must meet confidence threshold
      if (m.confidence < minConfidence) return false;

      // If user feedback exists, use it
      if (m.userFeedback) {
        if (m.userFeedback.rating && m.userFeedback.rating < 4) return false;
        if (m.userFeedback.helpful === false) return false;
        if (m.userFeedback.correct === false) return false;
      }

      return true;
    });

    // Sort by confidence and take top N
    return highQuality
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxSamples);
  }

  /**
   * Clean old metrics (keep only recent N days)
   */
  async cleanOldMetrics(daysToKeep: number = 30): Promise<void> {
    try {
      const data = await this.loadLearningData();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const filteredMetrics = data.metrics.filter((m) => {
        const metricDate = new Date(m.timestamp);
        return metricDate >= cutoffDate;
      });

      const removed = data.metrics.length - filteredMetrics.length;

      if (removed > 0) {
        data.metrics = filteredMetrics;
        data.statistics = this.calculateStatistics(filteredMetrics);

        await fs.writeFile(
          this.metricsFile,
          JSON.stringify(data, null, 2),
          "utf-8",
        );

        console.log(
          `✅ Cleaned ${removed} old metrics (kept last ${daysToKeep} days)`,
        );
      }
    } catch (error) {
      console.error(
        "[LearningMetricsTracker] Failed to clean old metrics:",
        error,
      );
    }
  }
}

export default LearningMetricsTracker;
