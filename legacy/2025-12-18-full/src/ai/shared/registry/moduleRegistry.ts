/**
 * File: src/ai/shared/registry/moduleRegistry.ts
 * Purpose: Unified registry system for AI models and knowledge domains
 *
 * Architecture:
 * - Generic scanner works for ANY module type (models, domains, plugins, etc.)
 * - Single source of truth pattern
 * - Orchestrator reads from unified registry
 * - Hot-reload and plug-and-play support
 *
 * Benefits:
 * - DRY principle - one system instead of two identical ones
 * - Easier maintenance - update logic in one place
 * - Extensible - easily add new module types (agents, tools, etc.)
 * - Performance - single scan, single cache
 */

import * as fs from "fs/promises";
import * as path from "path";

// ============================================================================
// Generic Types
// ============================================================================

export type ModuleType = "model" | "domain" | "agent" | "tool" | "plugin";

export interface ModuleStructure {
  // Common structure elements
  hasSeedsFolder?: boolean;
  hasWeightsFolder?: boolean;
  hasTokenizer?: boolean;
  hasInference?: boolean;
  hasTraining?: boolean;

  // Model-specific
  hasInferenceEngine?: boolean;
  hasTrainingPipeline?: boolean;

  // Domain-specific
  hasInferenceController?: boolean;
  hasTrainingController?: boolean;
  hasIntegrationAPI?: boolean;
}

export interface ModulePaths {
  // Common paths
  seedsPath?: string;
  seedDataPath?: string;
  seedVocabPath?: string;
  weightsPath?: string;
  pretrainedWeightsPath?: string;
  finetunedWeightsPath?: string;
  trainingWeightsPath?: string;
  learnedDataPath?: string;
  tokenizerPath?: string;
  tokenizerConfigPath?: string;
  baseTokensPath?: string;
  scriptsPath?: string;

  // Model-specific
  inferenceEnginePath?: string;
  trainingPipelinePath?: string;

  // Domain-specific
  inferenceControllerPath?: string;
  trainingControllerPath?: string;
  integrationAPIPath?: string;
}

export interface ModuleMetadata {
  // Common metadata
  lastUpdated: string;
  discoveredAt: string;
  tokensCount?: number;
  hasBaseTokens?: boolean;
  baseTokensCount?: number;

  // Model-specific
  parametersCount?: string;

  // Domain-specific
  seedVocabSize?: number;
  hasLearnedData?: boolean;
  lastTrainingDate?: string;
}

export interface ModuleManifest {
  // Identity
  moduleId: string;
  moduleName: string;
  moduleType: ModuleType;
  version: string;
  description: string;
  enabled: boolean;

  // Structure validation
  structure: ModuleStructure;

  // File paths (relative to module folder)
  paths: ModulePaths;

  // Metadata
  metadata: ModuleMetadata;

  // Optional: Model-specific type
  modelType?:
    | "llm"
    | "cnn"
    | "rnn"
    | "transformer"
    | "gan"
    | "diffusion"
    | "multimodal"
    | "other";
}

export interface ModuleRegistry {
  version: string;
  lastScanned: string;
  moduleType: ModuleType;
  modules: Record<string, ModuleManifest>;
  enabledModules: string[];
  totalModules: number;

  // Quick lookups
  byType?: Record<string, string[]>; // For models: group by modelType
}

// ============================================================================
// Scanner Configuration
// ============================================================================

export interface ScannerConfig {
  // Directory to scan
  scanDir: string;

  // Module type
  moduleType: ModuleType;

  // Output registry file
  registryFile: string;

  // Folders/files to skip
  skipFolders?: string[];
  skipFiles?: string[];

  // Required patterns (regex)
  requiredPatterns?: {
    seeds?: RegExp;
    seedData?: RegExp;
    seedVocab?: RegExp;
    weights?: RegExp;
    pretrained?: RegExp;
    finetuned?: RegExp;
    learnedData?: RegExp;
    trainingWeights?: RegExp;
    tokenizer?: RegExp;
    tokenizerConfig?: RegExp;
    baseTokens?: RegExp;
    inference?: RegExp;
    inferenceEngine?: RegExp;
    inferenceController?: RegExp;
    training?: RegExp;
    trainingPipeline?: RegExp;
    trainingController?: RegExp;
    integrationAPI?: RegExp;
  };

  // Model type detection (for models only)
  modelTypePatterns?: {
    llm?: RegExp;
    cnn?: RegExp;
    rnn?: RegExp;
    transformer?: RegExp;
    gan?: RegExp;
    diffusion?: RegExp;
    multimodal?: RegExp;
  };
}

// ============================================================================
// Unified Module Scanner
// ============================================================================

export class ModuleScanner {
  private config: ScannerConfig;
  private registry: ModuleRegistry;

  constructor(config: ScannerConfig) {
    this.config = {
      skipFolders: ["shared", "node_modules", ".git"],
      skipFiles: [],
      ...config,
    };

    this.registry = {
      version: "1.0.0",
      lastScanned: new Date().toISOString(),
      moduleType: config.moduleType,
      modules: {},
      enabledModules: [],
      totalModules: 0,
      byType: {},
    };
  }

  /**
   * Scan all modules in directory
   */
  async scanModules(): Promise<ModuleRegistry> {
    console.log(
      `🔍 Scanning ${this.config.moduleType}s in ${this.config.scanDir}...`,
    );

    try {
      const entries = await fs.readdir(this.config.scanDir, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (this.config.skipFolders?.includes(entry.name)) continue;

        try {
          const manifest = await this.scanModuleDirectory(entry.name);
          if (manifest) {
            this.registry.modules[manifest.moduleId] = manifest;

            if (manifest.enabled) {
              this.registry.enabledModules.push(manifest.moduleId);
            }

            // Group by model type if applicable
            if (manifest.modelType && this.registry.byType) {
              if (!this.registry.byType[manifest.modelType]) {
                this.registry.byType[manifest.modelType] = [];
              }
              this.registry.byType[manifest.modelType].push(manifest.moduleId);
            }
          }
        } catch (error) {
          console.warn(
            `⚠️  Failed to scan ${this.config.moduleType}: ${entry.name}`,
            error,
          );
        }
      }

      this.registry.totalModules = Object.keys(this.registry.modules).length;
      this.registry.lastScanned = new Date().toISOString();

      console.log(
        `✅ Found ${this.registry.totalModules} ${this.config.moduleType}s`,
      );

      return this.registry;
    } catch (error) {
      console.error(
        `❌ Failed to scan ${this.config.moduleType}s directory:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Scan individual module directory
   */
  private async scanModuleDirectory(
    folderName: string,
  ): Promise<ModuleManifest | null> {
    const modulePath = path.join(this.config.scanDir, folderName);

    console.log(`  📦 Scanning: ${folderName}`);

    // Read directory contents recursively
    const files = await this.readDirectoryRecursive(modulePath);

    // Detect model type (for models only)
    let modelType: ModuleManifest["modelType"] = undefined;
    if (this.config.moduleType === "model" && this.config.modelTypePatterns) {
      modelType = this.detectModelType(folderName, files);
    }

    // Validate structure
    const structure = this.validateStructure(files);

    // Build paths
    const paths = this.buildPaths(files);

    // Gather metadata
    const metadata = await this.gatherMetadata(modulePath, paths);

    // Determine if module should be enabled
    const enabled = this.shouldEnableModule(structure);

    // Build manifest
    const manifest: ModuleManifest = {
      moduleId: folderName,
      moduleName: this.formatModuleName(folderName),
      moduleType: this.config.moduleType,
      version: "1.0.0",
      description: `${this.formatModuleName(folderName)} ${this.config.moduleType}`,
      enabled,
      structure,
      paths,
      metadata,
      modelType,
    };

    return manifest;
  }

  /**
   * Validate module structure
   */
  private validateStructure(files: string[]): ModuleStructure {
    const patterns = this.config.requiredPatterns || {};

    return {
      hasSeedsFolder: files.some(
        (f) => patterns.seeds?.test(f) || patterns.seedData?.test(f),
      ),
      hasWeightsFolder: files.some(
        (f) => patterns.weights?.test(f) || f.includes("weight"),
      ),
      hasTokenizer: files.some(
        (f) => patterns.tokenizer?.test(f) || patterns.tokenizerConfig?.test(f),
      ),
      hasInference: files.some((f) => patterns.inference?.test(f)),
      hasTraining: files.some((f) => patterns.training?.test(f)),

      // Model-specific
      hasInferenceEngine: files.some((f) => patterns.inferenceEngine?.test(f)),
      hasTrainingPipeline: files.some((f) =>
        patterns.trainingPipeline?.test(f),
      ),

      // Domain-specific
      hasInferenceController: files.some((f) =>
        patterns.inferenceController?.test(f),
      ),
      hasTrainingController: files.some((f) =>
        patterns.trainingController?.test(f),
      ),
      hasIntegrationAPI: files.some((f) => patterns.integrationAPI?.test(f)),
    };
  }

  /**
   * Build file paths
   */
  private buildPaths(files: string[]): ModulePaths {
    const patterns = this.config.requiredPatterns || {};

    return {
      seedsPath: files.find((f) => f === "seeds" || f.startsWith("seeds/")),
      seedDataPath: files.find((f) => patterns.seedData?.test(f)),
      seedVocabPath: files.find((f) => patterns.seedVocab?.test(f)),
      weightsPath: files.find(
        (f) => f === "weights" || f.startsWith("weights/"),
      ),
      pretrainedWeightsPath: files.find(
        (f) => patterns.pretrained?.test(f) && f.includes("weight"),
      ),
      finetunedWeightsPath: files.find(
        (f) => patterns.finetuned?.test(f) && f.includes("weight"),
      ),
      trainingWeightsPath: files.find((f) => patterns.trainingWeights?.test(f)),
      learnedDataPath: files.find((f) => patterns.learnedData?.test(f)),
      tokenizerPath: files.find(
        (f) => patterns.tokenizer?.test(f) && f.endsWith(".ts"),
      ),
      tokenizerConfigPath: files.find((f) => patterns.tokenizerConfig?.test(f)),
      baseTokensPath: files.find((f) => patterns.baseTokens?.test(f)),
      scriptsPath: files.find(
        (f) => f === "scripts" || f.startsWith("scripts/"),
      ),

      // Model-specific
      inferenceEnginePath: files.find((f) => patterns.inferenceEngine?.test(f)),
      trainingPipelinePath: files.find((f) =>
        patterns.trainingPipeline?.test(f),
      ),

      // Domain-specific
      inferenceControllerPath: files.find((f) =>
        patterns.inferenceController?.test(f),
      ),
      trainingControllerPath: files.find((f) =>
        patterns.trainingController?.test(f),
      ),
      integrationAPIPath: files.find((f) => patterns.integrationAPI?.test(f)),
    };
  }

  /**
   * Gather metadata
   */
  private async gatherMetadata(
    modulePath: string,
    paths: ModulePaths,
  ): Promise<ModuleMetadata> {
    const metadata: ModuleMetadata = {
      lastUpdated: new Date().toISOString(),
      discoveredAt: new Date().toISOString(),
    };

    // Count base tokens
    if (paths.baseTokensPath) {
      try {
        const tokensPath = path.join(modulePath, paths.baseTokensPath);
        const content = await fs.readFile(tokensPath, "utf8");
        const tokens = JSON.parse(content);
        metadata.baseTokensCount = Array.isArray(tokens)
          ? tokens.length
          : Object.keys(tokens).length;
        metadata.hasBaseTokens = true;
      } catch {
        // Ignore
      }
    }

    // Count seed vocabulary
    if (paths.seedVocabPath) {
      try {
        const vocabPath = path.join(modulePath, paths.seedVocabPath);
        const content = await fs.readFile(vocabPath, "utf8");
        const vocab = JSON.parse(content);
        metadata.seedVocabSize = Array.isArray(vocab)
          ? vocab.length
          : Object.keys(vocab).length;
      } catch {
        // Ignore
      }
    }

    // Check for learned data
    metadata.hasLearnedData = !!paths.learnedDataPath;

    return metadata;
  }

  /**
   * Determine if module should be enabled
   */
  private shouldEnableModule(structure: ModuleStructure): boolean {
    if (this.config.moduleType === "model") {
      // Models need inference engine
      return !!(
        structure.hasInferenceEngine &&
        structure.hasSeedsFolder &&
        structure.hasWeightsFolder
      );
    } else if (this.config.moduleType === "domain") {
      // Domains need inference controller and integration API
      return !!(
        structure.hasInferenceController && structure.hasIntegrationAPI
      );
    }

    // Default: enable if has basic structure
    return !!(structure.hasSeedsFolder || structure.hasInference);
  }

  /**
   * Detect model type from folder name and files
   */
  private detectModelType(
    folderName: string,
    files: string[],
  ): ModuleManifest["modelType"] {
    const patterns = this.config.modelTypePatterns;
    if (!patterns) return "other";

    const name = folderName.toLowerCase();
    const allFiles = files.join(" ").toLowerCase();

    if (patterns.llm?.test(name) || patterns.llm?.test(allFiles)) return "llm";
    if (patterns.cnn?.test(name) || patterns.cnn?.test(allFiles)) return "cnn";
    if (patterns.rnn?.test(name) || patterns.rnn?.test(allFiles)) return "rnn";
    if (
      patterns.transformer?.test(name) ||
      patterns.transformer?.test(allFiles)
    )
      return "transformer";
    if (patterns.gan?.test(name) || patterns.gan?.test(allFiles)) return "gan";
    if (patterns.diffusion?.test(name) || patterns.diffusion?.test(allFiles))
      return "diffusion";
    if (patterns.multimodal?.test(name) || patterns.multimodal?.test(allFiles))
      return "multimodal";

    return "other";
  }

  /**
   * Recursively read directory files
   */
  private async readDirectoryRecursive(
    dir: string,
    basePath: string = "",
  ): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (this.config.skipFiles?.includes(entry.name)) continue;

        const relativePath = basePath
          ? `${basePath}/${entry.name}`
          : entry.name;

        if (entry.isDirectory()) {
          if (!this.config.skipFolders?.includes(entry.name)) {
            const subFiles = await this.readDirectoryRecursive(
              path.join(dir, entry.name),
              relativePath,
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
   * Format display name from folder name
   */
  private formatModuleName(folderName: string): string {
    return folderName
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Save registry to file
   */
  async saveRegistry(): Promise<void> {
    try {
      await fs.writeFile(
        this.config.registryFile,
        JSON.stringify(this.registry, null, 2),
        "utf8",
      );
      console.log(`💾 Registry saved to ${this.config.registryFile}`);
    } catch (error) {
      console.error("❌ Failed to save registry:", error);
      throw error;
    }
  }

  /**
   * Load existing registry
   */
  async loadRegistry(): Promise<ModuleRegistry | null> {
    try {
      const content = await fs.readFile(this.config.registryFile, "utf8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Get registry
   */
  getRegistry(): ModuleRegistry {
    return this.registry;
  }
}

// ============================================================================
// Registry Cache & Runtime API
// ============================================================================

const registryCache = new Map<string, ModuleRegistry>();

export async function getRegistry(
  config: ScannerConfig,
  forceRefresh = false,
): Promise<ModuleRegistry> {
  const cacheKey = `${config.moduleType}:${config.scanDir}`;

  if (registryCache.has(cacheKey) && !forceRefresh) {
    return registryCache.get(cacheKey)!;
  }

  const scanner = new ModuleScanner(config);
  const existing = await scanner.loadRegistry();

  if (existing && !forceRefresh) {
    registryCache.set(cacheKey, existing);
    return existing;
  }

  const registry = await scanner.scanModules();
  await scanner.saveRegistry();
  registryCache.set(cacheKey, registry);

  return registry;
}

export async function scanAndUpdate(
  config: ScannerConfig,
): Promise<ModuleRegistry> {
  const scanner = new ModuleScanner(config);
  const registry = await scanner.scanModules();
  await scanner.saveRegistry();
  return registry;
}
