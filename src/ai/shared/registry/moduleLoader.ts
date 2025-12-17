/**
 * File: src/ai/shared/registry/moduleLoader.ts
 * Purpose: Unified dynamic module loader for models, domains, and plugins
 * 
 * Benefits:
 * - Single loader for all module types
 * - DRY principle
 * - Consistent API
 * - Hot-reload support
 * - Graceful error handling
 */

import type { ModuleManifest, ModuleRegistry, ModuleType, ScannerConfig } from "./moduleRegistry";
import { getRegistry } from "./moduleRegistry";

// ============================================================================
// Types
// ============================================================================

export interface LoadedModule {
  manifest: ModuleManifest;
  instance: any;
  loadedAt: string;
  status: "ready" | "loading" | "error" | "disabled";
  errorMessage?: string;
}

// ============================================================================
// Unified Module Loader
// ============================================================================

export class UnifiedModuleLoader {
  private loadedModules: Map<string, LoadedModule> = new Map();
  private config: ScannerConfig;
  
  constructor(config: ScannerConfig) {
    this.config = config;
  }
  
  /**
   * Load all enabled modules
   */
  async loadAll(): Promise<void> {
    const registry = await getRegistry(this.config);
    
    console.log(`🚀 Loading ${registry.enabledModules.length} enabled ${this.config.moduleType}(s)...`);
    
    for (const moduleId of registry.enabledModules) {
      try {
        await this.load(moduleId);
      } catch (error) {
        console.warn(`⚠️  Failed to load ${this.config.moduleType}: ${moduleId}`, error);
      }
    }
    
    console.log(`✅ Loaded ${this.loadedModules.size} ${this.config.moduleType}(s)`);
  }
  
  /**
   * Load single module by ID
   */
  async load(moduleId: string): Promise<LoadedModule> {
    // Check if already loaded
    if (this.loadedModules.has(moduleId)) {
      return this.loadedModules.get(moduleId)!;
    }
    
    const registry = await getRegistry(this.config);
    const manifest = registry.modules[moduleId];
    
    if (!manifest) {
      throw new Error(`${this.config.moduleType} not found: ${moduleId}`);
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
    if (!this.validateStructure(manifest)) {
      const loaded: LoadedModule = {
        manifest,
        instance: null,
        loadedAt: new Date().toISOString(),
        status: "error",
        errorMessage: `Invalid ${this.config.moduleType} structure`,
      };
      this.loadedModules.set(moduleId, loaded);
      return loaded;
    }
    
    // Create loading placeholder
    const loaded: LoadedModule = {
      manifest,
      instance: null,
      loadedAt: new Date().toISOString(),
      status: "loading",
    };
    this.loadedModules.set(moduleId, loaded);
    
    try {
      // Dynamically import module
      const instance = await this.importModule(moduleId, manifest);
      
      loaded.instance = instance;
      loaded.status = "ready";
      console.log(`  ✅ Loaded: ${manifest.moduleName}`);
    } catch (error) {
      loaded.status = "error";
      loaded.errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`  ❌ Failed to load: ${manifest.moduleName}`, error);
    }
    
    return loaded;
  }
  
  /**
   * Import module dynamically
   */
  private async importModule(moduleId: string, manifest: ModuleManifest): Promise<any> {
    // Determine entry point based on module type
    let entryPath: string | undefined;
    
    if (manifest.moduleType === "model") {
      entryPath = manifest.paths.inferenceEnginePath;
    } else if (manifest.moduleType === "domain") {
      entryPath = manifest.paths.integrationAPIPath;
    }
    
    if (!entryPath) {
      throw new Error(`No entry point found for ${manifest.moduleType}: ${moduleId}`);
    }
    
    // Construct import path
    const importPath = `../${this.config.moduleType === "model" ? "models" : "knowledge-domains"}/${moduleId}/${entryPath}`;
    
    const module = await import(importPath);
    return module.default || module;
  }
  
  /**
   * Validate module structure
   */
  private validateStructure(manifest: ModuleManifest): boolean {
    if (manifest.moduleType === "model") {
      return !!(
        manifest.structure.hasSeedsFolder &&
        manifest.structure.hasWeightsFolder &&
        manifest.structure.hasInferenceEngine
      );
    } else if (manifest.moduleType === "domain") {
      return !!(
        manifest.structure.hasInferenceController &&
        manifest.structure.hasIntegrationAPI
      );
    }
    
    // Default: basic validation
    return !!(manifest.structure.hasSeedsFolder || manifest.structure.hasInference);
  }
  
  /**
   * Unload module
   */
  unload(moduleId: string): void {
    if (this.loadedModules.has(moduleId)) {
      this.loadedModules.delete(moduleId);
      console.log(`🗑️  Unloaded ${this.config.moduleType}: ${moduleId}`);
    }
  }
  
  /**
   * Get loaded module
   */
  get(moduleId: string): LoadedModule | null {
    return this.loadedModules.get(moduleId) || null;
  }
  
  /**
   * Get all loaded modules
   */
  getAll(): LoadedModule[] {
    return Array.from(this.loadedModules.values());
  }
  
  /**
   * Get all ready modules
   */
  getReady(): LoadedModule[] {
    return this.getAll().filter(m => m.status === "ready");
  }
  
  /**
   * Reload module (hot-reload)
   */
  async reload(moduleId: string): Promise<LoadedModule> {
    this.unload(moduleId);
    
    // Force registry refresh
    await getRegistry(this.config, true);
    
    return await this.load(moduleId);
  }
  
  /**
   * Get loader statistics
   */
  getStats() {
    const all = this.getAll();
    return {
      total: all.length,
      ready: all.filter(m => m.status === "ready").length,
      loading: all.filter(m => m.status === "loading").length,
      error: all.filter(m => m.status === "error").length,
      disabled: all.filter(m => m.status === "disabled").length,
    };
  }
}

// ============================================================================
// Singleton Instances
// ============================================================================

const loaders = new Map<string, UnifiedModuleLoader>();

export function getLoader(config: ScannerConfig): UnifiedModuleLoader {
  const key = `${config.moduleType}:${config.scanDir}`;
  
  if (!loaders.has(key)) {
    loaders.set(key, new UnifiedModuleLoader(config));
  }
  
  return loaders.get(key)!;
}

// ============================================================================
// Convenience APIs
// ============================================================================

export async function loadAllModules(config: ScannerConfig): Promise<void> {
  const loader = getLoader(config);
  await loader.loadAll();
}

export async function loadModule(config: ScannerConfig, moduleId: string): Promise<LoadedModule> {
  const loader = getLoader(config);
  return await loader.load(moduleId);
}

export function getLoadedModule(config: ScannerConfig, moduleId: string): LoadedModule | null {
  const loader = getLoader(config);
  return loader.get(moduleId);
}

export function getAllLoadedModules(config: ScannerConfig): LoadedModule[] {
  const loader = getLoader(config);
  return loader.getAll();
}

export function getReadyModules(config: ScannerConfig): LoadedModule[] {
  const loader = getLoader(config);
  return loader.getReady();
}
