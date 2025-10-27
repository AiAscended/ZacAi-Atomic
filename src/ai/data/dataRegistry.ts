/**
 * File: src/ai/data/dataRegistry.ts
 * Purpose: Track files that belong to knowledge domains, provide safe write/update APIs,
 * and publish change events on the orchestration event bus.
 *
 * Converted from fs-based to Next.js compatible in-memory registry
 */

import { publish } from "../orchestration/eventBus"

type FileRecord = { path: string; lastModified: number; content?: string }

const domainFiles = new Map<string, FileRecord[]>()
const fileContents = new Map<string, string>()

const safeNow = () => Date.now()

export const registerDomainFiles = (domain: string, files: string[]) => {
  const records = files.map((p) => ({ path: p, lastModified: safeNow() }))
  domainFiles.set(domain, records)
  publish("data:registered", { domain, files: records })
}

export const listDomainFiles = (domain?: string) => {
  if (!domain) {
    const out: Record<string, FileRecord[]> = {}
    for (const [k, v] of domainFiles.entries()) out[k] = v
    return out
  }
  return domainFiles.get(domain) ?? []
}

export const getFileRecord = (domain: string, filePath: string) => {
  const files = domainFiles.get(domain) ?? []
  return files.find((f) => f.path === filePath) ?? null
}

export const updateFile = (domain: string, filePath: string, content: string): boolean => {
  try {
    fileContents.set(filePath, content)

    const recs: FileRecord[] = domainFiles.get(domain) ?? []
    const idx = recs.findIndex((r) => r.path === filePath)
    const now = safeNow()
    if (idx >= 0) {
      recs[idx].lastModified = now
      recs[idx].content = content
    } else {
      recs.push({ path: filePath, lastModified: now, content })
    }
    domainFiles.set(domain, recs)

    publish("data:changed", { domain, file: filePath, action: "updated", timestamp: now })
    return true
  } catch (e) {
    publish("data:error", { domain, file: filePath, error: e })
    return false
  }
}

export const readFile = (filePath: string, domain?: string): string | null => {
  try {
    const content = fileContents.get(filePath)
    if (content) {
      publish("data:read", { domain, file: filePath, timestamp: safeNow() })
      return content
    }
    return null
  } catch (e) {
    return null
  }
}

export const registerFileContent = (filePath: string, content: string) => {
  fileContents.set(filePath, content)
}

export const watchDomainFiles = (domain: string) => {
  publish("data:watching", { domain, count: 0, note: "File watching not available in Next.js" })
  return false
}

export default {
  registerDomainFiles,
  listDomainFiles,
  getFileRecord,
  updateFile,
  readFile,
  registerFileContent,
  watchDomainFiles,
}
