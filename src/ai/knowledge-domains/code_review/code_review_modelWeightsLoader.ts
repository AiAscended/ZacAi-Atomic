/**
 * File: src/ai/data/code_review/code_review_modelWeightsLoader.ts
 * Purpose: Load training weights for code review domain
 * Depends on: None
 * Depended on by: code_review_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { storageAdapter } from "../storageAdapter"

export const codeReviewLoadWeights = async (path = "/src/ai/knowledge-domains/code_review/code_review_weights/code_review_trainingWeights.bin") => {
  try {
    const raw = await storageAdapter.readFile(path)
    return raw
  } catch (e) {
    return null
  }
}
