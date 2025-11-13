/**
 * File: src/ai/orchestration/unifiedOrchestratorIntegration.ts
 * Purpose: Example integration of unified registry with orchestrator
 * 
 * This shows how the orchestrator should use the unified registry system
 * to dynamically discover, load, and route requests to models/domains.
 */

import {
  getUnifiedRegistry,
  getModulesForOrchestrator,
  type ModuleManifest,
} from "../shared/registry/unifiedRegistry";

import {
  getUnifiedLoader,
  initializeAISystem,
  getReadyModulesForOrchestrator,
  type LoadedModule,
} from "../shared/loader/unifiedLoader";

// ============================================================================
// Orchestrator Integration
// ============================================================================

export class UnifiedOrchestrator {
  private loader = getUnifiedLoader();
  private initialized = false;
  
  /**
   * Initialize orchestrator - load all available modules
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    console.log("🎯 Initializing Unified Orchestrator...");
    
    await initializeAISystem();
    
    this.initialized = true;
    
    // Display available modules
    const { models, domains, stats } = this.loader.getModulesForOrchestrator();
    
    console.log("\n📊 Available Modules:");
    console.log(`   Models: ${stats.readyModels}`);
    models.forEach(m => console.log(`     - ${m.manifest.displayName} (${m.manifest.moduleId})`));
    
    console.log(`   Domains: ${stats.readyDomains}`);
    domains.forEach(d => console.log(`     - ${d.manifest.displayName} (${d.manifest.moduleId})`));
    
    console.log("\n✅ Orchestrator ready");
  }
  
  /**
   * Process request - orchestrator determines which models/domains to use
   */
  async processRequest(request: {
    query: string;
    context?: unknown;
    preferredModel?: string;
    preferredDomain?: string;
  }): Promise<unknown> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const { models, domains } = this.loader.getModulesForOrchestrator();
    
    // Strategy 1: Use preferred model/domain if specified
    if (request.preferredModel) {
      const model = this.loader.getLoadedModule(request.preferredModel);
      if (model?.status === "ready") {
        return await this.executeWithModel(model, request);
      }
    }
    
    if (request.preferredDomain) {
      const domain = this.loader.getLoadedModule(request.preferredDomain);
      if (domain?.status === "ready") {
        return await this.executeWithDomain(domain, request);
      }
    }
    
    // Strategy 2: Intelligent routing based on query analysis
    const route = await this.analyzeAndRoute(request.query, models, domains);
    
    if (route.type === "model") {
      return await this.executeWithModel(route.module, request);
    } else {
      return await this.executeWithDomain(route.module, request);
    }
  }
  
  /**
   * Analyze query and determine best model/domain
   */
  private async analyzeAndRoute(
    query: string,
    models: LoadedModule[],
    domains: LoadedModule[]
  ): Promise<{ type: "model" | "domain"; module: LoadedModule }> {
    // Simple keyword-based routing (enhance with ML later)
    const queryLower = query.toLowerCase();
    
    // Check domain keywords
    for (const domain of domains) {
      const domainName = domain.manifest.moduleId.toLowerCase();
      if (queryLower.includes(domainName)) {
        return { type: "domain", module: domain };
      }
    }
    
    // Check model types
    for (const model of models) {
      const modelType = model.manifest.modelType?.toLowerCase();
      if (modelType === "llm" && queryLower.includes("text")) {
        return { type: "model", module: model };
      }
      if (modelType === "diffusion" && queryLower.includes("image")) {
        return { type: "model", module: model };
      }
    }
    
    // Default: use first available LLM or any model
    const llm = models.find(m => m.manifest.modelType === "llm");
    if (llm) {
      return { type: "model", module: llm };
    }
    
    // Fallback to first available
    if (models.length > 0) {
      return { type: "model", module: models[0] };
    }
    if (domains.length > 0) {
      return { type: "domain", module: domains[0] };
    }
    
    throw new Error("No models or domains available");
  }
  
  /**
   * Execute request with model
   */
  private async executeWithModel(model: LoadedModule, request: { query: string; context?: unknown }): Promise<unknown> {
    console.log(`🤖 Using model: ${model.manifest.displayName}`);
    
    // Call model's inference engine
    if (model.instance && typeof (model.instance as any).infer === "function") {
      return await (model.instance as any).infer(request.query, request.context);
    }
    
    // Fallback implementation
    return {
      model: model.manifest.displayName,
      response: "Model inference not implemented",
      query: request.query,
    };
  }
  
  /**
   * Execute request with domain
   */
  private async executeWithDomain(domain: LoadedModule, request: { query: string; context?: unknown }): Promise<unknown> {
    console.log(`📚 Using domain: ${domain.manifest.displayName}`);
    
    // Call domain's integration API
    if (domain.instance && typeof (domain.instance as any).query === "function") {
      return await (domain.instance as any).query(request.query, request.context);
    }
    
    // Fallback implementation
    return {
      domain: domain.manifest.displayName,
      response: "Domain query not implemented",
      query: request.query,
    };
  }
  
  /**
   * Get available models (for UI/API)
   */
  getAvailableModels(): ModuleManifest[] {
    const { models } = this.loader.getModulesForOrchestrator();
    return models.map(m => m.manifest);
  }
  
  /**
   * Get available domains (for UI/API)
   */
  getAvailableDomains(): ModuleManifest[] {
    const { domains } = this.loader.getModulesForOrchestrator();
    return domains.map(d => d.manifest);
  }
  
  /**
   * Hot-reload specific module
   */
  async reloadModule(moduleId: string): Promise<void> {
    console.log(`🔄 Reloading module: ${moduleId}`);
    await this.loader.reloadModule(moduleId);
  }
  
  /**
   * Hot-reload all modules
   */
  async reloadAllModules(): Promise<void> {
    console.log("🔄 Reloading all modules...");
    await this.loader.reloadAllModules();
    console.log("✅ All modules reloaded");
  }
  
  /**
   * Get system status
   */
  async getStatus(): Promise<{
    initialized: boolean;
    registry: unknown;
    loadedModules: unknown;
  }> {
    const registry = await getUnifiedRegistry();
    const { models, domains, stats } = this.loader.getModulesForOrchestrator();
    
    return {
      initialized: this.initialized,
      registry: {
        totalModules: Object.keys(registry.modules).length,
        stats: registry.stats,
        lastScanned: registry.lastScanned,
      },
      loadedModules: {
        stats,
        models: models.map(m => ({
          id: m.manifest.moduleId,
          name: m.manifest.displayName,
          type: m.manifest.modelType,
          status: m.status,
        })),
        domains: domains.map(d => ({
          id: d.manifest.moduleId,
          name: d.manifest.displayName,
          status: d.status,
        })),
      },
    };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let orchestratorInstance: UnifiedOrchestrator | null = null;

export function getUnifiedOrchestrator(): UnifiedOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new UnifiedOrchestrator();
  }
  return orchestratorInstance;
}

// ============================================================================
// Example Usage
// ============================================================================

/*
// In your main orchestration file:

import { getUnifiedOrchestrator } from "@/ai/orchestration/unifiedOrchestratorIntegration";

// Initialize once at startup
const orchestrator = getUnifiedOrchestrator();
await orchestrator.initialize();

// Process requests
const response = await orchestrator.processRequest({
  query: "What is the capital of France?",
  preferredDomain: "geography", // Optional
});

// Get available modules
const models = orchestrator.getAvailableModels();
const domains = orchestrator.getAvailableDomains();

// Hot-reload
await orchestrator.reloadModule("llm");
await orchestrator.reloadAllModules();

// Check status
const status = await orchestrator.getStatus();
console.log(status);
*/
