/**
 * Fallback metrics collector for degraded mode. Returns static metrics
 * so admin dashboards and APIs remain available even when real collectors
 * are offline.
 */

function now() {
  return new Date().toISOString();
}

const emptyMetrics = {
  cpu: { usage: 0 },
  memory: { usage: 0, total: 0 },
  uptime: 0,
  timestamp: now(),
};

const collector = {
  getSystemMetrics() {
    return { ...emptyMetrics };
  },
  getDomainMetrics() {
    return { domains: [], timestamp: now() };
  },
  getModelMetrics() {
    return { models: [], timestamp: now() };
  },
  getHealthStatus() {
    return { status: "degraded", checkedAt: now(), detail: "Fallback metrics" };
  },
  exportMetrics() {
    return {
      system: collector.getSystemMetrics(),
      domains: collector.getDomainMetrics(),
      models: collector.getModelMetrics(),
      health: collector.getHealthStatus(),
      exportedAt: now(),
    };
  },
  clear() {
    // no-op for fallback
  },
};

export const enhancedMetricsCollector = collector;
