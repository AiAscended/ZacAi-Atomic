/**
 * File: src/ai/models/modelRegistry.ts
 * Purpose: Auto-discover and register AI models dynamically
 *
 * Features:
 * - Scans src/ai/models/ for model directories
 * - Validates model structure (seeds, weights, tokenizer, config)
 * - Maintains registry file for fast lookup
 * - Supports hot-reload and plug-and-play
 * - Industry standard: Modular AI architecture with dependency injection
 */

import * as fs from "fs/promises";
import * as path from "path";

// ============================================================================
// Types
// ============================================================================

export interface ModelManifest {
  modelId: string;
  modelType:
    | "llm"
    | "cnn"
    | "rnn"
    | "transformer"
    | "gan"
    | "diffusion"
    | "multimodal"
    | "other";
  version: string;
  displayName: string;
  description: string;
  enabled: boolean;

  // Required structure
  structure: {
    hasSeedsFolder: boolean;
    hasWeightsFolder: boolean;
    hasTokenizerConfig: boolean;
    hasInferenceEngine: boolean;
    hasTrainingPipeline: boolean;
  };

  // File paths (relative to model folder)
  paths: {
    seedsPath?: string;
    pretrainedWeightsPath?: string;
    finetunedWeightsPath?: string;
    tokenizerConfigPath?: string;
    baseTokensPath?: string;
    inferenceEnginePath?: string;
    trainingPipelinePath?: string;
    scriptsPath?: string;
  };

  // Metadata
  metadata: {
    tokensCount?: number;
    hasBaseTokens?: boolean;
    baseTokensCount?: number;
    parametersCount?: string;
    lastUpdated: string;
    discoveredAt: string;
  };
}

export interface ModelRegistry {
  version: string;
  lastScanned: string;
  models: Record<string, ModelManifest>;
  enabledModels: string[];
  totalModels: number;
}

// ============================================================================
// Constants
// ============================================================================

const MODELS_DIR = path.join(process.cwd(), "src", "ai", "models");
const REGISTRY_FILE = path.join(MODELS_DIR, "MODEL_REGISTRY.json");

// Folders to skip during scan
const SKIP_FOLDERS = ["shared", "node_modules", ".git"];

// Required files pattern (flexible matching)
const REQUIRED_PATTERNS = {
  seeds: /seed|vocab/i,
  weights: /weight|checkpoint|pretrained|finetuned/i,
  tokenizer: /tokenizer|token.*config/i,
  inference: /inference.*engine|model.*inference/i,
  training: /training.*pipeline|train/i,
  baseTokens: /base.*token|token.*base/i,
};

// ============================================================================
// Model Scanner
// ============================================================================

export class ModelScanner {
  private registry: ModelRegistry;

  constructor() {
    this.registry = {
      version: "1.0.0",
      lastScanned: new Date().toISOString(),
      models: {},
      enabledModels: [],
      totalModels: 0,
    };
  }

  /**
   * Scan all models in src/ai/models/
   */
  async scanModels(): Promise<ModelRegistry> {
    console.log("🔍 Scanning for AI models...");

    try {
      const entries = await fs.readdir(MODELS_DIR, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory() || SKIP_FOLDERS.includes(entry.name)) {
          continue;
        }

        try {
          const manifest = await this.scanModelDirectory(entry.name);
          if (manifest) {
            this.registry.models[manifest.modelId] = manifest;
            if (manifest.enabled) {
              this.registry.enabledModels.push(manifest.modelId);
            }
          }
        } catch (error) {
          console.warn(`⚠️  Failed to scan model: ${entry.name}`, error);
        }
      }

      this.registry.totalModels = Object.keys(this.registry.models).length;
      this.registry.lastScanned = new Date().toISOString();

      console.log(`✅ Found ${this.registry.totalModels} models`);

      return this.registry;
    } catch (error) {
      console.error("❌ Failed to scan models directory:", error);
      throw error;
    }
  }

  /**
   * Scan individual model directory
   */
  private async scanModelDirectory(
    modelFolderName: string,
  ): Promise<ModelManifest | null> {
    const modelPath = path.join(MODELS_DIR, modelFolderName);

    console.log(`  📦 Scanning: ${modelFolderName}`);

    // Read directory contents
    const files = await this.readDirectoryRecursive(modelPath);

    // Detect model type from folder name
    const modelType = this.detectModelType(modelFolderName);

    // Check structure
    const structure = {
      hasSeedsFolder: files.some(
        (f) => f.includes("seed") || f.includes("vocab"),
      ),
      hasWeightsFolder: files.some((f) => f.includes("weight")),
      hasTokenizerConfig: files.some((f) =>
        REQUIRED_PATTERNS.tokenizer.test(f),
      ),
      hasInferenceEngine: files.some((f) =>
        REQUIRED_PATTERNS.inference.test(f),
      ),
      hasTrainingPipeline: files.some((f) =>
        REQUIRED_PATTERNS.training.test(f),
      ),
    };

    // Build paths
    const paths: ModelManifest["paths"] = {
      seedsPath: files.find((f) => f.includes("seed") && f.endsWith(".json")),
      pretrainedWeightsPath: files.find(
        (f) => f.includes("pretrained") && f.includes("weight"),
      ),
      finetunedWeightsPath: files.find(
        (f) => f.includes("finetuned") && f.includes("weight"),
      ),
      tokenizerConfigPath: files.find(
        (f) => REQUIRED_PATTERNS.tokenizer.test(f) && f.endsWith(".json"),
      ),
      baseTokensPath: files.find(
        (f) => REQUIRED_PATTERNS.baseTokens.test(f) && f.endsWith(".json"),
      ),
      inferenceEnginePath: files.find(
        (f) => REQUIRED_PATTERNS.inference.test(f) && f.endsWith(".ts"),
      ),
      trainingPipelinePath: files.find(
        (f) => REQUIRED_PATTERNS.training.test(f) && f.endsWith(".ts"),
      ),
      scriptsPath: files.find((f) => f.includes("scripts")),
    };

    // Check for base tokens
    const hasBaseTokens = !!paths.baseTokensPath;
    let baseTokensCount = 0;

    if (hasBaseTokens && paths.baseTokensPath) {
      try {
        const baseTokensContent = await fs.readFile(
          path.join(MODELS_DIR, modelFolderName, paths.baseTokensPath),
          "utf8",
        );
        const baseTokens = JSON.parse(baseTokensContent);
        baseTokensCount = Array.isArray(baseTokens)
          ? baseTokens.length
          : Object.keys(baseTokens).length;
      } catch {
        // Ignore parse errors
      }
    }

    // Build manifest
    const manifest: ModelManifest = {
      modelId: modelFolderName,
      modelType,
      version: "1.0.0",
      displayName: this.formatDisplayName(modelFolderName),
      description: `${this.formatDisplayName(modelFolderName)} model`,
      enabled: structure.hasInferenceEngine && structure.hasWeightsFolder,
      structure,
      paths,
      metadata: {
        hasBaseTokens,
        baseTokensCount,
        lastUpdated: new Date().toISOString(),
        discoveredAt: new Date().toISOString(),
      },
    };

    return manifest;
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
        const relativePath = basePath
          ? `${basePath}/${entry.name}`
          : entry.name;

        if (entry.isDirectory()) {
          if (!SKIP_FOLDERS.includes(entry.name)) {
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
    } catch (error) {
      console.warn(`[ModelScanner] Unable to read directory ${dir}`, error)
    }

    return files;
  }

  /**
   * Detect model type from folder name
   */
  private detectModelType(folderName: string): ModelManifest["modelType"] {
    const lower = folderName.toLowerCase();

    if (
      lower.includes("llm") ||
      lower.includes("transformer") ||
      lower.includes("gpt") ||
      lower.includes("bert")
    ) {
      return "llm";
    }
    if (lower.includes("cnn") || lower.includes("convolutional")) {
      return "cnn";
    }
    if (
      lower.includes("rnn") ||
      lower.includes("recurrent") ||
      lower.includes("lstm") ||
      lower.includes("gru")
    ) {
      return "rnn";
    }
    if (lower.includes("gan") || lower.includes("adversarial")) {
      return "gan";
    }
    if (lower.includes("diffusion") || lower.includes("stable")) {
      return "diffusion";
    }
    if (lower.includes("multi-modal") || lower.includes("multimodal")) {
      return "multimodal";
    }

    return "other";
  }

  /**
   * Format display name from folder name
   */
  private formatDisplayName(folderName: string): string {
    return folderName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Save registry to file
   */
  async saveRegistry(): Promise<void> {
    try {
      await fs.writeFile(
        REGISTRY_FILE,
        JSON.stringify(this.registry, null, 2),
        "utf8",
      );
      console.log(`💾 Registry saved to ${REGISTRY_FILE}`);
    } catch (error) {
      console.error("❌ Failed to save registry:", error);
      throw error;
    }
  }

  /**
   * Load existing registry
   */
  static async loadRegistry(): Promise<ModelRegistry | null> {
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
  getRegistry(): ModelRegistry {
    return this.registry;
  }
}

// ============================================================================
// CLI Runner (for scripts)
// ============================================================================

export async function scanAndUpdateRegistry(): Promise<ModelRegistry> {
  const scanner = new ModelScanner();
  const registry = await scanner.scanModels();
  await scanner.saveRegistry();
  return registry;
}

// ============================================================================
// Runtime API
// ============================================================================

let cachedRegistry: ModelRegistry | null = null;

/**
 * Get model registry (cached)
 */
export async function getModelRegistry(
  forceRefresh = false,
): Promise<ModelRegistry> {
  if (cachedRegistry && !forceRefresh) {
    return cachedRegistry;
  }

  // Try to load from file first
  const existing = await ModelScanner.loadRegistry();

  if (existing && !forceRefresh) {
    cachedRegistry = existing;
    return existing;
  }

  // Scan and rebuild
  const registry = await scanAndUpdateRegistry();
  cachedRegistry = registry;
  return registry;
}

/**
 * Get enabled models only
 */
export async function getEnabledModels(): Promise<ModelManifest[]> {
  const registry = await getModelRegistry();
  return registry.enabledModels
    .map((id) => registry.models[id])
    .filter(Boolean);
}

/**
 * Get model by ID
 */
export async function getModel(modelId: string): Promise<ModelManifest | null> {
  const registry = await getModelRegistry();
  return registry.models[modelId] || null;
}

/**
 * Check if model is enabled
 */
export async function isModelEnabled(modelId: string): Promise<boolean> {
  const registry = await getModelRegistry();
  return registry.enabledModels.includes(modelId);
}
