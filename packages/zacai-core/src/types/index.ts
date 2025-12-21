export type HealthStatus = "healthy" | "degraded" | "failed";

export interface HealthCheck {
  id: string;
  name: string;
  status: HealthStatus;
  detail?: string;
  remediation?: string;
  checkedAt: number;
}

export interface KernelState {
  lastBoot: number;
  lastHealthAt?: number;
  lastRecoveryPlanAt?: number;
  stableBranch: string;
  backupPath: string;
  activeProfile: "stable" | "experimental" | "recovery";
  notes?: string;
}

export interface RecoveryPlanStep {
  id: string;
  title: string;
  action: string;
  status: "pending" | "running" | "done" | "failed";
  detail?: string;
}

export interface RecoveryPlan {
  startedAt: number;
  steps: RecoveryPlanStep[];
}

export interface AuditRecord {
  id: string;
  timestamp: number;
  event: string;
  detail?: string;
  severity?: "info" | "warn" | "error";
}

export interface SystemPrompt {
  text: string;
  mode?: "status" | "recovery" | "instruction" | "diagnostic";
}

export interface SystemResponse {
  summary: string;
  health?: HealthCheck[];
  plan?: RecoveryPlan;
  state?: KernelState;
  audit?: AuditRecord[];
}
