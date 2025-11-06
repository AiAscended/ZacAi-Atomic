/**
 * File: src/ai/data/error_detection/error_detection_embeddings.ts
 * Purpose: Error detection embedding accessor and persister
 * Depends on: error_detection_constants.ts, error_detection_pretrained_weights.json
 * Depended on by: error_detection_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import pretrained from "./error_detection_weights/error_detection_pretrained_weights.json"
import { ERROR_DETECTION_DOMAIN } from "./error_detection_constants"
import { updateFile } from "../dataRegistry"

const p = pretrained as Record<string, unknown>
const EMBEDDING_DIM = typeof p.embeddingDim === "number" ? (p.embeddingDim as number) : 128

const seededVector = (s: string, dim = EMBEDDING_DIM) => {
  const out: number[] = new Array(dim).fill(0).map((_, i) => {
    let h = 2166136261 >>> 0
    for (let j = 0; j < s.length; j++) h = Math.imul(h ^ s.charCodeAt(j), 16777619) >>> 0
    const v = ((h >> (i % 24)) & 0xffff) / 0xffff
    return (v - 0.5) * 0.4
  })
  return out
}

export const getErrorDetectionEmbedding = (token: string): number[] => {
  const seed = (p.seedWeights ?? {}) as Record<string, number[]>
  if (Object.prototype.hasOwnProperty.call(seed, token)) return seed[token]
  return seededVector(token, EMBEDDING_DIM)
}

export const getErrorDetectionEmbeddingForTokens = (tokens: string[]) => tokens.map(getErrorDetectionEmbedding)

export const persistErrorDetectionWeights = (weights: Record<string, number[]>) => {
  try {
    const content = JSON.stringify(
      { domain: ERROR_DETECTION_DOMAIN, version: "0.2", embeddingDim: EMBEDDING_DIM, seedWeights: weights },
      null,
      2,
    )
    updateFile(ERROR_DETECTION_DOMAIN, "src/ai/knowledge-domains/error_detection/error_detection_weights/error_detection_pretrained_weights.json", content)
    return true
  } catch (e) {
    return false
  }
}

export default { getErrorDetectionEmbedding, getErrorDetectionEmbeddingForTokens, persistErrorDetectionWeights }
