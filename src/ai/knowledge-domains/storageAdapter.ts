import * as fsSync from "fs"
import { promises as fs } from "fs"
import path from "path"

/**
 * File: src/ai/data/storageAdapter.ts
 * Purpose: Storage abstraction layer that works in both Node.js and browser environments
 * Depends on: None
 * Depended on by: All domain data managers, vocabulary managers, and model weight loaders
 * Creator: Vercel v0 Coding Assistant
 */

const WORKSPACE_ROOT = process.cwd()

function resolveStoragePath(targetPath: string): string {
  if (!targetPath) {
    return WORKSPACE_ROOT
  }

  if (targetPath.startsWith("/src/")) {
    return path.join(WORKSPACE_ROOT, targetPath.slice(1))
  }

  if (targetPath.startsWith("src/")) {
    return path.join(WORKSPACE_ROOT, targetPath)
  }

  if (path.isAbsolute(targetPath)) {
    return targetPath
  }

  return path.join(WORKSPACE_ROOT, targetPath)
}

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

class NodeStorage implements StorageAdapter {
  async readFile(filePath: string): Promise<string> {
    const resolved = resolveStoragePath(filePath)
    return fs.readFile(resolved, "utf8")
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    const resolved = resolveStoragePath(filePath)
    await fs.mkdir(path.dirname(resolved), { recursive: true })
    await fs.writeFile(resolved, content, "utf8")
  }

  async exists(filePath: string): Promise<boolean> {
    const resolved = resolveStoragePath(filePath)
    try {
      await fs.access(resolved)
      return true
    } catch {
      return false
    }
  }

  async readdir(dirPath: string): Promise<string[]> {
    const resolved = resolveStoragePath(dirPath)
    try {
      return await fs.readdir(resolved)
    } catch {
      return []
    }
  }
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

  private updateDirectoryListing(targetPath: string): void {
    const dirPath = targetPath.substring(0, targetPath.lastIndexOf("/"))
    const fileName = targetPath.substring(targetPath.lastIndexOf("/") + 1)

    if (!this.directories.has(dirPath)) {
      this.directories.set(dirPath, new Set())
    }

    this.directories.get(dirPath)!.add(fileName)
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
    this.updateDirectoryListing(path)
  }

  async exists(path: string): Promise<boolean> {
    return this.files.has(path) || this.directories.has(path)
  }

  async readdir(path: string): Promise<string[]> {
    const dir = this.directories.get(path)
    return dir ? Array.from(dir) : []
  }

  readFileSync(path: string): string {
    const content = this.files.get(path)
    if (content === undefined) {
      throw new Error(`File not found: ${path}`)
    }
    return content
  }

  writeFileSync(path: string, content: string): void {
    this.files.set(path, content)
    this.updateDirectoryListing(path)
  }

  existsSync(path: string): boolean {
    return this.files.has(path) || this.directories.has(path)
  }
}

/**
 * Singleton storage instance
 * Uses filesystem storage on the server and in-memory storage in the browser
 */
let storageInstance: StorageAdapter | null = null

const isBrowserEnvironment = typeof window !== "undefined"

/**
 * Get the storage adapter instance
 * Returns a singleton instance of the appropriate storage adapter
 */
export function getStorage(): StorageAdapter {
  if (!storageInstance) {
    storageInstance = isBrowserEnvironment ? new InMemoryStorage() : new NodeStorage()
  }
  return storageInstance
}

/**
 * Helper functions that mimic fs API but use the storage adapter
 */
export const storage = {
  async readFile(path: string, encoding: BufferEncoding = "utf8"): Promise<string> {
    const normalized = encoding.toLowerCase() === "utf-8" ? "utf8" : encoding
    if (normalized !== "utf8") {
      throw new Error(`Unsupported encoding: ${encoding}`)
    }
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

  async readBinaryFile(path: string): Promise<ArrayBuffer> {
    if (!isBrowserEnvironment) {
      const resolved = resolveStoragePath(path)
      const buffer = await fs.readFile(resolved)
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    }

    const content = await getStorage().readFile(path)
    const encoder = new TextEncoder()
    return encoder.encode(content).buffer
  },

  // Synchronous versions for compatibility
  readFileSync(targetPath: string, encoding: BufferEncoding = "utf8"): string {
    const normalized = encoding.toLowerCase() === "utf-8" ? "utf8" : encoding
    if (!isBrowserEnvironment) {
      const resolved = resolveStoragePath(targetPath)
      return fsSync.readFileSync(resolved, normalized)
    }

    const instance = getStorage()
    if (instance instanceof InMemoryStorage) {
      return instance.readFileSync(targetPath)
    }

    throw new Error("Unsupported storage adapter")
  },

  readBinaryFileSync(targetPath: string): ArrayBuffer {
    if (!isBrowserEnvironment) {
      const resolved = resolveStoragePath(targetPath)
      const buffer = fsSync.readFileSync(resolved)
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    }

    const instance = getStorage()
    if (instance instanceof InMemoryStorage) {
      const content = instance.readFileSync(targetPath)
      const encoder = new TextEncoder()
      return encoder.encode(content).buffer
    }

    throw new Error("Unsupported storage adapter")
  },

  writeFileSync(targetPath: string, content: string): void {
    if (!isBrowserEnvironment) {
      const resolved = resolveStoragePath(targetPath)
      fsSync.mkdirSync(path.dirname(resolved), { recursive: true })
      fsSync.writeFileSync(resolved, content, "utf8")
      return
    }

    const instance = getStorage()
    if (instance instanceof InMemoryStorage) {
      instance.writeFileSync(targetPath, content)
      return
    }

    throw new Error("Unsupported storage adapter")
  },

  existsSync(targetPath: string): boolean {
    if (!isBrowserEnvironment) {
      const resolved = resolveStoragePath(targetPath)
      return fsSync.existsSync(resolved)
    }

    const instance = getStorage()
    if (instance instanceof InMemoryStorage) {
      return instance.existsSync(targetPath)
    }

    throw new Error("Unsupported storage adapter")
  },
}

export const storageAdapter = storage
export default storage
