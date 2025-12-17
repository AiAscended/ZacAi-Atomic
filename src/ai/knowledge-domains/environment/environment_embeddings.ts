/**
 * File: src/ai/data/environment/environment_embeddings.ts
 * Purpose: Environment embedding accessor and persister
 * Depends on: environment_constants.ts, environment_pretrained_weights.json
 * Depended on by: environment_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import pretrained from "./environment_weights/environment_pretrained_weights.json"
import seedVocabulary from "./environment_seeds/environment_seedVocabulary.json"
import { ENVIRONMENT_DOMAIN } from "./environment_constants"
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

export const getEnvironmentEmbedding = (token: string): number[] => {
  return SEED_WEIGHTS[token] ?? deterministicVector(token, EMBEDDING_DIM)
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
