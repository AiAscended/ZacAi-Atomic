/**
 * File: src/ai/data/algorithms/algorithms_embeddings.ts
 * Purpose: Algorithms embedding accessor and persister
 * Depends on: algorithms_constants.ts, algorithms_pretrained_weights.json
 * Depended on by: algorithms_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import pretrained from "./algorithms_weights/algorithms_pretrained_weights.json"
import seedVocabulary from "./algorithms_seeds/algorithms_seedVocabulary.json"
import { ALGORITHMS_DOMAIN } from "./algorithms_constants"
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

export const getAlgorithmsEmbedding = (token: string): number[] => {
  return SEED_WEIGHTS[token] ?? deterministicVector(token, EMBEDDING_DIM)
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
