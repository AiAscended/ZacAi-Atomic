/**
 * File: src/ai/data/domainRegistry.ts
 * Purpose: Dynamic domain discovery and registration with atomic hierarchy metadata
 * Depends on: All domain integrationAPI files
 * Depended on by: src/ai/orchestration/aiOrchestrator.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { EventEmitter } from "events"

/**
 * Atomic hierarchy levels for modules
 */
export type AtomicLevel = "atom" | "molecule" | "cell" | "organ" | "organism"

/**
 * Module metadata describing its role and atomic level
 */
export interface ModuleMetadata {
  name: string
  atomicLevel: AtomicLevel
  category: string
  dependencies: string[]
  capabilities: string[]
  version: string
}

/**
 * Domain metadata with all its modules
 */
export interface DomainMetadata {
  name: string
  displayName: string
  description: string
  atomicLevel: AtomicLevel
  modules: ModuleMetadata[]
  seedDataPath: string
  learnedDataPath: string
  weightsPath: string
  enabled: boolean
}

/**
 * Central registry for all knowledge domains with dynamic discovery
 */
export class DomainRegistry extends EventEmitter {
  private domains: Map<string, DomainMetadata> = new Map()
  private moduleIndex: Map<string, ModuleMetadata> = new Map()

  /**
   * Register a new domain with its metadata
   */
  registerDomain(metadata: DomainMetadata): void {
    this.domains.set(metadata.name, metadata)

    // Index all modules for quick lookup
    for (const module of metadata.modules) {
      this.moduleIndex.set(`${metadata.name}:${module.name}`, module)
    }

    this.emit("domain:registered", metadata)
  }

  /**
   * Get all registered domains
   */
  getAllDomains(): DomainMetadata[] {
    return Array.from(this.domains.values()).filter((d) => d.enabled)
  }

  /**
   * Get domain by name
   */
  getDomain(name: string): DomainMetadata | undefined {
    return this.domains.get(name)
  }

  /**
   * Get all modules at a specific atomic level
   */
  getModulesByLevel(level: AtomicLevel): ModuleMetadata[] {
    return Array.from(this.moduleIndex.values()).filter((m) => m.atomicLevel === level)
  }

  /**
   * Get modules by category
   */
  getModulesByCategory(category: string): ModuleMetadata[] {
    return Array.from(this.moduleIndex.values()).filter((m) => m.category === category)
  }

  /**
   * Resolve module dependencies
   */
  resolveDependencies(moduleName: string): ModuleMetadata[] {
    const module = Array.from(this.moduleIndex.values()).find((m) => m.name === moduleName)
    if (!module) return []

    const resolved: ModuleMetadata[] = []
    const visited = new Set<string>()

    const resolve = (deps: string[]) => {
      for (const dep of deps) {
        if (visited.has(dep)) continue
        visited.add(dep)

        const depModule = Array.from(this.moduleIndex.values()).find((m) => m.name === dep)
        if (depModule) {
          resolved.push(depModule)
          resolve(depModule.dependencies)
        }
      }
    }

    resolve(module.dependencies)
    return resolved
  }

  /**
   * Enable or disable a domain
   */
  setDomainEnabled(name: string, enabled: boolean): void {
    const domain = this.domains.get(name)
    if (domain) {
      domain.enabled = enabled
      this.emit("domain:status_changed", { name, enabled })
    }
  }

  /**
   * Get system statistics
   */
  getStats() {
    const domains = this.getAllDomains()
    const modulesByLevel = {
      atom: this.getModulesByLevel("atom").length,
      molecule: this.getModulesByLevel("molecule").length,
      cell: this.getModulesByLevel("cell").length,
      organ: this.getModulesByLevel("organ").length,
      organism: this.getModulesByLevel("organism").length,
    }

    return {
      totalDomains: domains.length,
      totalModules: this.moduleIndex.size,
      modulesByLevel,
      enabledDomains: domains.filter((d) => d.enabled).length,
    }
  }
}

// Singleton instance
export const domainRegistry = new DomainRegistry()
