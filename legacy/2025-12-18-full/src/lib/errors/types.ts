export type ErrorSeverity = "info" | "warning" | "error" | "critical";
export type ErrorStatus = "open" | "resolving" | "resolved" | "failed";
export type ErrorResolutionMode = "manual" | "auto";

export interface ResolutionHistoryEntry {
  id: string;
  timestamp: string;
  actor: "system" | "admin" | "zacai";
  action: "detected" | "auto_attempt" | "auto_success" | "manual_resolve" | "auto_failure" | "status_change";
  summary: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorResolutionState {
  status: ErrorStatus;
  mode: ErrorResolutionMode;
  strategy?: "self-heal" | "rollback";
  attempts: number;
  lastAttemptAt?: string;
  lastResult?: string;
  githubBackupBranch?: string;
}

export interface SystemErrorRecord {
  id: string;
  domain: string;
  subsystem: string;
  source: string;
  message: string;
  severity: ErrorSeverity;
  status: ErrorStatus;
  detectedAt: string;
  updatedAt: string;
  metadata?: {
    issueDescription?: string;
    affectedFiles?: string[];
    logReferences?: string[];
    details?: Record<string, unknown>;
  };
  resolution: ErrorResolutionState;
  history: ResolutionHistoryEntry[];
}

export interface RecordErrorPayload {
  domain: string;
  subsystem: string;
  source?: string;
  message: string;
  severity: ErrorSeverity;
  detectedAt?: string;
  metadata?: SystemErrorRecord["metadata"];
}

export interface ListErrorsOptions {
  status?: "active" | "resolved" | "all";
  limit?: number;
}

export interface RegistryState {
  meta: {
    lastActivityTimestamp: string | null;
  };
  items: SystemErrorRecord[];
}

export interface ActivityEventPayload {
  ts?: string;
  category?: string;
  action?: string;
  severity?: ErrorSeverity;
  message?: string;
  details?: Record<string, unknown>;
}

export interface AutoResolveConfig {
  autoResolveErrors: boolean;
  errorRecoveryStrategy: "self-heal" | "rollback";
  maxAutoResolveAttempts: number;
}
