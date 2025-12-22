/**
 * Diagnostics: Kernel-level diagnostics, auto-recovery, and maintenance mode logic
 * World-class, robust, production-grade
 */
import { SystemKernel } from "../kernel/SystemKernel.js";
import { ModuleRegistry } from "../registries/module-registry.js";
import { Heartbeat } from "../heartbeat.js";
export declare class Diagnostics {
    private kernel;
    private registry;
    private heartbeat;
    constructor(kernel: SystemKernel, registry: ModuleRegistry, heartbeat: Heartbeat);
    runFullDiagnostics(): Promise<{
        health: ReturnType<SystemKernel["runHealthChecks"]>;
        modules: Record<string, unknown>;
        uptime: number;
        systemTime: string;
        maintenanceMode: boolean;
    }>;
    autoRecover(): Promise<string>;
}
//# sourceMappingURL=Diagnostics.d.ts.map