/**
 * File: src/ai/data/data_structures/data_structures_embeddings.ts
 * Purpose: Data structures embedding accessor and persister
 * Depends on: data_structures_constants.ts, data_structures_pretrained_weights.json
 * Depended on by: data_structures_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import pretrained from "./data_structures_weights/data_structures_pretrained_weights.json"
import seedVocabulary from "./data_structures_seeds/data_structures_seedVocabulary.json"
import { DATA_STRUCTURES_DOMAIN } from "./data_structures_constants"
import {
  buildSeedWeightMap,
  deterministicVector,
  normalizeSeedTokens,
  resolveEmbeddingDimension,
} from "../utils/embeddingUtils"
import { updateFile } from "../dataRegistry"
const EMBEDDING_DIM = resolveEmbeddingDimension(pretrained, 128)
const SEED_TOKENS = normalizeSeedTokens(seedVocabulary)
const SEED_WEIGHTS = buildSeedWeightMap(pretrained, SEED_TOKENS, EMBEDDING_DIM)

/**
 * Get embedding vector for a token
 * Returns: 128-dimensional vector or random fallback
 */
export const getDataStructuresEmbedding = (token: string): number[] => {
  return SEED_WEIGHTS[token] ?? deterministicVector(token, EMBEDDING_DIM)
}

export const getDataStructuresEmbeddingForTokens = (tokens: string[]) => tokens.map(getDataStructuresEmbedding)

export const persistDataStructuresWeights = (weights: Record<string, number[]>) => {
  const content = JSON.stringify(
    { domain: DATA_STRUCTURES_DOMAIN, version: "0.2", embeddingDim: EMBEDDING_DIM, seedWeights: weights },
    null,
    2,
  )
  // In production, write to file system
  updateFile(DATA_STRUCTURES_DOMAIN, "src/ai/knowledge-domains/data_structures/data_structures_weights/data_structures_pretrained_weights.json", content)
  return {
    success: true,
    path: "src/ai/knowledge-domains/data_structures/data_structures_weights/data_structures_pretrained_weights.json",
  }
}

const dataStructuresEmbeddingExports = {
  getDataStructuresEmbedding,
  getDataStructuresEmbeddingForTokens,
  persistDataStructuresWeights,
}

export default dataStructuresEmbeddingExports
