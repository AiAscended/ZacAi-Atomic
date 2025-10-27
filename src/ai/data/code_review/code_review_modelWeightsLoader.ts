/**
 * File: src/ai/data/code_review/code_review_modelWeightsLoader.ts
 * Purpose: Load training weights for code review domain
 * Depends on: None
 * Depended on by: code_review_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

export const codeReviewLoadWeights = async (path = "/src/ai/data/code_review/code_review_trainingWeights.bin") => {
  try {
    const fs = require("fs")
    const raw = fs.readFileSync(path)
    return raw
  } catch (e) {
    return null
  }
}
