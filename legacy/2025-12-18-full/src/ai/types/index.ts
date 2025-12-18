export type GoalType =
  | "stability"
  | "maintenance"
  | "diagnostic"
  | "upgrade"
  | "user-request"
  | "system-task";

export type GoalPriority = 1 | 2 | 3 | 4 | 5; // 1 = highest urgency

export interface GoalConstraint {
  id: string;
  description: string;
  type: "time" | "resource" | "compliance" | "safety";
  value: string;
}

export interface SuccessCriterion {
  id: string;
  description: string;
  metric?: string;
  threshold?: number;
}

export interface SystemGoal {
  id: string;
  type: GoalType;
  objective: string;
  constraints: GoalConstraint[];
  success: SuccessCriterion[];
  priority: GoalPriority;
  createdBy: string;
  createdAt: string;
  context?: Record<string, unknown>;
}

export type PlanStepStatus = "pending" | "ready" | "running" | "blocked" | "completed" | "failed" | "skipped";

export interface PlanStep {
  id: string;
  goalId: string;
  label: string;
  description: string;
  status: PlanStepStatus;
  dependencies: string[];
  executor:
    | "internal"
    | "tool"
    | "domain"
    | "model"
    | "cli"
    | "human-review";
  targetComponent?: string;
  parameters?: Record<string, unknown>;
  checksum?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanEdge {
  from: string;
  to: string;
  type: "sequential" | "parallel" | "fallback" | "monitor";
}

export interface PlanGraph {
  goalId: string;
  steps: Record<string, PlanStep>;
  edges: PlanEdge[];
  version: string;
  createdAt: string;
}

export type HeartPlanStepId =
  | "input-processing"
  | "domain-routing"
  | "domain-inference"
  | "llm-inference"
  | "response-synthesis";

export type ExecutionStatus = "pending" | "running" | "succeeded" | "failed" | "degraded";

export interface ExecutionContext {
  maintenanceMode: boolean;
  offlineMode: boolean;
  availableTools: string[];
  availableDomains: string[];
  environment: "development" | "staging" | "production" | "maintenance";
  metadata?: Record<string, unknown>;
}

export interface ExecutionResult {
  stepId: string;
  status: ExecutionStatus;
  output?: string;
  artifacts?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    category?: string;
  };
  startedAt: string;
  completedAt: string;
}

export type ComponentKind =
  | "core"
  | "orchestrator"
  | "domain"
  | "model"
  | "tool"
  | "pipeline"
  | "agent"
  | "cli"
  | "memory"
  | "monitoring";

export type ComponentHealthStatus = "healthy" | "degraded" | "failed" | "unknown";

export interface ComponentDependency {
  id: string;
  contract: string;
  optional?: boolean;
}

export interface ComponentHealth {
  status: ComponentHealthStatus;
  metrics: Record<string, number>;
  summary: string;
  lastChecked: string;
  detail?: Record<string, unknown>;
}

export interface SystemComponent {
  id: string;
  name: string;
  kind: ComponentKind;
  version?: string;
  status: ComponentHealthStatus;
  health: ComponentHealth;
  dependencies: ComponentDependency[];
  capabilities: string[];
  entryPoint?: string;
  metadata: Record<string, unknown>;
  lastUpdated: string;
}

export interface SystemSnapshot {
  generatedAt: string;
  components: SystemComponent[];
  goals: SystemGoal[];
  activePlans: PlanGraph[];
  context: ExecutionContext;
}

export interface HealthSignal {
  componentId: string;
  status: ComponentHealthStatus;
  message: string;
  metrics?: Record<string, number>;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface RemediationContext {
  signal: HealthSignal;
  component: SystemComponent | null;
  snapshot: SystemSnapshot;
}

export type RemediationImpact = "low" | "medium" | "high";

export interface RemediationOutcome {
  success: boolean;
  message: string;
  followUpGoal?: SystemGoal;
}

export type RemediationExecutor = (context: RemediationContext) => Promise<RemediationOutcome>;

export interface RemediationAction {
  id: string;
  label: string;
  description: string;
  impact: RemediationImpact;
  executor: RemediationExecutor;
}

export interface SelfHealPlaybook {
  id: string;
  label: string;
  description: string;
  conditions: (signal: HealthSignal) => boolean;
  actions: RemediationAction[];
}

export interface BootCheck {
  id: string;
  description: string;
  critical: boolean;
  run: () => Promise<boolean>;
  metadata?: Record<string, unknown>;
}

export interface BootPhase {
  id: string;
  label: string;
  description: string;
  checks: BootCheck[];
}

export interface BootReport {
  startedAt: string;
  completedAt: string;
  phases: Array<{
    id: string;
    status: "pending" | "running" | "passed" | "failed";
    issues: string[];
  }>;
  blocked: boolean;
}

export interface BootOptions {
  additionalPhases?: BootPhase[];
}

export interface DiagnosticReport {
  generatedAt: string;
  signals: HealthSignal[];
  plan?: PlanGraph;
  recommendedActions: RemediationAction[];
}
