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

type ErrorDetectionSeedWeights = Record<string, number[]>

const WEIGHTS_PATH =
  "src/ai/knowledge-domains/error_detection/error_detection_weights/error_detection_pretrained_weights.json"
const PRETRAINED = pretrained as Partial<{
  embeddingDim?: number
  seedWeights?: ErrorDetectionSeedWeights
}>
const EMBEDDING_DIM = typeof PRETRAINED.embeddingDim === "number" ? PRETRAINED.embeddingDim : 128
const SEED_WEIGHTS: ErrorDetectionSeedWeights =
  (PRETRAINED.seedWeights as ErrorDetectionSeedWeights | undefined) ?? {}

const seededVector = (token: string, dim = EMBEDDING_DIM) => {
  return Array.from({ length: dim }, (_, index) => {
    let hash = 2166136261 >>> 0
    for (let j = 0; j < token.length; j++) {
      hash = Math.imul(hash ^ token.charCodeAt(j), 16777619) >>> 0
    }
    const value = ((hash >> (index % 24)) & 0xffff) / 0xffff
    return (value - 0.5) * 0.4
  })
}

export const getErrorDetectionEmbedding = (token: string): number[] => {
  return SEED_WEIGHTS[token] ?? seededVector(token, EMBEDDING_DIM)
}

export const getErrorDetectionEmbeddingForTokens = (tokens: string[]) => tokens.map(getErrorDetectionEmbedding)

type PersistResult = {
  success: boolean
  path: string
}

export const persistErrorDetectionWeights = (weights: ErrorDetectionSeedWeights): PersistResult => {
  try {
    const content = JSON.stringify(
      { domain: ERROR_DETECTION_DOMAIN, version: "0.2", embeddingDim: EMBEDDING_DIM, seedWeights: weights },
      null,
      2,
    )
    const updated = updateFile(ERROR_DETECTION_DOMAIN, WEIGHTS_PATH, content)
    if (!updated) {
      console.error("[error-detection][persist] updateFile rejected write", WEIGHTS_PATH)
      return { success: false, path: WEIGHTS_PATH }
    }
    return { success: true, path: WEIGHTS_PATH }
  } catch (error) {
    console.error("[error-detection][persist] Failed to persist embeddings", error)
    return { success: false, path: WEIGHTS_PATH }
  }
}

const errorDetectionEmbeddingExports = {
  getErrorDetectionEmbedding,
  getErrorDetectionEmbeddingForTokens,
  persistErrorDetectionWeights,
}

export default errorDetectionEmbeddingExports
