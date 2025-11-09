/**
 * File: src/ai/shared/loader/unifiedLoader.ts
 * Purpose: Unified dynamic loader for models and domains
 * 
 * Features:
 * - Single loader for both models and domains
 * - Shared validation and error handling
 * - Hot-reload support
 * - Orchestrator-ready module access
 */

import { getUnifiedRegistry, type ModuleManifest, type ModuleType } from "../registry/unifiedRegistry";

// ============================================================================
// Types
// ============================================================================

export interface LoadedModule {
  manifest: ModuleManifest;
  instance: unknown;
  loadedAt: string;
  status: "ready" | "loading" | "error" | "disabled";
  errorMessage?: string;
}

// ============================================================================
// Unified Loader
// ============================================================================

export class UnifiedLoader {
  private loadedModules: Map<string, LoadedModule> = new Map();
  
  /**
   * Load all enabled modules (models + domains)
   */
  async loadAllModules(): Promise<void> {
    const registry = await getUnifiedRegistry();
    
    // Load models
    for (const modelId of registry.enabledModels) {
      try {
        await this.loadModule(modelId);
      } catch (error) {
        console.warn(`⚠️  Failed to load model: ${modelId}`, error);
      }
    }
    
    // Load domains
    for (const domainId of registry.enabledDomains) {
      try {
        await this.loadModule(domainId);
      } catch (error) {
        console.warn(`⚠️  Failed to load domain: ${domainId}`, error);
      }
    }
  }
  
  /**
   * Load single module (model or domain)
   */
  async loadModule(moduleId: string): Promise<LoadedModule> {
    // Check if already loaded
    if (this.loadedModules.has(moduleId)) {
      return this.loadedModules.get(moduleId)!;
    }
    
    const registry = await getUnifiedRegistry();
    const manifest = registry.modules[moduleId];
    
    if (!manifest) {
      throw new Error(`Module not found: ${moduleId}`);
    }
    
    if (!manifest.enabled) {
      const loaded: LoadedModule = {
        manifest,
        instance: null,
        loadedAt: new Date().toISOString(),
        status: "disabled",
      };
      this.loadedModules.set(moduleId, loaded);
      return loaded;
    }
    
    // Validate structure
    if (!this.validateModuleStructure(manifest)) {
      const loaded: LoadedModule = {
        manifest,
        instance: null,
        loadedAt: new Date().toISOString(),
        status: "error",
        errorMessage: "Invalid module structure",
      };
      this.loadedModules.set(moduleId, loaded);
      return loaded;
    }
    
    // Start loading
    const loaded: LoadedModule = {
      manifest,
      instance: null,
      loadedAt: new Date().toISOString(),
      status: "loading",
    };
    this.loadedModules.set(moduleId, loaded);
    
    try {
      // Determine module path
      const baseDir = manifest.moduleType === "model" ? "models" : "knowledge-domains";
      
      // Try to dynamically import the module
      let modulePath: string | undefined;
      
      if (manifest.moduleType === "model" && manifest.paths.inferenceEnginePath) {
        modulePath = `../../${baseDir}/${moduleId}/${manifest.paths.inferenceEnginePath}`;
      } else if (manifest.moduleType === "domain" && manifest.paths.integrationAPIPath) {
        modulePath = `../../${baseDir}/${moduleId}/${manifest.paths.integrationAPIPath}`;
      }
      
      if (modulePath) {
        const loadedModule = await import(modulePath);
        loaded.instance = loadedModule.default || loadedModule;
      }
      
      loaded.status = "ready";
      console.log(`✅ Loaded ${manifest.moduleType}: ${manifest.displayName}`);
    } catch (error) {
      loaded.status = "error";
      loaded.errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Failed to load ${manifest.moduleType}: ${manifest.displayName}`, error);
    }
    
    return loaded;
  }
  
  /**
   * Validate module structure
   */
  private validateModuleStructure(manifest: ModuleManifest): boolean {
    if (manifest.moduleType === "model") {
      // Models need: seeds, weights, tokenizer
      return manifest.structure.hasSeedsFolder 
        && manifest.structure.hasWeightsFolder 
        && manifest.structure.hasTokenizer;
    } else {
      // Domains need: inference controller, integration API
      return manifest.structure.hasInferenceEngine 
        && manifest.structure.hasIntegrationAPI;
    }
  }
  
  /**
   * Unload module
   */
  unloadModule(moduleId: string): void {
    if (this.loadedModules.has(moduleId)) {
      this.loadedModules.delete(moduleId);
      console.log(`🗑️  Unloaded module: ${moduleId}`);
    }
  }
  
  /**
   * Get loaded module
   */
  getLoadedModule(moduleId: string): LoadedModule | null {
    return this.loadedModules.get(moduleId) || null;
  }
  
  /**
   * Get all loaded modules
   */
  getAllLoadedModules(): LoadedModule[] {
    return Array.from(this.loadedModules.values());
  }
  
  /**
   * Get loaded modules by type
   */
  getLoadedModulesByType(type: ModuleType): LoadedModule[] {
    return Array.from(this.loadedModules.values())
      .filter(m => m.manifest.moduleType === type);
  }
  
  /**
   * Get modules for orchestrator (organized by type, ready status only)
   */
  getModulesForOrchestrator(): {
    models: LoadedModule[];
    domains: LoadedModule[];
    stats: {
      totalLoaded: number;
      readyModels: number;
      readyDomains: number;
    };
  } {
    const models = this.getLoadedModulesByType("model").filter(m => m.status === "ready");
    const domains = this.getLoadedModulesByType("domain").filter(m => m.status === "ready");
    
    return {
      models,
      domains,
      stats: {
        totalLoaded: this.loadedModules.size,
        readyModels: models.length,
        readyDomains: domains.length,
      },
    };
  }
  
  /**
   * Reload module (hot-reload)
   */
  async reloadModule(moduleId: string): Promise<LoadedModule> {
    this.unloadModule(moduleId);
    
    // Bust require cache
    const registry = await getUnifiedRegistry(true); // Force refresh
    
    return await this.loadModule(moduleId);
  }
  
  /**
   * Reload all modules
   */
  async reloadAllModules(): Promise<void> {
    const moduleIds = Array.from(this.loadedModules.keys());
    
    // Unload all
    for (const moduleId of moduleIds) {
      this.unloadModule(moduleId);
    }
    
    // Force registry refresh
    await getUnifiedRegistry(true);
    
    // Reload all
    await this.loadAllModules();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let loaderInstance: UnifiedLoader | null = null;

export function getUnifiedLoader(): UnifiedLoader {
  if (!loaderInstance) {
    loaderInstance = new UnifiedLoader();
  }
  return loaderInstance;
}

// ============================================================================
// Orchestrator Helper Functions
// ============================================================================

/**
 * Get ready modules for orchestrator (convenience function)
 */
export async function getReadyModulesForOrchestrator() {
  const loader = getUnifiedLoader();
  return loader.getModulesForOrchestrator();
}

/**
 * Initialize AI system (load all modules)
 */
export async function initializeAISystem(): Promise<void> {
  console.log("🚀 Initializing AI system...");
  
  const loader = getUnifiedLoader();
  await loader.loadAllModules();
  
  const { stats } = loader.getModulesForOrchestrator();
  console.log(`✅ AI system initialized: ${stats.readyModels} models, ${stats.readyDomains} domains ready`);
}
