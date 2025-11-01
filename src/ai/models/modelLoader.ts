/**
 * File: src/ai/models/modelLoader.ts
 * Purpose: Load and manage AI models dynamically at runtime
 * 
 * Features:
 * - On-demand model loading from registry
 * - Structure validation before loading
 * - Enable/disable without restart
 * - Graceful error handling
 * - Hot-reload support
 */

import { getDomainRegistry, type DomainManifest } from "../knowledge-domains/domainScanner";
import { getModelRegistry, type ModelManifest } from "./modelRegistry";

// ============================================================================
// Types
// ============================================================================

export interface LoadedModel {
  manifest: ModelManifest;
  instance: any;
  loadedAt: string;
  status: "ready" | "loading" | "error" | "disabled";
  errorMessage?: string;
}

export interface LoadedDomain {
  manifest: DomainManifest;
  instance: any;
  loadedAt: string;
  status: "ready" | "loading" | "error" | "disabled";
  errorMessage?: string;
}

// ============================================================================
// Model Loader
// ============================================================================

export class ModelLoader {
  private loadedModels: Map<string, LoadedModel> = new Map();
  private loadedDomains: Map<string, LoadedDomain> = new Map();
  
  /**
   * Load all enabled models
   */
  async loadAllModels(): Promise<void> {
    const registry = await getModelRegistry();
    
    for (const modelId of registry.enabledModels) {
      try {
        await this.loadModel(modelId);
      } catch (error) {
        console.warn(`⚠️  Failed to load model: ${modelId}`, error);
      }
    }
  }
  
  /**
   * Load single model by ID
   */
  async loadModel(modelId: string): Promise<LoadedModel> {
    // Check if already loaded
    if (this.loadedModels.has(modelId)) {
      return this.loadedModels.get(modelId)!;
    }
    
    const registry = await getModelRegistry();
    const manifest = registry.models[modelId];
    
    if (!manifest) {
      throw new Error(`Model not found: ${modelId}`);
    }
    
    if (!manifest.enabled) {
      const loaded: LoadedModel = {
        manifest,
        instance: null,
        loadedAt: new Date().toISOString(),
        status: "disabled",
      };
      this.loadedModels.set(modelId, loaded);
      return loaded;
    }
    
    // Validate structure
    if (!this.validateModelStructure(manifest)) {
      const loaded: LoadedModel = {
        manifest,
        instance: null,
        loadedAt: new Date().toISOString(),
        status: "error",
        errorMessage: "Invalid model structure",
      };
      this.loadedModels.set(modelId, loaded);
      return loaded;
    }
    
    // Load model
    const loaded: LoadedModel = {
      manifest,
      instance: null,
      loadedAt: new Date().toISOString(),
      status: "loading",
    };
    this.loadedModels.set(modelId, loaded);
    
    try {
      // Attempt to dynamically import inference engine
      if (manifest.paths.inferenceEnginePath) {
        const inferenceModule = await import(
          `../models/${modelId}/${manifest.paths.inferenceEnginePath}`
        );
        loaded.instance = inferenceModule.default || inferenceModule;
      }
      
      loaded.status = "ready";
      console.log(`✅ Loaded model: ${manifest.displayName}`);
    } catch (error) {
      loaded.status = "error";
      loaded.errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Failed to load model: ${manifest.displayName}`, error);
    }
    
    return loaded;
  }
  
  /**
   * Validate model structure
   */
  private validateModelStructure(manifest: ModelManifest): boolean {
    const required = [
      manifest.structure.hasSeedsFolder,
      manifest.structure.hasWeightsFolder,
      manifest.structure.hasTokenizerConfig,
    ];
    
    return required.every(Boolean);
  }
  
  /**
   * Unload model
   */
  unloadModel(modelId: string): void {
    if (this.loadedModels.has(modelId)) {
      this.loadedModels.delete(modelId);
      console.log(`🗑️  Unloaded model: ${modelId}`);
    }
  }
  
  /**
   * Get loaded model
   */
  getLoadedModel(modelId: string): LoadedModel | null {
    return this.loadedModels.get(modelId) || null;
  }
  
  /**
   * Get all loaded models
   */
  getAllLoadedModels(): LoadedModel[] {
    return Array.from(this.loadedModels.values());
  }
  
  /**
   * Reload model (hot-reload)
   */
  async reloadModel(modelId: string): Promise<LoadedModel> {
    this.unloadModel(modelId);
    return await this.loadModel(modelId);
  }
  
  // ==========================================================================
  // Domain Loading
  // ==========================================================================
  
  /**
   * Load all enabled domains
   */
  async loadAllDomains(): Promise<void> {
    const registry = await getDomainRegistry();
    
    for (const domainId of registry.enabledDomains) {
      try {
        await this.loadDomain(domainId);
      } catch (error) {
        console.warn(`⚠️  Failed to load domain: ${domainId}`, error);
      }
    }
  }
  
  /**
   * Load single domain by ID
   */
  async loadDomain(domainId: string): Promise<LoadedDomain> {
    // Check if already loaded
    if (this.loadedDomains.has(domainId)) {
      return this.loadedDomains.get(domainId)!;
    }
    
    const registry = await getDomainRegistry();
    const manifest = registry.domains[domainId];
    
    if (!manifest) {
      throw new Error(`Domain not found: ${domainId}`);
    }
    
    if (!manifest.enabled) {
      const loaded: LoadedDomain = {
        manifest,
        instance: null,
        loadedAt: new Date().toISOString(),
        status: "disabled",
      };
      this.loadedDomains.set(domainId, loaded);
      return loaded;
    }
    
    // Validate structure
    if (!this.validateDomainStructure(manifest)) {
      const loaded: LoadedDomain = {
        manifest,
        instance: null,
        loadedAt: new Date().toISOString(),
        status: "error",
        errorMessage: "Invalid domain structure",
      };
      this.loadedDomains.set(domainId, loaded);
      return loaded;
    }
    
    // Load domain
    const loaded: LoadedDomain = {
      manifest,
      instance: null,
      loadedAt: new Date().toISOString(),
      status: "loading",
    };
    this.loadedDomains.set(domainId, loaded);
    
    try {
      // Attempt to dynamically import integration API
      if (manifest.paths.integrationAPIPath) {
        const apiModule = await import(
          `../knowledge-domains/${domainId}/${manifest.paths.integrationAPIPath}`
        );
        loaded.instance = apiModule.default || apiModule;
      }
      
      loaded.status = "ready";
      console.log(`✅ Loaded domain: ${manifest.domainName}`);
    } catch (error) {
      loaded.status = "error";
      loaded.errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Failed to load domain: ${manifest.domainName}`, error);
    }
    
    return loaded;
  }
  
  /**
   * Validate domain structure
   */
  private validateDomainStructure(manifest: DomainManifest): boolean {
    const required = [
      manifest.structure.hasInferenceController,
      manifest.structure.hasIntegrationAPI,
    ];
    
    return required.every(Boolean);
  }
  
  /**
   * Unload domain
   */
  unloadDomain(domainId: string): void {
    if (this.loadedDomains.has(domainId)) {
      this.loadedDomains.delete(domainId);
      console.log(`🗑️  Unloaded domain: ${domainId}`);
    }
  }
  
  /**
   * Get loaded domain
   */
  getLoadedDomain(domainId: string): LoadedDomain | null {
    return this.loadedDomains.get(domainId) || null;
  }
  
  /**
   * Get all loaded domains
   */
  getAllLoadedDomains(): LoadedDomain[] {
    return Array.from(this.loadedDomains.values());
  }
  
  /**
   * Reload domain (hot-reload)
   */
  async reloadDomain(domainId: string): Promise<LoadedDomain> {
    this.unloadDomain(domainId);
    return await this.loadDomain(domainId);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let loaderInstance: ModelLoader | null = null;

export function getModelLoader(): ModelLoader {
  if (!loaderInstance) {
    loaderInstance = new ModelLoader();
  }
  return loaderInstance;
}
