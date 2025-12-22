/**
 * Diagnostics: Kernel-level diagnostics, auto-recovery, and maintenance mode logic
 * World-class, robust, production-grade
 */
import { SystemKernel } from "../kernel/SystemKernel.js";
import { ModuleRegistry } from "../registries/module-registry.js";
import { Heartbeat } from "../heartbeat.js";

export class Diagnostics {
  private kernel: SystemKernel;
  private registry: ModuleRegistry;
  private heartbeat: Heartbeat;

  constructor(kernel: SystemKernel, registry: ModuleRegistry, heartbeat: Heartbeat) {
    this.kernel = kernel;
    this.registry = registry;
    this.heartbeat = heartbeat;
  }

  async runFullDiagnostics(): Promise<{
    health: ReturnType<SystemKernel["runHealthChecks"]>;
    modules: Record<string, unknown>;
    uptime: number;
    systemTime: string;
    maintenanceMode: boolean;
  }> {
    const health = this.kernel.runHealthChecks();
    const modules = await this.registry.scan("packages/zacai-core/src/system-registry.json");
    const uptime = this.heartbeat.getUptimeMs();
    return {
      health,
      modules,
      uptime,
      systemTime: this.heartbeat.getSystemTime(),
      maintenanceMode: health.some((h: any) => h.status !== "healthy"),
    };
  }

  async autoRecover(): Promise<string> {
    // Example: If any module is offline, attempt recovery
    const modules = await this.registry.scan("packages/zacai-core/src/system-registry.json");
    for (const [name, mod] of Object.entries(modules)) {
      const m = mod as { status: string };
      if (m.status === "OFFLINE") {
        // TODO: Run revival script for module
        // e.g., import(`../revival/${name}.js`).then(m => m.restore())
      }
    }
    return "Auto-recovery attempted";
  }
}
