/**
 * File: src/ai/data/algorithms/algorithms_embeddings.ts
 * Purpose: Algorithms embedding accessor and persister
 * Depends on: algorithms_constants.ts, algorithms_pretrained_weights.json
 * Depended on by: algorithms_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import pretrained from "./algorithms_seeds/algorithms_pretrained_weights.json"
import { ALGORITHMS_DOMAIN } from "./algorithms_constants"
import {
  buildSeedWeightMap,
  deterministicVector,
  normalizeSeedTokens,
  resolveEmbeddingDimension,
} from "../utils/embeddingUtils"
import { updateFile } from "../dataRegistry"

const EMBEDDING_DIM = pretrained.architecture?.embeddingDim ?? 128

type SeedWeightMap = {
  seedWeights?: Record<string, number[]>
}

export const getAlgorithmsEmbedding = (token: string): number[] => {
  const weights = pretrained.weights as Record<string, number[]>
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
  updateFile(ALGORITHMS_DOMAIN, "src/ai/knowledge-domains/algorithms/algorithms_weights/algorithms_pretrained_weights.json", content)
  return {
    success: true,
    path: "src/ai/knowledge-domains/algorithms/algorithms_weights/algorithms_pretrained_weights.json",
  }
}

const algorithmsEmbeddingExports = {
  getAlgorithmsEmbedding,
  getAlgorithmsEmbeddingForTokens,
  persistAlgorithmsWeights,
}

export default algorithmsEmbeddingExports
