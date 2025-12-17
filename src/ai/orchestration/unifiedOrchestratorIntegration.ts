/**
 * File: src/ai/orchestration/unifiedOrchestratorIntegration.ts
 * Purpose: Orchestrator integration that relies on the system-wide registry/loader.
 */

import { subscribe } from "./eventBus";
import type { ModuleCategory, ModuleManifest } from "./system";
import {
  getSystemRegistry,
  getSystemLoader,
  getReadySystemModules,
  getAllLoadedSystemModules,
  loadAllSystemModules,
  loadSystemModule,
  type LoadedSystemModule,
  ensureSystemWatcher,
  SYSTEM_EVENT_TOPICS,
  type RegistryUpdatePayload,
} from "./system";

const MODEL_CATEGORY: ModuleCategory = "model";
const DOMAIN_CATEGORY: ModuleCategory = "domain";

export class UnifiedOrchestrator {
  private loader = getSystemLoader();
  private initialized = false;
  private watcherReady = false;
  private unsubscribeRegistry?: () => void;
  private autoReloadTimer: ReturnType<typeof setTimeout> | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log("🎯 Initializing Unified Orchestrator...");
    await loadAllSystemModules([MODEL_CATEGORY, DOMAIN_CATEGORY]);
    await this.initializeWatcherBridge();
    this.initialized = true;

    const readyModels = this.loader.getReadyModules(MODEL_CATEGORY);
    const readyDomains = this.loader.getReadyModules(DOMAIN_CATEGORY);

    console.log("\n📊 Available Modules:");
    console.log(`   Models: ${readyModels.length}`);
    readyModels.forEach(m => console.log(`     - ${m.manifest.name} (${m.manifest.id})`));

    console.log(`   Domains: ${readyDomains.length}`);
    readyDomains.forEach(d => console.log(`     - ${d.manifest.name} (${d.manifest.id})`));

    console.log("\n✅ Orchestrator ready");
  }

  async processRequest(request: {
    query: string;
    context?: any;
    preferredModel?: string;
    preferredDomain?: string;
  }): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }

    const models = this.loader.getReadyModules(MODEL_CATEGORY);
    const domains = this.loader.getReadyModules(DOMAIN_CATEGORY);

    if (request.preferredModel) {
      const model = this.loader.getLoadedModule(MODEL_CATEGORY, request.preferredModel);
      if (model?.status === "ready") {
        return await this.executeWithModel(model, request);
      }
    }

    if (request.preferredDomain) {
      const domain = this.loader.getLoadedModule(DOMAIN_CATEGORY, request.preferredDomain);
      if (domain?.status === "ready") {
        return await this.executeWithDomain(domain, request);
      }
    }

    const route = await this.analyzeAndRoute(request.query, models, domains);
    return route.type === "model"
      ? await this.executeWithModel(route.module, request)
      : await this.executeWithDomain(route.module, request);
  }

  private async initializeWatcherBridge(): Promise<void> {
    if (this.watcherReady) {
      return;
    }

    await ensureSystemWatcher({ debounceMs: 1000, autoRebuild: true });

    this.unsubscribeRegistry = subscribe(SYSTEM_EVENT_TOPICS.REGISTRY_UPDATED, payload => {
      this.handleRegistryUpdated(payload as RegistryUpdatePayload);
    });

    this.watcherReady = true;
  }

  private handleRegistryUpdated(payload: RegistryUpdatePayload): void {
    if (!this.initialized) {
      return;
    }

    console.log(
      `[UnifiedOrchestrator] Registry updated (${payload.changedFiles.length} change${
        payload.changedFiles.length === 1 ? "" : "s"
      }) via ${payload.reason}`
    );
    this.scheduleAutoReload(payload.reason);
  }

  private scheduleAutoReload(reason: string): void {
    if (this.autoReloadTimer) {
      return;
    }

    this.autoReloadTimer = setTimeout(() => {
      this.autoReloadTimer = null;
      void this.reloadAllModules().then(() => {
        console.log(`[UnifiedOrchestrator] Auto-reloaded modules after ${reason}`);
      }).catch(error => {
        console.error("[UnifiedOrchestrator] Auto reload failed", error);
      });
    }, 750);
  }

  private async analyzeAndRoute(
    query: string,
    models: LoadedSystemModule[],
    domains: LoadedSystemModule[]
  ): Promise<{ type: "model" | "domain"; module: LoadedSystemModule }> {
    const queryLower = query.toLowerCase();

    for (const domain of domains) {
      if (queryLower.includes(domain.manifest.id.toLowerCase())) {
        return { type: "domain", module: domain };
      }
    }

    for (const model of models) {
      const subtype = model.manifest.subtype?.toLowerCase();
      if (subtype === "llm" && queryLower.includes("text")) {
        return { type: "model", module: model };
      }
      if (subtype === "diffusion" && queryLower.includes("image")) {
        return { type: "model", module: model };
      }
    }

    const fallbackModel = models.find(m => m.manifest.subtype === "llm") ?? models[0];
    if (fallbackModel) {
      return { type: "model", module: fallbackModel };
    }

    const fallbackDomain = domains[0];
    if (fallbackDomain) {
      return { type: "domain", module: fallbackDomain };
    }

    throw new Error("No models or domains available");
  }

  private async executeWithModel(model: LoadedSystemModule, request: any): Promise<any> {
    console.log(`🤖 Using model: ${model.manifest.name}`);

    if (model.instance && typeof (model.instance as any).infer === "function") {
      return await (model.instance as any).infer(request.query, request.context);
    }

    return {
      model: model.manifest.name,
      response: "Model inference not implemented",
      query: request.query,
    };
  }

  private async executeWithDomain(domain: LoadedSystemModule, request: any): Promise<any> {
    console.log(`📚 Using domain: ${domain.manifest.name}`);

    if (domain.instance && typeof (domain.instance as any).query === "function") {
      return await (domain.instance as any).query(request.query, request.context);
    }

    return {
      domain: domain.manifest.name,
      response: "Domain query not implemented",
      query: request.query,
    };
  }

  getAvailableModels(): ModuleManifest[] {
    return getReadySystemModules(MODEL_CATEGORY).map(m => m.manifest);
  }

  getAvailableDomains(): ModuleManifest[] {
    return getReadySystemModules(DOMAIN_CATEGORY).map(d => d.manifest);
  }

  async reloadModule(moduleId: string): Promise<void> {
    console.log(`🔄 Reloading module: ${moduleId}`);
    const category = await this.resolveModuleCategory(moduleId);
    if (!category) {
      throw new Error(`Unable to determine category for module ${moduleId}`);
    }
    await loadSystemModule(category, moduleId, { forceReload: true, forceRefresh: true });
  }

  async reloadAllModules(): Promise<void> {
    console.log("🔄 Reloading all modules...");
    this.loader = getSystemLoader();
    await loadAllSystemModules([MODEL_CATEGORY, DOMAIN_CATEGORY], { forceRefresh: true });
    console.log("✅ All modules reloaded");
  }

  async getStatus(): Promise<{
    initialized: boolean;
    registry: any;
    loadedModules: any;
  }> {
    const registry = await getSystemRegistry();
    const readyModels = getReadySystemModules(MODEL_CATEGORY);
    const readyDomains = getReadySystemModules(DOMAIN_CATEGORY);
    const loadedModels = getAllLoadedSystemModules(MODEL_CATEGORY);
    const loadedDomains = getAllLoadedSystemModules(DOMAIN_CATEGORY);

    return {
      initialized: this.initialized,
      registry: {
        totalModules: registry.stats.totalModules,
        stats: registry.stats,
        lastScanned: registry.generatedAt,
      },
      loadedModules: {
        stats: this.loader.getStats(),
        models: loadedModels.map(m => ({
          id: m.manifest.id,
          name: m.manifest.name,
          type: m.manifest.subtype,
          status: m.status,
          ready: readyModels.some(ready => ready.key === m.key),
        })),
        domains: loadedDomains.map(d => ({
          id: d.manifest.id,
          name: d.manifest.name,
          status: d.status,
          ready: readyDomains.some(ready => ready.key === d.key),
        })),
      },
    };
  }

  private async resolveModuleCategory(moduleId: string): Promise<ModuleCategory | null> {
    const loaded = this.loader.getLoadedModules();
    const match = loaded.find(entry => entry.manifest.id === moduleId);
    if (match) {
      return match.category;
    }

    const registry = await getSystemRegistry();
    for (const [category, modules] of Object.entries(registry.modules)) {
      if (modules && modules[moduleId]) {
        return category as ModuleCategory;
      }
    }

    return null;
  }
}

let orchestratorInstance: UnifiedOrchestrator | null = null;

export function getUnifiedOrchestrator(): UnifiedOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new UnifiedOrchestrator();
  }
  return orchestratorInstance;
}
