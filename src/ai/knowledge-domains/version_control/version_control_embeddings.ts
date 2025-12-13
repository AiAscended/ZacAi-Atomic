/**
 * File: src/ai/data/version_control/version_control_embeddings.ts
 * Purpose: Version control embedding accessor and persister
 * Depends on: version_control_constants.ts, version_control_pretrained_weights.json
 * Depended on by: version_control_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import pretrained from "./version_control_weights/version_control_pretrained_weights.json"
import seedVocabulary from "./version_control_seeds/version_control_seedVocabulary.json"
import { VERSION_CONTROL_DOMAIN } from "./version_control_constants"
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

export const getVersionControlEmbedding = (token: string): number[] => {
  return SEED_WEIGHTS[token] ?? deterministicVector(token, EMBEDDING_DIM)
}

export const getVersionControlEmbeddingForTokens = (tokens: string[]) => tokens.map(getVersionControlEmbedding)

export const persistVersionControlWeights = (weights: Record<string, number[]>) => {
  const content = JSON.stringify(
    { domain: VERSION_CONTROL_DOMAIN, version: "0.2", embeddingDim: EMBEDDING_DIM, seedWeights: weights },
    null,
    2,
  )
  updateFile(VERSION_CONTROL_DOMAIN, "src/ai/knowledge-domains/version_control/version_control_weights/version_control_pretrained_weights.json", content)
  return {
    success: true,
    path: "src/ai/knowledge-domains/version_control/version_control_weights/version_control_pretrained_weights.json",
  }
}
const versionControlEmbeddingApi = {
  getVersionControlEmbedding,
  getVersionControlEmbeddingForTokens,
  persistVersionControlWeights,
}

export default versionControlEmbeddingApi
