/**
 * Fallback core exports for degraded mode. Provides minimal system model
 * snapshot and self-healing diagnostics to keep APIs responsive.
 */

import type { OrchestratorResponse } from "./orchestration/main-orchestrator";

interface PlanGraph {
  goalId: string;
  version: string;
  createdAt: number;
  steps: Record<string, { id: string; label: string; status: string; updatedAt: number; executor?: string; targetComponent?: string }>;
}

interface SystemComponent {
  id: string;
  name: string;
  kind: string;
  status: string;
  health: { summary: string };
  lastUpdated: number;
  dependencies: string[];
}

const snapshot = {
  generatedAt: Date.now(),
  context: { mode: "degraded", source: "fallback-core" },
  components: [
    {
      id: "heart-core",
      name: "Heart Core",
      kind: "kernel",
      status: "degraded",
      health: { summary: "Fallback core online" },
      lastUpdated: Date.now(),
      dependencies: [],
    },
  ] as SystemComponent[],
  goals: [],
};

const plans = new Map<string, PlanGraph>();

export const systemModel = {
  getSnapshot() {
    return { ...snapshot, generatedAt: Date.now() };
  },
  getPlan(goalId: string): PlanGraph | null {
    return plans.get(goalId) ?? null;
  },
};

export const selfHealingEngine = {
  async runDiagnostics(): Promise<{ status: string; detail: string; checks: string[] }> {
    return {
      status: "degraded",
      detail: "Fallback diagnostics only; full engine offline",
      checks: ["core-online", "registry-missing"],
    };
  },
};

export type { PlanGraph, SystemComponent, OrchestratorResponse };
