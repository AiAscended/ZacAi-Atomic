import pretrained from "./mathematics_weights/mathematics_pretrained_weights.json"
import { MATHEMATICS_DOMAIN } from "./mathematics_constants"
import { updateFile } from "../dataRegistry"

type MathematicsSeedWeights = Record<string, number[]>

const WEIGHTS_PATH =
  "src/ai/knowledge-domains/mathematics/mathematics_weights/mathematics_pretrained_weights.json"
const PRETRAINED = pretrained as Partial<{
  embeddingDim?: number
  seedWeights?: MathematicsSeedWeights
}>
const EMBEDDING_DIM = typeof PRETRAINED.embeddingDim === "number" ? PRETRAINED.embeddingDim : 64
const SEED_WEIGHTS: MathematicsSeedWeights =
  (PRETRAINED.seedWeights as MathematicsSeedWeights | undefined) ?? {}

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

export const getMathematicsEmbedding = (token: string): number[] => {
  return SEED_WEIGHTS[token] ?? seededVector(token, EMBEDDING_DIM)
}

export const getMathematicsEmbeddingForTokens = (tokens: string[]) => tokens.map(getMathematicsEmbedding)

type PersistResult = {
  success: boolean
  path: string
}

export const persistMathematicsWeights = (weights: MathematicsSeedWeights): PersistResult => {
  try {
    const content = JSON.stringify(
      {
        domain: MATHEMATICS_DOMAIN,
        version: "0.2",
        embeddingDim: EMBEDDING_DIM,
        seedWeights: weights,
      },
      null,
      2,
    )
    const updated = updateFile(MATHEMATICS_DOMAIN, WEIGHTS_PATH, content)
    if (!updated) {
      console.error("[mathematics][persist] updateFile rejected write", WEIGHTS_PATH)
      return { success: false, path: WEIGHTS_PATH }
    }
    return { success: true, path: WEIGHTS_PATH }
  } catch (error) {
    console.error("[mathematics][persist] Failed to persist embeddings", error)
    return { success: false, path: WEIGHTS_PATH }
  }
}

const mathematics_embeddings_bundle = {
  getMathematicsEmbedding,
  getMathematicsEmbeddingForTokens,
  persistMathematicsWeights,
};

export default mathematics_embeddings_bundle;
