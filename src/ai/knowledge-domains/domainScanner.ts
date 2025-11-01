/**
 * File: src/ai/knowledge-domains/domainScanner.ts
 * Purpose: Auto-discover and register knowledge domains dynamically
 * 
 * Features:
 * - Scans src/ai/knowledge-domains/ for domain directories
 * - Validates domain structure (seeds, weights, inference, training, integrationAPI)
 * - Maintains registry for fast lookup
 * - Supports hot-reload and plug-and-play
 * - Industry standard: Domain-driven design with modular knowledge bases
 */

import * as fs from "fs/promises";
import * as path from "path";

// ============================================================================
// Types
// ============================================================================

export interface DomainManifest {
  domainId: string;
  domainName: string;
  version: string;
  description: string;
  enabled: boolean;
  
  // Required structure
  structure: {
    hasSeedsFolder: boolean;
    hasWeightsFolder: boolean;
    hasInferenceController: boolean;
    hasTrainingController: boolean;
    hasIntegrationAPI: boolean;
    hasTokenizer: boolean;
  };
  
  // File paths (relative to domain folder)
  paths: {
    seedDataPath?: string;
    seedVocabPath?: string;
    pretrainedWeightsPath?: string;
    learnedDataPath?: string;
    trainingWeightsPath?: string;
    inferenceControllerPath?: string;
    trainingControllerPath?: string;
    integrationAPIPath?: string;
    tokenizerPath?: string;
    scriptsPath?: string;
  };
  
  // Metadata
  metadata: {
    seedVocabSize?: number;
    hasLearnedData?: boolean;
    lastTrainingDate?: string;
    lastUpdated: string;
    discoveredAt: string;
  };
}

export interface DomainRegistry {
  version: string;
  lastScanned: string;
  domains: Record<string, DomainManifest>;
  enabledDomains: string[];
  totalDomains: number;
}

// ============================================================================
// Constants
// ============================================================================

const DOMAINS_DIR = path.join(process.cwd(), "src", "ai", "knowledge-domains");
const REGISTRY_FILE = path.join(DOMAINS_DIR, "DOMAIN_REGISTRY.json");

// Folders to skip during scan
const SKIP_FOLDERS = ["shared", "node_modules", ".git"];
const SKIP_FILES = ["registry.ts", "registerAllDomains.ts", "domainScanner.ts", "DOMAIN_REGISTRY.json"];

// Required files pattern (flexible matching)
const REQUIRED_PATTERNS = {
  seedData: /seed.*data\.json/i,
  seedVocab: /seed.*vocab\.json/i,
  weights: /weight|pretrained/i,
  learnedData: /learned.*data\.json/i,
  trainingWeights: /training.*weight/i,
  inferenceController: /inference.*controller\.ts/i,
  trainingController: /training.*controller\.ts/i,
  integrationAPI: /.*integration.*api\.ts/i,
  tokenizer: /tokenizer\.ts/i,
};

// ============================================================================
// Domain Scanner
// ============================================================================

export class DomainScanner {
  private registry: DomainRegistry;
  
  constructor() {
    this.registry = {
      version: "1.0.0",
      lastScanned: new Date().toISOString(),
      domains: {},
      enabledDomains: [],
      totalDomains: 0,
    };
  }
  
  /**
   * Scan all domains in src/ai/knowledge-domains/
   */
  async scanDomains(): Promise<DomainRegistry> {
    console.log("🔍 Scanning for knowledge domains...");
    
    try {
      const entries = await fs.readdir(DOMAINS_DIR, { withFileTypes: true });
      
      for (const entry of entries) {
        if (!entry.isDirectory() || SKIP_FOLDERS.includes(entry.name)) {
          continue;
        }
        
        try {
          const manifest = await this.scanDomainDirectory(entry.name);
          if (manifest) {
            this.registry.domains[manifest.domainId] = manifest;
            if (manifest.enabled) {
              this.registry.enabledDomains.push(manifest.domainId);
            }
          }
        } catch (error) {
          console.warn(`⚠️  Failed to scan domain: ${entry.name}`, error);
        }
      }
      
      this.registry.totalDomains = Object.keys(this.registry.domains).length;
      this.registry.lastScanned = new Date().toISOString();
      
      console.log(`✅ Found ${this.registry.totalDomains} domains`);
      
      return this.registry;
    } catch (error) {
      console.error("❌ Failed to scan domains directory:", error);
      throw error;
    }
  }
  
  /**
   * Scan individual domain directory
   */
  private async scanDomainDirectory(domainFolderName: string): Promise<DomainManifest | null> {
    const domainPath = path.join(DOMAINS_DIR, domainFolderName);
    
    console.log(`  📦 Scanning: ${domainFolderName}`);
    
    // Read directory contents
    const files = await this.readDirectoryRecursive(domainPath);
    
    // Check structure
    const structure = {
      hasSeedsFolder: files.some(f => f.includes("seed")),
      hasWeightsFolder: files.some(f => f.includes("weight")),
      hasInferenceController: files.some(f => REQUIRED_PATTERNS.inferenceController.test(f)),
      hasTrainingController: files.some(f => REQUIRED_PATTERNS.trainingController.test(f)),
      hasIntegrationAPI: files.some(f => REQUIRED_PATTERNS.integrationAPI.test(f)),
      hasTokenizer: files.some(f => REQUIRED_PATTERNS.tokenizer.test(f)),
    };
    
    // Build paths
    const paths: DomainManifest["paths"] = {
      seedDataPath: files.find(f => REQUIRED_PATTERNS.seedData.test(f)),
      seedVocabPath: files.find(f => REQUIRED_PATTERNS.seedVocab.test(f)),
      pretrainedWeightsPath: files.find(f => f.includes("pretrained") && f.includes("weight")),
      learnedDataPath: files.find(f => REQUIRED_PATTERNS.learnedData.test(f)),
      trainingWeightsPath: files.find(f => REQUIRED_PATTERNS.trainingWeights.test(f)),
      inferenceControllerPath: files.find(f => REQUIRED_PATTERNS.inferenceController.test(f)),
      trainingControllerPath: files.find(f => REQUIRED_PATTERNS.trainingController.test(f)),
      integrationAPIPath: files.find(f => REQUIRED_PATTERNS.integrationAPI.test(f)),
      tokenizerPath: files.find(f => REQUIRED_PATTERNS.tokenizer.test(f)),
      scriptsPath: files.find(f => f.includes("scripts")),
    };
    
    // Load seed vocab size
    let seedVocabSize = 0;
    if (paths.seedVocabPath) {
      try {
        const vocabContent = await fs.readFile(
          path.join(DOMAINS_DIR, domainFolderName, paths.seedVocabPath),
          "utf8"
        );
        const vocab = JSON.parse(vocabContent);
        seedVocabSize = Array.isArray(vocab) ? vocab.length : Object.keys(vocab).length;
      } catch {
        // Ignore parse errors
      }
    }
    
    // Build manifest
    const manifest: DomainManifest = {
      domainId: domainFolderName,
      domainName: this.formatDomainName(domainFolderName),
      version: "1.0.0",
      description: `${this.formatDomainName(domainFolderName)} knowledge domain`,
      enabled: structure.hasInferenceController && structure.hasIntegrationAPI,
      structure,
      paths,
      metadata: {
        seedVocabSize,
        hasLearnedData: !!paths.learnedDataPath,
        lastUpdated: new Date().toISOString(),
        discoveredAt: new Date().toISOString(),
      },
    };
    
    return manifest;
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
    } catch (error) {
      // Directory might not exist
    }
    
    return files;
  }
  
  /**
   * Format display name from folder name
   */
  private formatDomainName(folderName: string): string {
    return folderName
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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
        "utf8"
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
  static async loadRegistry(): Promise<DomainRegistry | null> {
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
  getRegistry(): DomainRegistry {
    return this.registry;
  }
}

// ============================================================================
// CLI Runner (for scripts)
// ============================================================================

export async function scanAndUpdateDomainRegistry(): Promise<DomainRegistry> {
  const scanner = new DomainScanner();
  const registry = await scanner.scanDomains();
  await scanner.saveRegistry();
  return registry;
}

// ============================================================================
// Runtime API
// ============================================================================

let cachedRegistry: DomainRegistry | null = null;

/**
 * Get domain registry (cached)
 */
export async function getDomainRegistry(forceRefresh = false): Promise<DomainRegistry> {
  if (cachedRegistry && !forceRefresh) {
    return cachedRegistry;
  }
  
  // Try to load from file first
  const existing = await DomainScanner.loadRegistry();
  
  if (existing && !forceRefresh) {
    cachedRegistry = existing;
    return existing;
  }
  
  // Scan and rebuild
  const registry = await scanAndUpdateDomainRegistry();
  cachedRegistry = registry;
  return registry;
}

/**
 * Get enabled domains only
 */
export async function getEnabledDomains(): Promise<DomainManifest[]> {
  const registry = await getDomainRegistry();
  return registry.enabledDomains.map(id => registry.domains[id]).filter(Boolean);
}

/**
 * Get domain by ID
 */
export async function getDomainManifest(domainId: string): Promise<DomainManifest | null> {
  const registry = await getDomainRegistry();
  return registry.domains[domainId] || null;
}

/**
 * Check if domain is enabled
 */
export async function isDomainEnabled(domainId: string): Promise<boolean> {
  const registry = await getDomainRegistry();
  return registry.enabledDomains.includes(domainId);
}
