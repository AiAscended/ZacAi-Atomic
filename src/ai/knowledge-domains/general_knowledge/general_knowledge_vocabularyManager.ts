import { storageAdapter } from "../storageAdapter"
import { safeParseJSON } from "./general_knowledge_utils"

export type GeneralSeedVocabulary = {
  terms: string[]
}

const DEFAULT_SEED_VOCAB_PATH =
  "/src/ai/knowledge-domains/general_knowledge/general_knowledge_seeds/general_knowledge_seedVocabulary.json"

const createDefaultSeedVocabulary = (): GeneralSeedVocabulary => ({ terms: [] })

export const loadGeneralSeedVocabulary = async (
  path = DEFAULT_SEED_VOCAB_PATH,
): Promise<GeneralSeedVocabulary> => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON<GeneralSeedVocabulary>(raw, createDefaultSeedVocabulary())
  } catch (error) {
    console.error("[general-knowledge][seed-vocabulary] Failed to load seed vocabulary", { path, error })
    return createDefaultSeedVocabulary()
  }
}
