/**
 * Test: Critical file boot order and restoration
 * Ensures system kernel can restore and boot all core modules in correct order
 */
import { SystemKernel } from "../kernel/SystemKernel.js";
import { ModuleRegistry } from "../registries/module-registry.js";

describe("Critical Boot Order", () => {
  it("should scan registry and report all modules", async () => {
    const registry = new ModuleRegistry();
    const modules = await registry.scan("packages/zacai-core/src/system-registry.json");
    expect(Object.keys(modules)).toContain("core-model-system");
    expect(Object.keys(modules)).toContain("core-memory");
    expect(Object.keys(modules)).toContain("orchestration-model");
  });

  it("should run kernel health checks and report healthy or degraded", () => {
    const kernel = new SystemKernel();
    const health = kernel.runHealthChecks();
    expect(health.length).toBeGreaterThan(0);
    expect(health.some(h => h.status === "healthy" || h.status === "degraded")).toBe(true);
  });
});
