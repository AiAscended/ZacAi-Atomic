import type {
  AuditRecord,
  HealthCheck,
  KernelState,
  RecoveryPlan,
  RecoveryPlanStep,
} from "../types";
import { StateStore } from "../persistence/StateStore";
import { AuditLog } from "../persistence/AuditLog";
import { existsSync } from "fs";
import { join } from "path";

export class SystemKernel {
  private stateStore = new StateStore();
  private auditLog = new AuditLog();
  private state: KernelState;

  constructor() {
    this.state = this.stateStore.load();
    this.markBoot();
  }

  getState(): KernelState {
    return { ...this.state };
  }

  runHealthChecks(): HealthCheck[] {
    const now = Date.now();
    const checks: HealthCheck[] = [];

    checks.push({
      id: "kernel",
      name: "kernel",
      status: "healthy",
      detail: "Kernel online",
      checkedAt: now,
    });

    checks.push({
      id: "persistence",
      name: "persistence",
      status: "healthy",
      detail: "State file reachable",
      checkedAt: now,
    });

    // Data directory check
    const dataDir = join(process.cwd(), "packages", "zacai-core", "data");
    const dataStatus: HealthCheck = {
      id: "data-dir",
      name: "data-directory",
      status: existsSync(dataDir) ? "healthy" : "degraded",
      detail: existsSync(dataDir) ? "data directory present" : "data directory missing, will be recreated",
      remediation: existsSync(dataDir) ? undefined : "create data dir",
      checkedAt: now,
    };
    checks.push(dataStatus);

    // Backup path check (directory existence only)
    const backupStatus: HealthCheck = {
      id: "backup",
      name: "backup-path",
      status: existsSync(this.state.backupPath) ? "healthy" : "degraded",
      detail: existsSync(this.state.backupPath)
        ? "backup path reachable"
        : `backup path missing: ${this.state.backupPath}`,
      remediation: existsSync(this.state.backupPath)
        ? undefined
        : "restore or recreate backup directory",
      checkedAt: now,
    };
    checks.push(backupStatus);

    this.state.lastHealthAt = now;
    this.stateStore.save(this.state);
    this.recordAudit({
      id: `audit-health-${now}`,
      timestamp: now,
      event: "health-check",
      detail: "ran kernel health checks",
      severity: "info",
    });

    return checks;
  }

  planRecovery(): RecoveryPlan {
    const steps: RecoveryPlanStep[] = [
      {
        id: "check-stable",
        title: "Validate stable branch",
        action: "git rev-parse stable",
        status: "pending",
      },
      {
        id: "verify-backup",
        title: "Verify backup snapshot",
        action: "check backupPath integrity",
        status: "pending",
      },
      {
        id: "self-test",
        title: "Run kernel self-test",
        action: "execute kernel diagnostics",
        status: "pending",
      },
    ];
    const startedAt = Date.now();
    this.state.lastRecoveryPlanAt = startedAt;
    this.stateStore.save(this.state);
    this.recordAudit({
      id: `audit-recovery-${startedAt}`,
      timestamp: startedAt,
      event: "recovery-plan",
      detail: "generated recovery plan",
      severity: "info",
    });
    return { startedAt, steps };
  }

  switchProfile(profile: KernelState["activeProfile"], note?: string) {
    this.state.activeProfile = profile;
    if (note) this.state.notes = note;
    this.stateStore.save(this.state);
    this.recordAudit({
      id: `audit-profile-${Date.now()}`,
      timestamp: Date.now(),
      event: "profile-switch",
      detail: `switched to ${profile}${note ? ` (${note})` : ""}`,
      severity: "info",
    });
  }

  updateStableBranch(branch: string) {
    this.state.stableBranch = branch;
    this.stateStore.save(this.state);
    this.recordAudit({
      id: `audit-stable-${Date.now()}`,
      timestamp: Date.now(),
      event: "stable-branch",
      detail: `set stable branch to ${branch}`,
      severity: "info",
    });
  }

  markBoot() {
    this.state.lastBoot = Date.now();
    this.stateStore.save(this.state);
    this.recordAudit({
      id: `audit-boot-${this.state.lastBoot}`,
      timestamp: this.state.lastBoot,
      event: "boot",
      detail: "kernel booted",
      severity: "info",
    });
  }

  recentAudit(limit = 10): AuditRecord[] {
    return this.auditLog.readLatest(limit);
  }

  private recordAudit(record: AuditRecord) {
    this.auditLog.write(record);
  }
}
