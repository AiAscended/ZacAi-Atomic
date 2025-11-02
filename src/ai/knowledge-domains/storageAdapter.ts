/**
 * File: src/ai/data/storageAdapter.ts
 * Purpose: Storage abstraction layer that works in both Node.js and browser environments
 * Depends on: None
 * Depended on by: All domain data managers, vocabulary managers, and model weight loaders
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Storage adapter interface for file operations
 * Provides a unified API that works in both Node.js (with fs) and browser (in-memory) environments
 */
interface StorageAdapter {
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  exists(path: string): Promise<boolean>
  readdir(path: string): Promise<string[]>
}

/**
 * In-memory storage implementation for browser/preview environments
 * Stores all data in memory using Map objects
 */
class InMemoryStorage implements StorageAdapter {
  private files: Map<string, string> = new Map()
  private directories: Map<string, Set<string>> = new Map()

  constructor() {
    // Pre-populate with domain data structures
    this.initializeDomainData()
  }

  private initializeDomainData(): void {
    const domains = [
      "english",
      "general",
      "internet_search",
      "mathematics",
      "typescript",
      "grammar",
      "science",
      "code_review",
      "error_detection",
      "testing",
      "documentation",
      "security",
    ]

    domains.forEach((domain) => {
      // Initialize empty vocabulary
      this.files.set(`src/ai/data/${domain}/${domain}_vocabulary.json`, JSON.stringify({ words: [], count: 0 }))

      // Initialize empty learned data
      this.files.set(`src/ai/data/${domain}/${domain}_learnedData.json`, JSON.stringify({ patterns: [], examples: [] }))

      // Initialize empty weights (binary data represented as base64)
      this.files.set(`src/ai/data/${domain}/${domain}_trainingWeights.bin`, "")

      // Register directory
      const dirPath = `src/ai/data/${domain}`
      if (!this.directories.has(dirPath)) {
        this.directories.set(dirPath, new Set())
      }
      this.directories.get(dirPath)!.add(`${domain}_vocabulary.json`)
      this.directories.get(dirPath)!.add(`${domain}_learnedData.json`)
      this.directories.get(dirPath)!.add(`${domain}_trainingWeights.bin`)
    })
  }

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path)
    if (content === undefined) {
      throw new Error(`File not found: ${path}`)
    }
    return content
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content)

    // Update directory listing
    const dirPath = path.substring(0, path.lastIndexOf("/"))
    const fileName = path.substring(path.lastIndexOf("/") + 1)
    if (!this.directories.has(dirPath)) {
      this.directories.set(dirPath, new Set())
    }
    this.directories.get(dirPath)!.add(fileName)
  }

  async exists(path: string): Promise<boolean> {
    return this.files.has(path) || this.directories.has(path)
  }

  async readdir(path: string): Promise<string[]> {
    const dir = this.directories.get(path)
    return dir ? Array.from(dir) : []
  }
}

/**
 * Singleton storage instance
 * Uses in-memory storage for browser/preview environments
 */
let storageInstance: StorageAdapter | null = null

/**
 * Get the storage adapter instance
 * Returns a singleton instance of the appropriate storage adapter
 */
export function getStorage(): StorageAdapter {
  if (!storageInstance) {
    storageInstance = new InMemoryStorage()
  }
  return storageInstance
}

/**
 * Helper functions that mimic fs API but use the storage adapter
 */
export const storage = {
  async readFile(path: string, encoding = "utf8"): Promise<string> {
    return getStorage().readFile(path)
  },

  async writeFile(path: string, content: string): Promise<void> {
    return getStorage().writeFile(path, content)
  },

  async exists(path: string): Promise<boolean> {
    return getStorage().exists(path)
  },

  async readdir(path: string): Promise<string[]> {
    return getStorage().readdir(path)
  },

  // Synchronous versions for compatibility
  readFileSync(path: string, encoding = "utf8"): string {
    // In browser environment, we can't do true sync, but we can return cached data
    const instance = getStorage() as InMemoryStorage
    const content = (instance as any).files.get(path)
    if (content === undefined) {
      throw new Error(`File not found: ${path}`)
    }
    return content
  },

  writeFileSync(path: string, content: string): void {
    const instance = getStorage() as InMemoryStorage
    ;(instance as any).files.set(path, content)
  },

  existsSync(path: string): boolean {
    const instance = getStorage() as InMemoryStorage
    return (instance as any).files.has(path) || (instance as any).directories.has(path)
  },
}

export const storageAdapter = storage
export default storage
