export class Diagnostics {
    constructor(kernel, registry, heartbeat) {
        this.kernel = kernel;
        this.registry = registry;
        this.heartbeat = heartbeat;
    }
    async runFullDiagnostics() {
        const health = this.kernel.runHealthChecks();
        const modules = await this.registry.scan("packages/zacai-core/src/system-registry.json");
        const uptime = this.heartbeat.getUptimeMs();
        return {
            health,
            modules,
            uptime,
            systemTime: this.heartbeat.getSystemTime(),
            maintenanceMode: health.some((h) => h.status !== "healthy"),
        };
    }
    async autoRecover() {
        // Example: If any module is offline, attempt recovery
        const modules = await this.registry.scan("packages/zacai-core/src/system-registry.json");
        for (const [name, mod] of Object.entries(modules)) {
            const m = mod;
            if (m.status === "OFFLINE") {
                // TODO: Run revival script for module
                // e.g., import(`../revival/${name}.js`).then(m => m.restore())
            }
        }
        return "Auto-recovery attempted";
    }
}
//# sourceMappingURL=Diagnostics.js.map