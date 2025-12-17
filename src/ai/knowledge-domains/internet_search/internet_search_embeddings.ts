import pretrained from "./internet_search_weights/internet_search_pretrained_weights.json"
import { INTERNET_SEARCH_DOMAIN } from "./internet_search_constants"
import { updateFile } from "../dataRegistry"

type InternetSearchSeedWeights = Record<string, number[]>

const WEIGHTS_PATH =
  "src/ai/knowledge-domains/internet_search/internet_search_weights/internet_search_pretrained_weights.json"
const PRETRAINED = pretrained as Partial<{
  embeddingDim?: number
  seedWeights?: InternetSearchSeedWeights
}>
const EMBEDDING_DIM = typeof PRETRAINED.embeddingDim === "number" ? PRETRAINED.embeddingDim : 64
const SEED_WEIGHTS: InternetSearchSeedWeights =
  (PRETRAINED.seedWeights as InternetSearchSeedWeights | undefined) ?? {}

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

export const getInternetSearchEmbedding = (token: string): number[] => {
  return SEED_WEIGHTS[token] ?? seededVector(token, EMBEDDING_DIM)
}

export const getInternetSearchEmbeddingForTokens = (tokens: string[]) =>
  tokens.map(getInternetSearchEmbedding)

type PersistResult = {
  success: boolean
  path: string
}

export const persistInternetSearchWeights = (weights: InternetSearchSeedWeights): PersistResult => {
  try {
    const content = JSON.stringify(
      { domain: INTERNET_SEARCH_DOMAIN, version: "0.2", embeddingDim: EMBEDDING_DIM, seedWeights: weights },
      null,
      2,
    )
    const updated = updateFile(INTERNET_SEARCH_DOMAIN, WEIGHTS_PATH, content)
    if (!updated) {
      console.error("[internet-search][persist] updateFile rejected write", WEIGHTS_PATH)
      return { success: false, path: WEIGHTS_PATH }
    }
    return { success: true, path: WEIGHTS_PATH }
  } catch (error) {
    console.error("[internet-search][persist] Failed to persist embeddings", error)
    return { success: false, path: WEIGHTS_PATH }
  }
}

const internet_search_embeddings_bundle = { getInternetSearchEmbedding, persistInternetSearchWeights };

export default internet_search_embeddings_bundle;
