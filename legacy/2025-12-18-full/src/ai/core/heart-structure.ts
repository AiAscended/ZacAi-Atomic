import type { ComponentDependency, ComponentHealthStatus, SystemComponent } from "../types";
import { systemModel } from "../system-model";

export interface HeartOrganDescriptor {
  id: string;
  name: string;
  kind: SystemComponent["kind"];
  version: string;
  dependencies?: ComponentDependency[];
  capabilities: string[];
  entryPoint?: string;
  metadata?: Record<string, unknown>;
}

export const HEART_DOC_PATH = "docs/ZacAi-Core/ZacAi-Heart-Core";

export const HEART_ORGANS: HeartOrganDescriptor[] = [
  {
    id: "heart-core",
    name: "ZacAi Heart Core",
    kind: "core",
    version: "1.0.0",
    capabilities: ["self-reliance", "self-healing", "topology-awareness"],
    entryPoint: "src/ai/core",
    metadata: { docSection: "Core Principles" },
  },
  {
    id: "main-orchestrator",
    name: "Main Orchestrator",
    kind: "orchestrator",
    version: "1.0.0",
    dependencies: [{ id: "heart-core", contract: "core-services" }],
    capabilities: ["planning", "execution", "policy"],
    entryPoint: "src/ai/orchestration/main-orchestrator.ts",
    metadata: { docSection: "Entry Point Flow" },
  },
  {
    id: "orchestration-goal-interpreter",
    name: "Heart Goal Interpreter",
    kind: "pipeline",
    version: "1.0.0",
    dependencies: [
      { id: "main-orchestrator", contract: "orchestrator" },
      { id: "heart-core", contract: "core-services" },
    ],
    capabilities: ["goal-interpretation", "intent-analysis", "constraint-detection"],
    entryPoint: "src/ai/orchestration/promptHandler.ts",
    metadata: { docSection: "Goal Interpretation" },
  },
  {
    id: "orchestration-planner",
    name: "Heart Planner",
    kind: "pipeline",
    version: "1.0.0",
    dependencies: [{ id: "orchestration-goal-interpreter", contract: "goal" }],
    capabilities: ["plan-graph", "dependency-analysis", "routing"],
    entryPoint: "src/ai/orchestration/workflowEngine.ts",
    metadata: { docSection: "Planning and Decomposition" },
  },
  {
    id: "orchestration-executor",
    name: "Heart Executor",
    kind: "pipeline",
    version: "1.0.0",
    dependencies: [
      { id: "orchestration-planner", contract: "plan" },
      { id: "tools-registry", contract: "tools" },
      { id: "inference-engine", contract: "model-runner" },
    ],
    capabilities: ["task-execution", "fallbacks", "retries"],
    entryPoint: "src/ai/orchestration/workflowEngine.ts",
    metadata: { docSection: "Execution Management" },
  },
  {
    id: "orchestration-policy",
    name: "Heart Policy Engine",
    kind: "pipeline",
    version: "1.0.0",
    dependencies: [{ id: "heart-core", contract: "core-services" }],
    capabilities: ["safety-guardrails", "risk-assessment", "routing-rules"],
    entryPoint: "src/ai/orchestration/policyEngine.ts",
    metadata: { docSection: "Safety and Policy" },
  },
  {
    id: "response-synthesizer",
    name: "Heart Response Synthesizer",
    kind: "pipeline",
    version: "1.0.0",
    dependencies: [
      { id: "orchestration-executor", contract: "executor" },
      { id: "monitoring-center", contract: "telemetry" },
    ],
    capabilities: ["result-aggregation", "formatting", "explanation"],
    entryPoint: "src/ai/orchestration/responseFormatter.ts",
    metadata: { docSection: "Response Synthesis" },
  },
  {
    id: "offline-simulator",
    name: "Offline Fallback Simulator",
    kind: "tool",
    version: "1.0.0",
    dependencies: [{ id: "heart-core", contract: "core-services" }],
    capabilities: ["virtual-tools", "cli-guidance", "incident-playbooks"],
    entryPoint: "src/ai/tools/cli.ts",
    metadata: { docSection: "Offline Fallback" },
  },
  {
    id: "input-processing",
    name: "Input Processing",
    kind: "pipeline",
    version: "1.0.0",
    dependencies: [{ id: "heart-core", contract: "core-services" }],
    capabilities: ["normalization", "tokenization", "classification"],
    entryPoint: "src/ai/input_processing/promptProcessor.ts",
    metadata: { docSection: "Goal Interpretation" },
  },
  {
    id: "inference-engine",
    name: "Inference Engine",
    kind: "model",
    version: "1.0.0",
    dependencies: [{ id: "heart-core", contract: "core-services" }],
    capabilities: ["model-routing", "offline-runner", "llm-execution"],
    entryPoint: "src/ai/models/unified-transformer-llm",
    metadata: { docSection: "Execution Management" },
  },
  {
    id: "monitoring-center",
    name: "Monitoring Center",
    kind: "monitoring",
    version: "1.0.0",
    dependencies: [{ id: "heart-core", contract: "core-services" }],
    capabilities: ["telemetry-ingest", "anomaly-detection", "health-signals"],
    entryPoint: "src/ai/monitoring",
    metadata: { docSection: "System Monitoring" },
  },
  {
    id: "self-heal-engine",
    name: "Self-Heal Engine",
    kind: "core",
    version: "1.0.0",
    dependencies: [
      { id: "monitoring-center", contract: "telemetry" },
      { id: "tools-registry", contract: "tools" },
    ],
    capabilities: ["diagnostics", "remediation", "playbooks"],
    entryPoint: "src/ai/core/self-heal.ts",
    metadata: { docSection: "Self-Healing" },
  },
  {
    id: "state-manager",
    name: "State Manager",
    kind: "memory",
    version: "1.0.0",
    dependencies: [{ id: "heart-core", contract: "core-services" }],
    capabilities: ["context", "episodic-memory", "config-store"],
    entryPoint: "src/ai/orchestration/stateManager.ts",
    metadata: { docSection: "State Management" },
  },
  {
    id: "tools-registry",
    name: "Tool Registry",
    kind: "tool",
    version: "1.0.0",
    dependencies: [{ id: "heart-core", contract: "core-services" }],
    capabilities: ["tool-discovery", "virtual-tools", "routing"],
    entryPoint: "src/ai/tools",
    metadata: { docSection: "Tools" },
  },
];

function registerDescriptor(descriptor: HeartOrganDescriptor) {
  systemModel.registerComponent({
    id: descriptor.id,
    name: descriptor.name,
    kind: descriptor.kind,
    version: descriptor.version,
    dependencies: descriptor.dependencies,
    capabilities: descriptor.capabilities,
    entryPoint: descriptor.entryPoint,
    metadata: {
      doc: HEART_DOC_PATH,
      ...descriptor.metadata,
    },
  });
}

export function ensureHeartOrgansRegistered(): void {
  HEART_ORGANS.forEach(registerDescriptor);
}

export function markHeartOrganStatus(
  organId: string,
  status: ComponentHealthStatus,
  summary?: string,
  metadata?: Record<string, unknown>,
): void {
  const component = systemModel.markComponentStatus(organId, status, summary);
  if (!component) {
    return;
  }
  if (metadata) {
    component.metadata = {
      ...(component.metadata ?? {}),
      ...metadata,
    };
  }
}

export function getHeartOrganDescriptor(id: string): HeartOrganDescriptor | undefined {
  return HEART_ORGANS.find(descriptor => descriptor.id === id);
}
