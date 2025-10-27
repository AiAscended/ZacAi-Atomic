/**
 * File: src/ai/data/security/security_vocabularyManager.ts
 * Purpose: Load seed vocabulary for security domain
 * Depends on: security_utils.ts
 * Depended on by: security_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./security_utils"

export const loadSecuritySeedVocabulary = async (path = "/src/ai/data/security/security_seedVocabulary.json") => {
  try {
    const fs = require("fs")
    const raw = fs.readFileSync(path, "utf-8")
    return safeParseJSON(raw, { vulnerabilities: [] }) as { vulnerabilities: string[] }
  } catch (e) {
    return { vulnerabilities: [] }
  }
}
