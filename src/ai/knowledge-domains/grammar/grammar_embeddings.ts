/**
 * File: src/ai/data/grammar/grammar_embeddings.ts
 * Purpose: Grammar embedding accessor and persister with deterministic fallback
 * Depends on: grammar_constants.ts, grammar_pretrained_weights.json
 * Depended on by: grammar_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import pretrained from "./grammar_weights/grammar_pretrained_weights.json"
import { GRAMMAR_DOMAIN } from "./grammar_constants"
import { updateFile } from "../dataRegistry"

type GrammarSeedWeights = Record<string, number[]>

const WEIGHTS_PATH =
  "src/ai/knowledge-domains/grammar/grammar_weights/grammar_pretrained_weights.json"
const PRETRAINED = pretrained as Partial<{
  embeddingDim?: number
  seedWeights?: GrammarSeedWeights
}>
const EMBEDDING_DIM = typeof PRETRAINED.embeddingDim === "number" ? PRETRAINED.embeddingDim : 128
const SEED_WEIGHTS: GrammarSeedWeights =
  (PRETRAINED.seedWeights as GrammarSeedWeights | undefined) ?? {}

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

export const getGrammarEmbedding = (token: string): number[] => {
  return SEED_WEIGHTS[token] ?? seededVector(token, EMBEDDING_DIM)
}

export const getGrammarEmbeddingForTokens = (tokens: string[]) => tokens.map(getGrammarEmbedding)

type PersistResult = {
  success: boolean
  path: string
}

export const persistGrammarWeights = (weights: GrammarSeedWeights): PersistResult => {
  try {
    const content = JSON.stringify(
      { domain: GRAMMAR_DOMAIN, version: "0.2", embeddingDim: EMBEDDING_DIM, seedWeights: weights },
      null,
      2,
    )
    const updated = updateFile(GRAMMAR_DOMAIN, WEIGHTS_PATH, content)
    if (!updated) {
      console.error("[grammar][persist] updateFile failed", WEIGHTS_PATH)
      return { success: false, path: WEIGHTS_PATH }
    }
    return { success: true, path: WEIGHTS_PATH }
  } catch (error) {
    console.error("[grammar][persist] Failed to persist embeddings", error)
    return { success: false, path: WEIGHTS_PATH }
  }
}

const grammarEmbeddingExports = {
  getGrammarEmbedding,
  getGrammarEmbeddingForTokens,
  persistGrammarWeights,
}

export default grammarEmbeddingExports
