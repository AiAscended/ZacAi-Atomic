/**
 * File: src/ai/data/security/security_learnedDataManager.ts
 * Purpose: Read/write learned data for security domain
 * Depends on: security_utils.ts
 * Depended on by: security_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./security_utils"

export const loadSecurityLearnedData = async (path = "/src/ai/data/security/security_learnedData.json") => {
  try {
    const fs = require("fs")
    const raw = fs.readFileSync(path, "utf-8")
    return safeParseJSON(raw, { notes: [], concepts: {} })
  } catch (e) {
    return { notes: [], concepts: {} }
  }
}

export const saveSecurityLearnedData = async (
  data: unknown,
  path = "/src/ai/data/security/security_learnedData.json",
) => {
  try {
    const fs = require("fs")
    fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (e) {
    return false
  }
}
