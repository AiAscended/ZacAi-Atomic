/**
 * Fallback main orchestrator for learning metrics. Provides minimal
 * in-memory metrics so API routes stay online in degraded mode.
 */

interface LearningMetrics {
  timestamp: number;
  samples: number;
  confidence: number;
}

const metricsStore: LearningMetrics[] = [];

export const mainOrchestrator = {
  async getLearningStatistics() {
    const count = metricsStore.length;
    const avgConfidence = count
      ? metricsStore.reduce((sum, m) => sum + m.confidence, 0) / count
      : 0;
    return {
      totalSamples: count,
      averageConfidence: Number(avgConfidence.toFixed(3)),
      lastUpdated: metricsStore[count - 1]?.timestamp ?? null,
    };
  },

  async exportMetricsForTraining(minConfidence: number, maxSamples: number) {
    return metricsStore
      .filter((m) => m.confidence >= minConfidence)
      .slice(0, maxSamples);
  },

  async flushLearningMetrics() {
    // In fallback mode, nothing to flush; keep noop for compatibility.
    return { flushed: false, reason: "fallback-noop" };
  },
};
