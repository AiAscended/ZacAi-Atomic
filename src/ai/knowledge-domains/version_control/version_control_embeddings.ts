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

const EMBEDDING_DIM = pretrained.architecture?.embeddingDim ?? 128

type SeedWeightMap = {
  seedWeights?: Record<string, number[]>
}

export const getVersionControlEmbedding = (token: string): number[] => {
  const weights = (pretrained as SeedWeightMap).seedWeights ?? {}
  if (weights[token]) return weights[token]
  return Array.from({ length: EMBEDDING_DIM }, () => Math.random() * 0.1 - 0.05)
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
