/**
 * File: src/ai/data/testing/testing_embeddings.ts
 * Purpose: Testing embedding accessor and persister
 * Depends on: testing_constants.ts, testing_pretrained_weights.json
 * Depended on by: testing_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import pretrained from "./testing_weights/testing_pretrained_weights.json"
import { TESTING_DOMAIN } from "./testing_constants"
import { updateFile } from "../dataRegistry"

interface TestingEmbeddingManifest {
  embeddingDim?: number
  seedWeights?: Record<string, number[]>
}

const manifest = pretrained as TestingEmbeddingManifest
const EMBEDDING_DIM = typeof manifest.embeddingDim === "number" ? manifest.embeddingDim : 128

const seededVector = (token: string, dimension = EMBEDDING_DIM): number[] => {
  return new Array(dimension).fill(0).map((_, index) => {
    let hash = 2166136261 >>> 0
    for (let position = 0; position < token.length; position++) {
      hash = Math.imul(hash ^ token.charCodeAt(position), 16777619) >>> 0
    }
    const sample = ((hash >> (index % 24)) & 0xffff) / 0xffff
    return (sample - 0.5) * 0.4
  })
}

export const getTestingEmbedding = (token: string): number[] => {
  const seedWeights = manifest.seedWeights ?? {}
  if (Object.prototype.hasOwnProperty.call(seedWeights, token)) return seedWeights[token]
  return seededVector(token, EMBEDDING_DIM)
}

export const getTestingEmbeddingForTokens = (tokens: string[]) => tokens.map(getTestingEmbedding)

export const persistTestingWeights = (weights: Record<string, number[]>) => {
  try {
    const content = JSON.stringify(
      { domain: TESTING_DOMAIN, version: "0.2", embeddingDim: EMBEDDING_DIM, seedWeights: weights },
      null,
      2,
    )
    updateFile(
      TESTING_DOMAIN,
      "src/ai/knowledge-domains/testing/testing_weights/testing_pretrained_weights.json",
      content,
    )
    return true
  } catch (error) {
    console.error("[Testing] Failed to persist pretrained weights:", error)
    return false
  }
}

const testingEmbeddingApi = { getTestingEmbedding, getTestingEmbeddingForTokens, persistTestingWeights }

export default testingEmbeddingApi
