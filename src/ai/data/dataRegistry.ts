/**
 * File: src/ai/data/dataRegistry.ts
 * Purpose: Track files that belong to knowledge domains, provide safe write/update APIs,
 * and publish change events on the orchestration event bus.
 * Depends on: src/ai/orchestration/eventBus.ts
 * Depended on by: src/ai/orchestration/aiOrchestrator.ts, domain integration APIs
 * Creator: Vercel v0 Coding Assistant
 */

import fs from "fs"
import path from "path"
import { publish } from "../orchestration/eventBus"

type FileRecord = { path: string; lastModified: number }

const domainFiles = new Map<string, FileRecord[]>()

const safeNow = () => Date.now()

/**
 * Register a list of file paths as belonging to a domain.
 * Publishes a "data:registered" event.
 */
export const registerDomainFiles = (domain: string, files: string[]) => {
  const records = files.map((p) => ({ path: p, lastModified: safeNow() }))
  domainFiles.set(domain, records)
  publish("data:registered", { domain, files: records })
}

/**
 * List all registered files for a domain, or all domains if no domain specified.
 */
export const listDomainFiles = (domain?: string) => {
  if (!domain) {
    const out: Record<string, FileRecord[]> = {}
    for (const [k, v] of domainFiles.entries()) out[k] = v
    return out
  }
  return domainFiles.get(domain) ?? []
}

/**
 * Get metadata for a specific file in a domain.
 */
export const getFileRecord = (domain: string, filePath: string) => {
  const files = domainFiles.get(domain) ?? []
  return files.find((f) => f.path === filePath) ?? null
}

/**
 * Safely write content to a file and update the registry.
 * Publishes a "data:changed" event on success or "data:error" on failure.
 */
export const updateFile = (domain: string, filePath: string, content: string): boolean => {
  try {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filePath, content, "utf-8")

    const recs: FileRecord[] = domainFiles.get(domain) ?? []
    const idx = recs.findIndex((r) => r.path === filePath)
    const now = safeNow()
    if (idx >= 0) {
      recs[idx].lastModified = now
    } else {
      recs.push({ path: filePath, lastModified: now })
    }
    domainFiles.set(domain, recs)

    publish("data:changed", { domain, file: filePath, action: "updated", timestamp: now })
    return true
  } catch (e) {
    publish("data:error", { domain, file: filePath, error: e })
    return false
  }
}

/**
 * Read file content safely.
 */
export const readFile = (filePath: string, domain?: string): string | null => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8")
      publish("data:read", { domain, file: filePath, timestamp: safeNow() })
      return content
    }
    return null
  } catch (e) {
    return null
  }
}

/**
 * Watch domain files for changes (placeholder for future implementation).
 */
export const watchDomainFiles = (domain: string) => {
  const files = domainFiles.get(domain) ?? []
  publish("data:watching", { domain, count: files.length })
  return false
}

export default {
  registerDomainFiles,
  listDomainFiles,
  getFileRecord,
  updateFile,
  readFile,
  watchDomainFiles,
}
