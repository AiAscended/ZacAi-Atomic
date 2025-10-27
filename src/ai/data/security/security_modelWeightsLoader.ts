/**
 * File: src/ai/data/security/security_modelWeightsLoader.ts
 * Purpose: Load training weights for security domain
 * Depends on: None
 * Depended on by: security_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

export const securityLoadWeights = async (path = "/src/ai/data/security/security_trainingWeights.bin") => {
  try {
    const fs = require("fs")
    const raw = fs.readFileSync(path)
    return raw
  } catch (e) {
    return null
  }
}
