/**
 * Training Manager & Scheduler
 *
 * Manages automated training pipeline with:
 * - Manual training triggers
 * - Scheduled training execution
 * - Learning settings management
 * - Training history tracking
 * - Metrics-based training decisions
 *
 * Integrates with:
 * - enhancedMetricsCollector for performance monitoring
 * - autoTrainingScheduler for training operations
 * - Admin API for user control
 */

import { enhancedMetricsCollector } from "@/ai/monitoring/enhancedMetricsCollector";
import * as logger from "../orchestration/logger";
import cron from "node-cron";

export interface TrainingSettings {
  enabled: boolean;
  schedule: string; // Cron format
  confidenceThreshold: number;
  minSamplesForTraining: number;
  trainingFrequency: "hourly" | "daily" | "weekly" | "manual";
  autoUpdate: {
    vocabulary: boolean;
    seeds: boolean;
    weights: boolean;
  };
  performanceTriggers: {
    errorRateThreshold: number; // Train if error rate exceeds this
    confidenceThreshold: number; // Train if confidence falls below this
    latencyThreshold: number; // Train if latency exceeds this (ms)
  };
}

export interface TrainingHistory {
  id: string;
  timestamp: string;
  mode: "full" | "vocabulary" | "seeds" | "weights";
  status: "running" | "completed" | "failed";
  duration: number; // milliseconds
  results?: {
    vocabularyUpdated?: boolean;
    seedsRegenerated?: boolean;
    weightsUpdated?: boolean;
    domainsAffected?: string[];
    metricsImprovement?: {
      confidenceBefore: number;
      confidenceAfter: number;
      errorRateBefore: number;
      errorRateAfter: number;
    };
  };
  error?: string;
}

class TrainingScheduler {
  private settings: TrainingSettings = {
    enabled: true,
    schedule: "0 2 * * *", // Daily at 2 AM
    confidenceThreshold: 0.6,
    minSamplesForTraining: 100,
    trainingFrequency: "daily",
    autoUpdate: {
      vocabulary: true,
      seeds: true,
      weights: true,
    },
    performanceTriggers: {
      errorRateThreshold: 10, // 10% error rate
      confidenceThreshold: 0.5,
      latencyThreshold: 5000, // 5 seconds
    },
  };

  private history: TrainingHistory[] = [];
  private cronJob: { stop: () => void } | null = null; // cron.ScheduledTask
  private currentTraining: TrainingHistory | null = null;

  constructor() {
    this.loadSettings();
    this.setupScheduler();
  }

  /**
   * Load settings from storage (future: database)
   */
  private loadSettings(): void {
    // TODO: Load from database or config file
    logger.info("[TrainingScheduler] Settings loaded", {});
  }

  /**
   * Setup cron-based training scheduler
   */
  private setupScheduler(): void {
    if (this.settings.enabled && this.settings.schedule) {
      try {
        this.cronJob = cron.schedule(this.settings.schedule, async () => {
          logger.info("[TrainingScheduler] Scheduled training triggered", {});
          await this.runTraining("full");
        });
        logger.info(
          `[TrainingScheduler] Scheduler activated: ${this.settings.schedule}`,
          {},
        );
      } catch (error) {
        logger.info("[TrainingScheduler] Failed to setup scheduler", { error });
      }
    }
  }

  /**
   * Run training pipeline
   */
  async runTraining(
    mode: "full" | "vocabulary" | "seeds" | "weights" = "full",
  ): Promise<TrainingHistory> {
    const trainingId = `training_${Date.now()}`;
    const startTime = Date.now();

    const trainingRecord: TrainingHistory = {
      id: trainingId,
      timestamp: new Date().toISOString(),
      mode,
      status: "running",
      duration: 0,
    };

    this.currentTraining = trainingRecord;
    this.history.push(trainingRecord);

    logger.info(`[TrainingScheduler] Starting ${mode} training: ${trainingId}`);

    try {
      // Get metrics before training
      const metricsBefore = enhancedMetricsCollector.getSystemMetrics();

      // Execute training based on mode
      const results: TrainingHistory["results"] = {};

      if (mode === "full" || mode === "vocabulary") {
        results.vocabularyUpdated = await this.updateVocabulary();
      }

      if (mode === "full" || mode === "seeds") {
        results.seedsRegenerated = await this.regenerateSeeds();
      }

      if (mode === "full" || mode === "weights") {
        results.weightsUpdated = await this.updateWeights();
      }

      // Get metrics after training
      const metricsAfter = enhancedMetricsCollector.getSystemMetrics();

      results.metricsImprovement = {
        confidenceBefore: metricsBefore.ai.averageConfidence,
        confidenceAfter: metricsAfter.ai.averageConfidence,
        errorRateBefore: metricsBefore.performance.errorRate,
        errorRateAfter: metricsAfter.performance.errorRate,
      };

      // Update training record
      trainingRecord.status = "completed";
      trainingRecord.duration = Date.now() - startTime;
      trainingRecord.results = results;

      logger.info(
        `[TrainingScheduler] Training completed: ${trainingId} (${trainingRecord.duration}ms)`,
      );
    } catch (error) {
      trainingRecord.status = "failed";
      trainingRecord.duration = Date.now() - startTime;
      trainingRecord.error =
        error instanceof Error ? error.message : "Unknown error";
      logger.info(`[TrainingScheduler] Training failed: ${trainingId}`, {
        error: String(error),
      });
    } finally {
      this.currentTraining = null;
    }

    return trainingRecord;
  }

  /**
   * Update vocabulary from collected prompts
   */
  private async updateVocabulary(): Promise<boolean> {
    try {
      logger.info("[TrainingScheduler] Updating vocabulary...");
      // TODO: Implement vocabulary update logic
      // This would analyze recent prompts and add new tokens
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate work
      return true;
    } catch (error) {
      logger.info("[TrainingScheduler] Vocabulary update failed", {
        error: String(error),
      }); //, error);
      return false;
    }
  }

  /**
   * Regenerate seed data from collected samples
   */
  private async regenerateSeeds(): Promise<boolean> {
    try {
      logger.info("[TrainingScheduler] Regenerating seeds...");
      // TODO: Implement seed regeneration logic
      // This would create new training samples from collected data
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate work
      return true;
    } catch (error) {
      logger.info("[TrainingScheduler] Seed regeneration failed", {
        error: String(error),
      }); //, error);
      return false;
    }
  }

  /**
   * Update model weights based on collected metrics
   */
  private async updateWeights(): Promise<boolean> {
    try {
      logger.info("[TrainingScheduler] Updating weights...");
      // TODO: Implement weight update logic
      // This would fine-tune weights based on performance data
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate work
      return true;
    } catch (error) {
      logger.info("[TrainingScheduler] Weight update failed", {
        error: String(error),
      }); //, error);
      return false;
    }
  }

  /**
   * Stop ongoing training
   */
  async stopTraining(): Promise<void> {
    if (this.currentTraining) {
      this.currentTraining.status = "failed";
      this.currentTraining.error = "Stopped by user";
      this.currentTraining = null;
      logger.info("[TrainingScheduler] Training stopped by user");
    }
  }

  /**
   * Check if training should be triggered based on performance metrics
   */
  async checkPerformanceTriggers(): Promise<boolean> {
    const metrics = enhancedMetricsCollector.getSystemMetrics();
    const triggers = this.settings.performanceTriggers;

    const shouldTrain =
      metrics.performance.errorRate > triggers.errorRateThreshold ||
      metrics.ai.averageConfidence < triggers.confidenceThreshold ||
      metrics.performance.p95Latency > triggers.latencyThreshold;

    if (shouldTrain) {
      logger.info(
        "[TrainingScheduler] Performance triggers activated, starting training",
      );
      await this.runTraining("full");
    }

    return shouldTrain;
  }

  /**
   * Update training settings
   */
  async updateSettings(newSettings: Partial<TrainingSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };

    // Restart scheduler if schedule changed
    if (newSettings.schedule && this.cronJob) {
      this.cronJob.stop();
      this.setupScheduler();
    }

    logger.info("[TrainingScheduler] Settings updated", newSettings);
  }

  /**
   * Get current training settings
   */
  getSettings(): TrainingSettings {
    return { ...this.settings };
  }

  /**
   * Get training status
   */
  getStatus(): {
    isTraining: boolean;
    currentTraining: TrainingHistory | null;
  } {
    return {
      isTraining: this.currentTraining !== null,
      currentTraining: this.currentTraining,
    };
  }

  /**
   * Get training history
   */
  getHistory(limit: number = 50): TrainingHistory[] {
    return this.history.slice(-limit);
  }

  /**
   * Export metrics for analysis
   */
  async exportMetrics() {
    return {
      settings: this.settings,
      history: this.history,
      currentStatus: this.getStatus(),
      systemMetrics: enhancedMetricsCollector.exportMetrics(),
    };
  }
}

// Singleton instance
export const trainingScheduler = new TrainingScheduler();
