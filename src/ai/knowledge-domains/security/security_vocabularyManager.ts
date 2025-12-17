/**
 * File: src/ai/data/security/security_vocabularyManager.ts
 * Purpose: Load seed vocabulary for security domain
 * Depends on: security_utils.ts, ../storageAdapter.ts
 * Depended on by: security_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./security_utils"
import { storageAdapter } from "../storageAdapter"

type SecurityVocabularyFile = {
  vulnerabilities?: string[]
  vocabulary?: string[]
}

export const loadSecuritySeedVocabulary = async (
  path = "/src/ai/knowledge-domains/security/security_seeds/security_seedVocabulary.json",
) => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    const parsed = safeParseJSON<SecurityVocabularyFile>(raw, { vulnerabilities: [] })
    const normalized = Array.isArray(parsed.vulnerabilities)
      ? parsed.vulnerabilities
      : Array.isArray(parsed.vocabulary)
        ? parsed.vocabulary
        : []
    return { vulnerabilities: normalized }
  } catch (error) {
    console.warn("[security] Failed to load seed vocabulary:", error)
    return { vulnerabilities: [] }
  }
}
