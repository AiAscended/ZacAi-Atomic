import type { AuditRecord, HealthCheck, KernelState, RecoveryPlan } from "../types/index.js";
export declare class SystemKernel {
    private stateStore;
    private auditLog;
    private state;
    constructor();
    getState(): KernelState;
    runHealthChecks(): HealthCheck[];
    planRecovery(): RecoveryPlan;
    switchProfile(profile: KernelState["activeProfile"], note?: string): void;
    updateStableBranch(branch: string): void;
    markBoot(): void;
    recentAudit(limit?: number): AuditRecord[];
    private recordAudit;
}
//# sourceMappingURL=SystemKernel.d.ts.map