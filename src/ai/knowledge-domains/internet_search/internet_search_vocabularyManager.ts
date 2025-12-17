import { storageAdapter } from "../storageAdapter"
import { safeParseJSON } from "./internet_search_utils"

export type InternetSearchSeedVocabulary = {
  terms: string[]
}

const DEFAULT_SEED_VOCAB_PATH =
  "/src/ai/knowledge-domains/internet_search/internet_search_seeds/internet_search_seedVocabulary.json"

const createDefaultSeedVocabulary = (): InternetSearchSeedVocabulary => ({ terms: [] })

export const loadInternetSearchSeedVocabulary = async (
  path = DEFAULT_SEED_VOCAB_PATH,
): Promise<InternetSearchSeedVocabulary> => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON<InternetSearchSeedVocabulary>(raw, createDefaultSeedVocabulary())
  } catch (error) {
    console.error("[internet-search][seed-vocabulary] Failed to load seed vocabulary", { path, error })
    return createDefaultSeedVocabulary()
  }
}
