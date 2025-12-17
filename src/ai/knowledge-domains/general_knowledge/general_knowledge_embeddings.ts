import pretrained from "./general_knowledge_weights/general_knowledge_pretrained_weights.json"
import { GENERAL_DOMAIN } from "./general_knowledge_constants"
import { updateFile } from "../dataRegistry"

type GeneralSeedWeights = Record<string, number[]>

const WEIGHTS_PATH =
  "src/ai/knowledge-domains/general_knowledge/general_knowledge_weights/general_knowledge_pretrained_weights.json"
const PRETRAINED = pretrained as Partial<{
  embeddingDim?: number
  seedWeights?: GeneralSeedWeights
}>
const EMBEDDING_DIM = typeof PRETRAINED.embeddingDim === "number" ? PRETRAINED.embeddingDim : 32
const SEED_WEIGHTS: GeneralSeedWeights =
  (PRETRAINED.seedWeights as GeneralSeedWeights | undefined) ?? {}

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

export const getGeneralEmbedding = (token: string): number[] => {
  return SEED_WEIGHTS[token] ?? seededVector(token, EMBEDDING_DIM)
}

export const getGeneralEmbeddingsForTokens = (tokens: string[]) => tokens.map(getGeneralEmbedding)

type PersistResult = {
  success: boolean
  path: string
}

export const persistGeneralWeights = (weights: GeneralSeedWeights): PersistResult => {
  try {
    const content = JSON.stringify(
      { domain: GENERAL_DOMAIN, version: "0.2", embeddingDim: EMBEDDING_DIM, seedWeights: weights },
      null,
      2,
    )
    const updated = updateFile(GENERAL_DOMAIN, WEIGHTS_PATH, content)
    if (!updated) {
      console.error("[general-knowledge][persist] updateFile rejected write", WEIGHTS_PATH)
      return { success: false, path: WEIGHTS_PATH }
    }
    return { success: true, path: WEIGHTS_PATH }
  } catch (error) {
    console.error("[general-knowledge][persist] Failed to persist embeddings", error)
    return { success: false, path: WEIGHTS_PATH }
  }
}

const generalEmbeddingExports = {
  getGeneralEmbedding,
  getGeneralEmbeddingsForTokens,
  persistGeneralWeights,
}

export default generalEmbeddingExports
