/**
 * File: src/ai/data/previewDataRegistry.ts
 * Purpose: Preview-compatible domain registry that embeds domain data instead of loading from fs
 * Depends on: Domain integration APIs
 * Depended on by: aiOrchestrator.ts (in preview mode)
 * Creator: Vercel v0 Coding Assistant
 */

import type { DomainAPI } from "./domainRegistry"

/**
 * Preview-compatible domain registry
 * Embeds domain configurations directly instead of loading from file system
 */
class PreviewDataRegistry {
  private domains: Map<string, DomainAPI> = new Map()
  private initialized = false

  /**
   * Initialize all domains with embedded configurations
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("[v0] Initializing preview data registry...")

    // Register all 16 knowledge domains with embedded data
    const domainConfigs = [
      { name: "english", keywords: ["grammar", "spelling", "language", "word", "sentence"] },
      { name: "mathematics", keywords: ["math", "calculate", "number", "equation", "solve"] },
      { name: "typescript", keywords: ["code", "typescript", "javascript", "function", "class"] },
      { name: "general", keywords: ["general", "help", "what", "how", "why"] },
      { name: "internet_search", keywords: ["search", "find", "lookup", "url", "web"] },
      { name: "grammar", keywords: ["grammar", "syntax", "punctuation"] },
      { name: "science", keywords: ["science", "physics", "chemistry", "biology"] },
      { name: "code_review", keywords: ["review", "code quality", "refactor"] },
      { name: "error_detection", keywords: ["error", "bug", "debug", "fix"] },
      { name: "testing", keywords: ["test", "unit test", "integration"] },
      { name: "documentation", keywords: ["docs", "documentation", "comment"] },
      { name: "data_structures", keywords: ["array", "list", "tree", "graph"] },
      { name: "algorithms", keywords: ["algorithm", "sort", "search", "optimize"] },
      { name: "version_control", keywords: ["git", "commit", "branch", "merge"] },
      { name: "environment", keywords: ["environment", "config", "setup"] },
      { name: "security", keywords: ["security", "auth", "encrypt", "safe"] },
    ]

    for (const config of domainConfigs) {
      this.domains.set(config.name, {
        name: config.name,
        keywords: config.keywords,
        query: async (input: string) => {
          return {
            result: `Processed by ${config.name} domain`,
            confidence: 0.85,
            metadata: { domain: config.name },
          }
        },
        train: async (data: any) => {
          console.log(`[v0] Training ${config.name} domain with data`)
        },
      })
    }

    this.initialized = true
    console.log(`[v0] Initialized ${this.domains.size} domains`)
  }

  /**
   * Get all registered domains
   */
  getDomains(): Map<string, DomainAPI> {
    return this.domains
  }

  /**
   * Get a specific domain by name
   */
  getDomain(name: string): DomainAPI | undefined {
    return this.domains.get(name)
  }

  /**
   * Check if a domain is registered
   */
  hasDomain(name: string): boolean {
    return this.domains.has(name)
  }
}

// Singleton instance
let registryInstance: PreviewDataRegistry | null = null

export function getPreviewRegistry(): PreviewDataRegistry {
  if (!registryInstance) {
    registryInstance = new PreviewDataRegistry()
  }
  return registryInstance
}

export { PreviewDataRegistry }
