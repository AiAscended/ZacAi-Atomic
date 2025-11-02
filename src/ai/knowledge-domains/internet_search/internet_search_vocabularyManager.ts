import { storageAdapter } from "../storageAdapter"
import { safeParseJSON } from "./internet_search_utils"

export const loadInternetSearchSeedVocabulary = async (
  path = "/src/ai/knowledge-domains/internet_search/internet_search_seeds/internet_search_seedVocabulary.json",
) => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(raw, { terms: [] }) as { terms: string[] }
  } catch (e) {
    return { terms: [] }
  }
}
