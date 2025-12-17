/**
 * File: src/ai/shared/registry/unifiedRegistry.ts
 * Purpose: Unified registry system for both models and domains
 * 
 * Architecture:
 * - Single scanner handles both models and domains
 * - Shared validation logic
 * - Unified caching and persistence
 * - Orchestrator reads from one consolidated registry
 * 
 * Benefits:
 * - DRY principle (no code duplication)
 * - Faster scanning (one pass instead of two)
 * - Easier maintenance
 * - Single source of truth
 */

import * as fs from "fs/promises";
import * as path from "path";

// ============================================================================
// Types
// ============================================================================

export type ModuleType = "model" | "domain";

export interface ModuleManifest {
  moduleId: string;
  moduleType: ModuleType;
  displayName: string;
  version: string;
  description: string;
  enabled: boolean;
  
  // Model-specific fields
  modelType?: "llm" | "cnn" | "rnn" | "gan" | "diffusion" | "multimodal";
  
  // Structure validation
  structure: {
    hasSeedsFolder: boolean;
    hasWeightsFolder: boolean;
    hasTokenizer: boolean;
    hasInferenceEngine: boolean; // Model: inference/engine.ts | Domain: inferenceController.ts
    hasTrainingPipeline: boolean; // Model: training/pipeline.ts | Domain: trainingController.ts
    hasIntegrationAPI: boolean;  // Domain-only: integrationAPI.ts
  };
  
  // File paths (relative to module folder)
  paths: {
    seedDataPath?: string;
    seedVocabPath?: string;
    pretrainedWeightsPath?: string;
    learnedDataPath?: string;
    trainingWeightsPath?: string;
    tokenizerPath?: string;
    baseTokensPath?: string;
    inferenceEnginePath?: string;
    trainingPipelinePath?: string;
    integrationAPIPath?: string;
    scriptsPath?: string;
  };
  
  // Metadata
  metadata: {
    seedVocabSize?: number;
    baseTokenCount?: number;
    hasLearnedData?: boolean;
    lastTrainingDate?: string;
    lastUpdated: string;
    discoveredAt: string;
  };
}

export interface UnifiedRegistry {
  version: string;
  lastScanned: string;
  modules: Record<string, ModuleManifest>;
  
  // Quick access arrays
  enabledModels: string[];
  enabledDomains: string[];
  
  // Statistics
  stats: {
    totalModels: number;
    totalDomains: number;
    enabledModels: number;
    enabledDomains: number;
  };
}

// ============================================================================
// Constants
// ============================================================================

const AI_DIR = path.join(process.cwd(), "src", "ai");
const MODELS_DIR = path.join(AI_DIR, "models");
const DOMAINS_DIR = path.join(AI_DIR, "knowledge-domains");
const REGISTRY_FILE = path.join(AI_DIR, "UNIFIED_REGISTRY.json");

const SKIP_FOLDERS = ["shared", "node_modules", ".git", "ai_utils"];
const SKIP_FILES = [
  "registry.ts", "registerAllDomains.ts", "domainScanner.ts", 
  "modelRegistry.ts", "modelLoader.ts", "unifiedRegistry.ts",
  "DOMAIN_REGISTRY.json", "MODEL_REGISTRY.json", "UNIFIED_REGISTRY.json"
];

// ============================================================================
// Unified Scanner
// ============================================================================

export class UnifiedScanner {
  private registry: UnifiedRegistry;
  
  constructor() {
    this.registry = {
      version: "2.0.0",
      lastScanned: new Date().toISOString(),
      modules: {},
      enabledModels: [],
      enabledDomains: [],
      stats: {
        totalModels: 0,
        totalDomains: 0,
        enabledModels: 0,
        enabledDomains: 0,
      },
    };
  }
  
  /**
   * Scan both models and domains in one pass
   */
  async scanAll(): Promise<UnifiedRegistry> {
    console.log("🔍 Scanning AI modules (models + domains)...");
    
    // Scan models
    await this.scanDirectory(MODELS_DIR, "model");
    
    // Scan domains
    await this.scanDirectory(DOMAINS_DIR, "domain");
    
    // Update statistics
    this.updateStatistics();
    
    this.registry.lastScanned = new Date().toISOString();
    
    console.log(`✅ Scan complete: ${this.registry.stats.totalModels} models, ${this.registry.stats.totalDomains} domains`);
    
    return this.registry;
  }
  
  /**
   * Scan directory (models or domains)
   */
  private async scanDirectory(dir: string, moduleType: ModuleType): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (!entry.isDirectory() || SKIP_FOLDERS.includes(entry.name)) {
          continue;
        }
        
        try {
          const manifest = await this.scanModule(dir, entry.name, moduleType);
          if (manifest) {
            this.registry.modules[manifest.moduleId] = manifest;
            
            if (manifest.enabled) {
              if (moduleType === "model") {
                this.registry.enabledModels.push(manifest.moduleId);
              } else {
                this.registry.enabledDomains.push(manifest.moduleId);
              }
            }
          }
        } catch (error) {
          console.warn(`⚠️  Failed to scan ${moduleType}: ${entry.name}`, error);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to scan ${moduleType} directory:`, error);
    }
  }
  
  /**
   * Scan individual module (model or domain)
   */
  private async scanModule(
    baseDir: string,
    folderName: string,
    moduleType: ModuleType
  ): Promise<ModuleManifest | null> {
    const modulePath = path.join(baseDir, folderName);
    
    console.log(`  📦 Scanning ${moduleType}: ${folderName}`);
    
    // Read directory contents
    const files = await this.readDirectoryRecursive(modulePath);
    
    // Detect model type if this is a model
    let modelType: ModuleManifest["modelType"] | undefined;
    if (moduleType === "model") {
      modelType = this.detectModelType(folderName);
    }
    
    // Check structure
    const structure = {
      hasSeedsFolder: files.some(f => f.includes("seed")),
      hasWeightsFolder: files.some(f => f.includes("weight")),
      hasTokenizer: files.some(f => /tokenizer/i.test(f)),
      hasInferenceEngine: files.some(f => 
        moduleType === "model" 
          ? /inference.*engine/i.test(f)
          : /inference.*controller/i.test(f)
      ),
      hasTrainingPipeline: files.some(f => 
        moduleType === "model"
          ? /training.*pipeline/i.test(f)
          : /training.*controller/i.test(f)
      ),
      hasIntegrationAPI: files.some(f => /integration.*api/i.test(f)),
    };
    
    // Build paths
    const paths: ModuleManifest["paths"] = {
      seedDataPath: files.find(f => /seed.*data\.json/i.test(f)),
      seedVocabPath: files.find(f => /seed.*vocab\.json/i.test(f)),
      pretrainedWeightsPath: files.find(f => f.includes("pretrained") && f.includes("weight")),
      learnedDataPath: files.find(f => /learned.*data\.json/i.test(f)),
      trainingWeightsPath: files.find(f => /training.*weight/i.test(f)),
      tokenizerPath: files.find(f => /tokenizer\.ts/i.test(f)),
      baseTokensPath: files.find(f => /base.*tokens\.json/i.test(f)),
      inferenceEnginePath: files.find(f => 
        moduleType === "model"
          ? /inference.*engine\.ts/i.test(f)
          : /inference.*controller\.ts/i.test(f)
      ),
      trainingPipelinePath: files.find(f => 
        moduleType === "model"
          ? /training.*pipeline\.ts/i.test(f)
          : /training.*controller\.ts/i.test(f)
      ),
      integrationAPIPath: files.find(f => /integration.*api\.ts/i.test(f)),
      scriptsPath: files.find(f => f.includes("scripts")),
    };
    
    // Load metadata
    const metadata = await this.loadMetadata(modulePath, paths);
    
    // Determine if module is enabled (has minimum required structure)
    const enabled = moduleType === "model"
      ? structure.hasSeedsFolder && structure.hasWeightsFolder && structure.hasTokenizer
      : structure.hasInferenceEngine && structure.hasIntegrationAPI;
    
    // Build manifest
    const manifest: ModuleManifest = {
      moduleId: folderName,
      moduleType,
      displayName: this.formatDisplayName(folderName),
      version: "1.0.0",
      description: `${this.formatDisplayName(folderName)} ${moduleType}`,
      enabled,
      modelType,
      structure,
      paths,
      metadata: {
        ...metadata,
        lastUpdated: new Date().toISOString(),
        discoveredAt: new Date().toISOString(),
      },
    };
    
    return manifest;
  }
  
  /**
   * Load metadata from files
   */
  private async loadMetadata(
    modulePath: string,
    paths: ModuleManifest["paths"]
  ): Promise<Partial<ModuleManifest["metadata"]>> {
    const metadata: Partial<ModuleManifest["metadata"]> = {
      hasLearnedData: !!paths.learnedDataPath,
    };
    
    // Load seed vocab size
    if (paths.seedVocabPath) {
      try {
        const vocabContent = await fs.readFile(
          path.join(modulePath, paths.seedVocabPath),
          "utf8"
        );
        const vocab = JSON.parse(vocabContent);
        metadata.seedVocabSize = Array.isArray(vocab) ? vocab.length : Object.keys(vocab).length;
      } catch {
        // Ignore
      }
    }
    
    // Load base token count
    if (paths.baseTokensPath) {
      try {
        const tokensContent = await fs.readFile(
          path.join(modulePath, paths.baseTokensPath),
          "utf8"
        );
        const tokens = JSON.parse(tokensContent);
        metadata.baseTokenCount = Array.isArray(tokens) ? tokens.length : Object.keys(tokens).length;
      } catch {
        // Ignore
      }
    }
    
    return metadata;
  }
  
  /**
   * Recursively read directory files
   */
  private async readDirectoryRecursive(dir: string, basePath: string = ""): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (SKIP_FILES.includes(entry.name)) continue;
        
        const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
        
        if (entry.isDirectory()) {
          if (!SKIP_FOLDERS.includes(entry.name)) {
            const subFiles = await this.readDirectoryRecursive(
              path.join(dir, entry.name),
              relativePath
            );
            files.push(...subFiles);
          }
        } else {
          files.push(relativePath);
        }
      }
    } catch {
      // Directory might not exist
    }
    
    return files;
  }
  
  /**
   * Detect model type from folder name
   */
  private detectModelType(folderName: string): ModuleManifest["modelType"] {
    const name = folderName.toLowerCase();
    if (name.includes("llm") || name.includes("language")) return "llm";
    if (name.includes("cnn") || name.includes("conv")) return "cnn";
    if (name.includes("rnn") || name.includes("lstm") || name.includes("gru")) return "rnn";
    if (name.includes("gan")) return "gan";
    if (name.includes("diffusion") || name.includes("stable")) return "diffusion";
    if (name.includes("multimodal") || name.includes("vision")) return "multimodal";
    return undefined;
  }
  
  /**
   * Format display name from folder name
   */
  private formatDisplayName(folderName: string): string {
    return folderName
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  
  /**
   * Update statistics
   */
  private updateStatistics(): void {
    const modules = Object.values(this.registry.modules);
    
    this.registry.stats = {
      totalModels: modules.filter(m => m.moduleType === "model").length,
      totalDomains: modules.filter(m => m.moduleType === "domain").length,
      enabledModels: this.registry.enabledModels.length,
      enabledDomains: this.registry.enabledDomains.length,
    };
  }
  
  /**
   * Save registry to file
   */
  async saveRegistry(): Promise<void> {
    try {
      await fs.writeFile(
        REGISTRY_FILE,
        JSON.stringify(this.registry, null, 2),
        "utf8"
      );
      console.log(`💾 Unified registry saved to ${REGISTRY_FILE}`);
    } catch (error) {
      console.error("❌ Failed to save registry:", error);
      throw error;
    }
  }
  
  /**
   * Load existing registry
   */
  static async loadRegistry(): Promise<UnifiedRegistry | null> {
    try {
      const content = await fs.readFile(REGISTRY_FILE, "utf8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  
  /**
   * Get registry
   */
  getRegistry(): UnifiedRegistry {
    return this.registry;
  }
}

// ============================================================================
// CLI Runner
// ============================================================================

export async function scanAndUpdateUnifiedRegistry(): Promise<UnifiedRegistry> {
  const scanner = new UnifiedScanner();
  const registry = await scanner.scanAll();
  await scanner.saveRegistry();
  return registry;
}

// ============================================================================
// Runtime API
// ============================================================================

let cachedRegistry: UnifiedRegistry | null = null;

/**
 * Get unified registry (cached)
 */
export async function getUnifiedRegistry(forceRefresh = false): Promise<UnifiedRegistry> {
  if (cachedRegistry && !forceRefresh) {
    return cachedRegistry;
  }
  
  // Try to load from file first
  const existing = await UnifiedScanner.loadRegistry();
  
  if (existing && !forceRefresh) {
    cachedRegistry = existing;
    return existing;
  }
  
  // Scan and rebuild
  const registry = await scanAndUpdateUnifiedRegistry();
  cachedRegistry = registry;
  return registry;
}

/**
 * Get all enabled models
 */
export async function getEnabledModels(): Promise<ModuleManifest[]> {
  const registry = await getUnifiedRegistry();
  return registry.enabledModels
    .map(id => registry.modules[id])
    .filter(Boolean);
}

/**
 * Get all enabled domains
 */
export async function getEnabledDomains(): Promise<ModuleManifest[]> {
  const registry = await getUnifiedRegistry();
  return registry.enabledDomains
    .map(id => registry.modules[id])
    .filter(Boolean);
}

/**
 * Get module by ID (model or domain)
 */
export async function getModule(moduleId: string): Promise<ModuleManifest | null> {
  const registry = await getUnifiedRegistry();
  return registry.modules[moduleId] || null;
}

/**
 * Check if module is enabled
 */
export async function isModuleEnabled(moduleId: string): Promise<boolean> {
  const registry = await getUnifiedRegistry();
  const module = registry.modules[moduleId];
  return module?.enabled || false;
}

/**
 * Get modules by type
 */
export async function getModulesByType(type: ModuleType): Promise<ModuleManifest[]> {
  const registry = await getUnifiedRegistry();
  return Object.values(registry.modules).filter(m => m.moduleType === type);
}

/**
 * Get modules for orchestrator (enabled only, organized by type)
 */
export async function getModulesForOrchestrator(): Promise<{
  models: ModuleManifest[];
  domains: ModuleManifest[];
  stats: UnifiedRegistry["stats"];
}> {
  const registry = await getUnifiedRegistry();
  
  return {
    models: await getEnabledModels(),
    domains: await getEnabledDomains(),
    stats: registry.stats,
  };
}
