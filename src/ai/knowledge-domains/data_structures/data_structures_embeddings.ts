/**
 * File: src/ai/data/data_structures/data_structures_embeddings.ts
 * Purpose: Data structures embedding accessor and persister
 * Depends on: data_structures_constants.ts, data_structures_pretrained_weights.json
 * Depended on by: data_structures_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import pretrained from "./data_structures_weights/data_structures_pretrained_weights.json"
import { DATA_STRUCTURES_DOMAIN } from "./data_structures_constants"

const EMBEDDING_DIM = 128

/**
 * Get embedding vector for a token
 * Returns: 128-dimensional vector or random fallback
 */
export const getDataStructuresEmbedding = (token: string): number[] => {
  const weights = pretrained.weights as Record<string, number[]>
  if (weights[token]) return weights[token]
  // Fallback: random embedding
  return Array.from({ length: EMBEDDING_DIM }, () => Math.random() * 0.1 - 0.05)
}

export const getDataStructuresEmbeddingForTokens = (tokens: string[]) => tokens.map(getDataStructuresEmbedding)

export const persistDataStructuresWeights = (weights: Record<string, number[]>) => {
  const content = JSON.stringify(
    { domain: DATA_STRUCTURES_DOMAIN, version: "0.2", embeddingDim: EMBEDDING_DIM, seedWeights: weights },
    null,
    2,
  )
  // In production, write to file system
  const { updateFile } = require("../../orchestration/fileWatcher")
  updateFile(DATA_STRUCTURES_DOMAIN, "src/ai/knowledge-domains/data_structures/data_structures_weights/data_structures_pretrained_weights.json", content)
  return {
    success: true,
    path: "src/ai/knowledge-domains/data_structures/data_structures_weights/data_structures_pretrained_weights.json",
  }
}

export default { getDataStructuresEmbedding, getDataStructuresEmbeddingForTokens, persistDataStructuresWeights }
