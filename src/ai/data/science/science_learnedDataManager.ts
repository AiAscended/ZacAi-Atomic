/**
 * File: src/ai/data/science/science_learnedDataManager.ts
 * Purpose: Read/write learned data for science domain
 * Depends on: science_utils.ts
 * Depended on by: science_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./science_utils"

export const loadScienceLearnedData = async (path = "/src/ai/data/science/science_learnedData.json") => {
  try {
    const fs = require("fs")
    const raw = fs.readFileSync(path, "utf-8")
    return safeParseJSON(raw, { notes: [], concepts: {} })
  } catch (e) {
    return { notes: [], concepts: {} }
  }
}

export const saveScienceLearnedData = async (data: unknown, path = "/src/ai/data/science/science_learnedData.json") => {
  try {
    const fs = require("fs")
    fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (e) {
    return false
  }
}
