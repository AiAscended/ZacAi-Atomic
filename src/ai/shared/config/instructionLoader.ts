/**
 * File: src/ai/shared/config/instructionLoader.ts
 * Purpose: Load and parse domain/model/orchestrator instruction files
 *
 * Supports: YAML, JSON, XML
 * Used by: Inference engines, tokenizers, training pipelines, orchestrator
 */

import * as fs from "fs/promises";
import * as path from "path";
import * as yaml from "yaml";

// ============================================================================
// Types
// ============================================================================

export interface InstructionSet {
  domain?: {
    id: string;
    name: string;
    version: string;
    description: string;
  };
  system?: {
    id: string;
    name: string;
    version: string;
    description: string;
  };
  principles?: Array<{
    name: string;
    rule: string;
    priority: number;
  }>;
  tools?: Record<string, unknown>;
  inference?: Record<string, unknown>;
  training?: Record<string, unknown>;
  pipeline?: Record<string, unknown>;
  tokenizer?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface URLConfig {
  domainId: string;
  domainName: string;
  sources: Array<{
    name: string;
    url: string;
    enabled: boolean;
    priority: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface BaseTokens {
  version: string;
  description: string;
  totalTokens: number;
  categories: Record<string, unknown>;
  [key: string]: unknown;
}

// ============================================================================
// Instruction Loader
// ============================================================================

export class InstructionLoader {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private cacheTTL = 300000; // 5 minutes

  /**
   * Load domain instructions (YAML)
   */
  async loadDomainInstructions(
    domainId: string,
  ): Promise<InstructionSet | null> {
    const filePath = path.join(
      process.cwd(),
      "src",
      "ai",
      "knowledge-domains",
      domainId,
      "domain-instructions.yaml",
    );

    return await this.loadYAML<InstructionSet>(filePath);
  }

  /**
   * Load domain URL configuration (JSON)
   */
  async loadURLConfig(domainId: string): Promise<URLConfig | null> {
    const filePath = path.join(
      process.cwd(),
      "src",
      "ai",
      "knowledge-domains",
      domainId,
      "url-lookup.json",
    );

    return await this.loadJSON<URLConfig>(filePath);
  }

  /**
   * Load model instructions (YAML)
   */
  async loadModelInstructions(modelId: string): Promise<InstructionSet | null> {
    const filePath = path.join(
      process.cwd(),
      "src",
      "ai",
      "models",
      modelId,
      "model-instructions.yaml",
    );

    return await this.loadYAML<InstructionSet>(filePath);
  }

  /**
   * Load orchestrator system instructions (YAML)
   */
  async loadSystemInstructions(): Promise<InstructionSet | null> {
    const filePath = path.join(
      process.cwd(),
      "src",
      "ai",
      "orchestration",
      "system-instructions.yaml",
    );

    return await this.loadYAML<InstructionSet>(filePath);
  }

  /**
   * Load orchestrator base tokens (JSON)
   */
  async loadSystemTokens(): Promise<BaseTokens | null> {
    const filePath = path.join(
      process.cwd(),
      "src",
      "ai",
      "orchestration",
      "system-base-tokens.json",
    );

    return await this.loadJSON<BaseTokens>(filePath);
  }

  /**
   * Load custom uploaded instructions (any format)
   */
  async loadCustomInstructions(
    moduleType: "domain" | "model" | "orchestrator",
    moduleId: string,
    filename: string,
  ): Promise<unknown | null> {
    const baseDir =
      moduleType === "domain"
        ? "knowledge-domains"
        : moduleType === "model"
          ? "models"
          : "orchestration";

    const filePath = path.join(
      process.cwd(),
      "src",
      "ai",
      baseDir,
      moduleType === "orchestrator" ? "" : moduleId,
      filename,
    );

    // Determine format from extension
    const ext = path.extname(filename).toLowerCase();

    switch (ext) {
      case ".yaml":
      case ".yml":
        return await this.loadYAML(filePath);
      case ".json":
        return await this.loadJSON(filePath);
      case ".xml":
        return await this.loadXML(filePath);
      default:
        return await this.loadText(filePath);
    }
  }

  /**
   * Load YAML file
   */
  private async loadYAML<T = unknown>(filePath: string): Promise<T | null> {
    // Check cache first
    const cached = this.getFromCache(filePath);
    if (cached) return cached as T;

    try {
      const content = await fs.readFile(filePath, "utf8");
      const data = yaml.parse(content);

      // Add to cache
      this.addToCache(filePath, data);

      return data as T;
    } catch (error) {
      console.warn(`Failed to load YAML file: ${filePath}`, error);
      return null;
    }
  }

  /**
   * Load JSON file
   */
  private async loadJSON<T = unknown>(filePath: string): Promise<T | null> {
    // Check cache first
    const cached = this.getFromCache(filePath);
    if (cached) return cached as T;

    try {
      const content = await fs.readFile(filePath, "utf8");
      const data = JSON.parse(content);

      // Add to cache
      this.addToCache(filePath, data);

      return data as T;
    } catch (error) {
      console.warn(`Failed to load JSON file: ${filePath}`, error);
      return null;
    }
  }

  /**
   * Load XML file (basic parsing)
   */
  private async loadXML(filePath: string): Promise<unknown | null> {
    // Check cache first
    const cached = this.getFromCache(filePath);
    if (cached) return cached;

    try {
      const content = await fs.readFile(filePath, "utf8");

      // Basic XML to JSON conversion (simplified)
      // For production, use a proper XML parser like 'fast-xml-parser'
      const data = { raw: content };

      // Add to cache
      this.addToCache(filePath, data);

      return data;
    } catch (error) {
      console.warn(`Failed to load XML file: ${filePath}`, error);
      return null;
    }
  }

  /**
   * Load text file
   */
  private async loadText(filePath: string): Promise<string | null> {
    try {
      return await fs.readFile(filePath, "utf8");
    } catch (error) {
      console.warn(`Failed to load text file: ${filePath}`, error);
      return null;
    }
  }

  /**
   * Get from cache
   */
  private getFromCache(key: string): unknown | null {
    const cached = this.cache.get(key);

    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Add to cache
   */
  private addToCache(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get instruction field (helper)
   */
  getInstructionField(
    instructions: InstructionSet,
    fieldPath: string,
  ): unknown {
    const parts = fieldPath.split(".");
    let current: unknown = instructions;

    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return null;
      }
    }

    return current;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let loaderInstance: InstructionLoader | null = null;

export function getInstructionLoader(): InstructionLoader {
  if (!loaderInstance) {
    loaderInstance = new InstructionLoader();
  }
  return loaderInstance;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Load all instructions for a domain
 */
export async function loadDomainConfig(domainId: string): Promise<{
  instructions: InstructionSet | null;
  urlConfig: URLConfig | null;
}> {
  const loader = getInstructionLoader();

  return {
    instructions: await loader.loadDomainInstructions(domainId),
    urlConfig: await loader.loadURLConfig(domainId),
  };
}

/**
 * Load all instructions for orchestrator
 */
export async function loadOrchestratorConfig(): Promise<{
  instructions: InstructionSet | null;
  tokens: BaseTokens | null;
}> {
  const loader = getInstructionLoader();

  return {
    instructions: await loader.loadSystemInstructions(),
    tokens: await loader.loadSystemTokens(),
  };
}
