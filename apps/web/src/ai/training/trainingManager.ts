/**
 * Fallback training manager. Keeps admin training routes responsive in
 * degraded mode while the real training pipeline is offline.
 */

const history: Array<{ id: string; mode: string; status: string; startedAt: number; finishedAt?: number }> = [];

let settings: Record<string, unknown> = { mode: "full", schedule: "manual" };
let currentStatus: Record<string, unknown> = { state: "idle", lastRun: null };

export const trainingScheduler = {
  async runTraining(mode: string) {
    const run = { id: `run-${Date.now()}`, mode, status: "completed", startedAt: Date.now(), finishedAt: Date.now() };
    history.push(run);
    currentStatus = { state: "completed", lastRun: run.startedAt, mode };
    return run;
  },

  async stopTraining() {
    currentStatus = { state: "stopped", lastRun: Date.now() };
  },

  async exportMetrics() {
    return { exportedAt: Date.now(), runs: history.slice(-5) };
  },

  getStatus() {
    return currentStatus;
  },

  getHistory() {
    return history.slice(-20);
  },

  getSettings() {
    return settings;
  },

  async updateSettings(next: Record<string, unknown>) {
    settings = { ...settings, ...next };
    return settings;
  },
};
