/**
 * File: src/ai/data/domainRegistry.ts
 * Purpose: Dynamic domain discovery and registration with atomic hierarchy metadata
 * Depends on: All domain integrationAPI files
 * Depended on by: src/ai/orchestration/aiOrchestrator.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { EventEmitter } from "events";

/**
 * Atomic hierarchy levels for modules
 */
export type AtomicLevel = "atom" | "molecule" | "cell" | "organ" | "organism";

/**
 * Module metadata describing its role and atomic level
 */
export interface ModuleMetadata {
  name: string;
  atomicLevel: AtomicLevel;
  category: string;
  dependencies: string[];
  capabilities: string[];
  version: string;
}

/**
 * Domain metadata with all its modules
 */
export interface DomainMetadata {
  name: string;
  displayName: string;
  description: string;
  atomicLevel: AtomicLevel;
  modules: ModuleMetadata[];
  seedDataPath: string;
  learnedDataPath: string;
  weightsPath: string;
  enabled: boolean;
}

/**
 * Central registry for all knowledge domains with dynamic discovery
 */
export class DomainRegistry extends EventEmitter {
  private domains: Map<string, DomainMetadata> = new Map();
  private moduleIndex: Map<string, ModuleMetadata> = new Map();

  /**
   * Register a new domain with its metadata
   */
  registerDomain(metadata: DomainMetadata): void {
    this.domains.set(metadata.name, metadata);

    // Index all modules for quick lookup
    for (const moduleItem of metadata.modules) {
      this.moduleIndex.set(`${metadata.name}:${moduleItem.name}`, moduleItem);
    }

    this.emit("domain:registered", metadata);
  }

  /**
   * Get all registered domains
   */
  getAllDomains(): DomainMetadata[] {
    return Array.from(this.domains.values()).filter((d) => d.enabled);
  }

  /**
   * Get domain by name
   */
  getDomain(name: string): DomainMetadata | undefined {
    return this.domains.get(name);
  }

  /**
   * Get all modules at a specific atomic level
   */
  getModulesByLevel(level: AtomicLevel): ModuleMetadata[] {
    return Array.from(this.moduleIndex.values()).filter(
      (m) => m.atomicLevel === level,
    );
  }

  /**
   * Get modules by category
   */
  getModulesByCategory(category: string): ModuleMetadata[] {
    return Array.from(this.moduleIndex.values()).filter(
      (m) => m.category === category,
    );
  }

  /**
   * Resolve module dependencies
   */
  resolveDependencies(moduleName: string): ModuleMetadata[] {
    const moduleItem = Array.from(this.moduleIndex.values()).find(
      (m) => m.name === moduleName,
    );
    if (!moduleItem) return [];

    const resolved: ModuleMetadata[] = [];
    const visited = new Set<string>();

    const resolve = (deps: string[]) => {
      for (const dep of deps) {
        if (visited.has(dep)) continue;
        visited.add(dep);

        const depModule = Array.from(this.moduleIndex.values()).find(
          (m) => m.name === dep,
        );
        if (depModule) {
          resolved.push(depModule);
          resolve(depModule.dependencies);
        }
      }
    };

    resolve(moduleItem.dependencies);
    return resolved;
  }

  /**
   * Enable or disable a domain
   */
  setDomainEnabled(name: string, enabled: boolean): void {
    const domain = this.domains.get(name);
    if (domain) {
      domain.enabled = enabled;
      this.emit("domain:status_changed", { name, enabled });
    }
  }

  /**
   * Get system statistics
   */
  getStats() {
    const domains = this.getAllDomains();
    const modulesByLevel = {
      atom: this.getModulesByLevel("atom").length,
      molecule: this.getModulesByLevel("molecule").length,
      cell: this.getModulesByLevel("cell").length,
      organ: this.getModulesByLevel("organ").length,
      organism: this.getModulesByLevel("organism").length,
    };

    return {
      totalDomains: domains.length,
      totalModules: this.moduleIndex.size,
      modulesByLevel,
      enabledDomains: domains.filter((d) => d.enabled).length,
    };
  }

  /**
   * Synchronize registry with unified module registry
   */
  async synchronizeWithUnifiedRegistry(force = false): Promise<void> {
    if (this.syncing && !force) {
      return this.syncing
    }

    this.syncing = this.performSync(force)

    try {
      await this.syncing
    } finally {
      this.syncing = null
    }
  }

  private async performSync(force: boolean): Promise<void> {
    const registry = await getUnifiedRegistry(force)
    const newBaseDomains = new Map<string, DomainMetadata>()

    for (const manifest of Object.values(registry.modules)) {
      if (manifest.moduleType !== "domain") continue
      const baseMetadata = manifestToDomainMetadata(manifest)
      newBaseDomains.set(baseMetadata.name, baseMetadata)
    }

    this.baseDomains = newBaseDomains
    this.domains.clear()
    this.moduleIndex.clear()

    for (const domainName of this.baseDomains.keys()) {
      this.applyMergedDomain(domainName)
    }

    for (const overrideName of this.overrides.keys()) {
      if (!this.baseDomains.has(overrideName)) {
        this.applyMergedDomain(overrideName)
      }
    }

  }

  private applyMergedDomain(domainName: string): void {
    const merged = this.mergeMetadata(
      this.baseDomains.get(domainName),
      this.overrides.get(domainName)
    )

    if (!merged) return

    this.domains.set(domainName, merged)
    this.reindexDomainModules(domainName, merged.modules)
  }

  private mergeMetadata(base?: DomainMetadata, override?: DomainMetadata): DomainMetadata | null {
    const source = base || override
    if (!source) return null

    const merged: DomainMetadata = {
      name: override?.name ?? base?.name ?? source.name,
      displayName: override?.displayName ?? base?.displayName ?? source.displayName,
      description: override?.description ?? base?.description ?? source.description,
      atomicLevel: override?.atomicLevel ?? base?.atomicLevel ?? source.atomicLevel,
      modules: override?.modules ?? base?.modules ?? source.modules,
      seedDataPath: override?.seedDataPath ?? base?.seedDataPath ?? source.seedDataPath,
      learnedDataPath:
        override?.learnedDataPath ?? base?.learnedDataPath ?? source.learnedDataPath,
      weightsPath: override?.weightsPath ?? base?.weightsPath ?? source.weightsPath,
      enabled: override?.enabled ?? base?.enabled ?? source.enabled,
    }

    return merged
  }

  private reindexDomainModules(domainName: string, modules: ModuleMetadata[]): void {
    for (const key of Array.from(this.moduleIndex.keys())) {
      if (key.startsWith(`${domainName}:`)) {
        this.moduleIndex.delete(key)
      }
    }

    for (const domainModule of modules) {
      this.moduleIndex.set(`${domainName}:${domainModule.name}`, domainModule)
    }
  }
}

// Singleton instance - the ONLY registry in the system
export const domainRegistry = new DomainRegistry();
