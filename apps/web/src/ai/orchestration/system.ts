/**
 * Fallback system watcher and registry for degraded mode.
 */

const watcherStatus = {
  status: "degraded",
  running: false,
  lastEvent: null as null | { type: string; at: number },
};

export async function ensureSystemWatcher() {
  watcherStatus.running = true;
  return watcherStatus;
}

export function getSystemWatcher() {
  return {
    getStatus() {
      return watcherStatus;
    },
  };
}

export async function getSystemRegistry() {
  return {
    generatedAt: Date.now(),
    stats: {
      totalFiles: 0,
      totalModules: 0,
    },
  };
}

export async function getRecentActivity(limit = 10) {
  return {
    limit,
    items: [],
    generatedAt: Date.now(),
  };
}
