/**
 * File: src/ai/data/algorithms/algorithms_embeddings.ts
 * Purpose: Algorithms embedding accessor and persister
 * Depends on: algorithms_constants.ts, algorithms_pretrained_weights.json
 * Depended on by: algorithms_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import pretrained from "./algorithms_weights/algorithms_pretrained_weights.json"
import { ALGORITHMS_DOMAIN } from "./algorithms_constants"

const EMBEDDING_DIM = 128

export const getAlgorithmsEmbedding = (token: string): number[] => {
  const weights = (pretrained as { seedWeights?: Record<string, number[]> }).seedWeights ?? {}
  if (weights[token]) return weights[token]
  return Array.from({ length: EMBEDDING_DIM }, () => Math.random() * 0.1 - 0.05)
}

export const getAlgorithmsEmbeddingForTokens = (tokens: string[]) => tokens.map(getAlgorithmsEmbedding)

export const persistAlgorithmsWeights = (weights: Record<string, number[]>) => {
  const content = JSON.stringify(
    { domain: ALGORITHMS_DOMAIN, version: "0.2", embeddingDim: EMBEDDING_DIM, seedWeights: weights },
    null,
    2,
  )
  const { updateFile } = require("../../orchestration/fileWatcher")
  updateFile(ALGORITHMS_DOMAIN, "src/ai/knowledge-domains/algorithms/algorithms_weights/algorithms_pretrained_weights.json", content)
  return {
    success: true,
    path: "src/ai/knowledge-domains/algorithms/algorithms_weights/algorithms_pretrained_weights.json",
  }
}

export default { getAlgorithmsEmbedding, getAlgorithmsEmbeddingForTokens, persistAlgorithmsWeights }
