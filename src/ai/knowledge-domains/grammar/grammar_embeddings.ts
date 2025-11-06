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

export const getGrammarEmbedding = (token: string): number[] => {
  const seed = (p.seedWeights ?? {}) as Record<string, number[]>
  if (Object.prototype.hasOwnProperty.call(seed, token)) return seed[token]
  return seededVector(token, EMBEDDING_DIM)
}

export const getGrammarEmbeddingForTokens = (tokens: string[]) => tokens.map(getGrammarEmbedding)

export const persistGrammarWeights = (weights: Record<string, number[]>) => {
  try {
    const content = JSON.stringify(
      { domain: GRAMMAR_DOMAIN, version: "0.2", embeddingDim: EMBEDDING_DIM, seedWeights: weights },
      null,
      2,
    )
    updateFile(GRAMMAR_DOMAIN, "src/ai/knowledge-domains/grammar/grammar_weights/grammar_pretrained_weights.json", content)
    return true
  } catch (e) {
    return false
  }
}

export default { getGrammarEmbedding, getGrammarEmbeddingForTokens, persistGrammarWeights }
