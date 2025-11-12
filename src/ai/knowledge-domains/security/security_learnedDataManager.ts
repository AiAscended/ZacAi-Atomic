/**
 * File: src/ai/data/security/security_learnedDataManager.ts
 * Purpose: Read/write learned data for security domain
 * Depends on: security_utils.ts, ../storageAdapter.ts
 * Depended on by: security_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./security_utils"
import { storageAdapter } from "../storageAdapter"

export const loadSecurityLearnedData = async (path = "/src/ai/knowledge-domains/security/security_learned/security_learnedData.json") => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(raw, { notes: [], concepts: {} })
  } catch (e) {
    return { notes: [], concepts: {} }
  }
}

export const saveSecurityLearnedData = async (
  data: unknown,
  path = "/src/ai/knowledge-domains/security/security_learned/security_learnedData.json",
) => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2))
    return true
  } catch (e) {
    return false
  }
}
