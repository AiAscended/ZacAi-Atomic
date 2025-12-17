/**
 * File: src/ai/data/environment/environment_embeddings.ts
 * Purpose: Environment embedding accessor and persister
 * Depends on: environment_constants.ts, environment_pretrained_weights.json
 * Depended on by: environment_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import pretrained from "./environment_seeds/environment_pretrained_weights.json"
import { ENVIRONMENT_DOMAIN } from "./environment_constants"

const EMBEDDING_DIM = pretrained.architecture?.embeddingDim ?? 128

type SeedWeightMap = {
  seedWeights?: Record<string, number[]>
}

export const getEnvironmentEmbedding = (token: string): number[] => {
  const weights = pretrained.weights as Record<string, number[]>
  if (weights[token]) return weights[token]
  return Array.from({ length: EMBEDDING_DIM }, () => Math.random() * 0.1 - 0.05)
}

export const getEnvironmentEmbeddingForTokens = (tokens: string[]) => tokens.map(getEnvironmentEmbedding)

export const persistEnvironmentWeights = (weights: Record<string, number[]>) => {
  const content = JSON.stringify(
    { domain: ENVIRONMENT_DOMAIN, version: "0.2", embeddingDim: EMBEDDING_DIM, seedWeights: weights },
    null,
    2,
  )
  updateFile(ENVIRONMENT_DOMAIN, "src/ai/knowledge-domains/environment/environment_weights/environment_pretrained_weights.json", content)
  return {
    success: true,
    path: "src/ai/knowledge-domains/environment/environment_weights/environment_pretrained_weights.json",
  }
}

const environmentEmbeddingExports = {
  getEnvironmentEmbedding,
  getEnvironmentEmbeddingForTokens,
  persistEnvironmentWeights,
}

export default environmentEmbeddingExports
