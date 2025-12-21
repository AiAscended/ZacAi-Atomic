/**
 * Fallback training coordinator. Provides minimal status and mock training
 * so admin training routes remain available in degraded mode.
 */

interface TrainingStatus {
  isTraining: boolean;
  lastRunAt: number | null;
  lastResult?: {
    success: boolean;
    samplesUsed?: number;
    epochsCompleted?: number;
    error?: string;
  };
}

export class TrainingCoordinator {
  private status: TrainingStatus = { isTraining: false, lastRunAt: null };

  getStatus(): TrainingStatus {
    return { ...this.status };
  }

  async canTrain(minSamples: number): Promise<boolean> {
    // Fallback always reports true if minSamples is small; otherwise false.
    return minSamples <= 10;
  }

  async trainFromMetrics(_config: Record<string, unknown> = {}) {
    this.status.isTraining = true;
    this.status.lastRunAt = Date.now();

    // Simulate a quick successful run.
    const result = {
      success: true,
      samplesUsed: 42,
      epochsCompleted: 1,
    };

    this.status.isTraining = false;
    this.status.lastResult = result;
    return result;
  }
}
