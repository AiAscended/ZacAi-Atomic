import { registerDomain } from "../registry"
import { INTERNET_SEARCH_DOMAIN } from "./internet_search_constants"
import { loadInternetSearchSeedVocabulary } from "./internet_search_vocabularyManager"
import { registerDomainFiles, watchDomainFiles } from "../dataRegistry"
import { internetSearchRunInference } from "./internet_search_inferenceController"

// TODO: Use internetSearchQuery for additional context-aware search
/* const internetSearchQuery = async (input: string, context?: any) => {
  const searchResults = context?.searchResults || []

  if (searchResults.length > 0) {
    return {
      text: `Based on internet search results: ${searchResults.slice(0, 2).join(" ")}`,
    }
  }

  return {
    text: "Internet search capabilities are available for real-time information lookup.",
  }
} */

export const internetSearchInit = async () => {
  await loadInternetSearchSeedVocabulary()
  registerDomainFiles(INTERNET_SEARCH_DOMAIN, [
    "src/ai/data/internet_search/internet_search_seedVocabulary.json",
    "src/ai/data/internet_search/internet_search_learnedData.json",
    "src/ai/data/internet_search/internet_search_webDocReferences.json",
    "src/ai/data/internet_search/internet_search_trainingWeights.bin",
    "src/ai/data/internet_search/internet_search_pretrained_weights.json",
    "src/ai/data/internet_search/internet_search_tokens.ts",
  ])
  try {
    watchDomainFiles(INTERNET_SEARCH_DOMAIN)
  } catch (e) {
    // ignore
  }

  registerDomain({
    name: INTERNET_SEARCH_DOMAIN,
    version: "0.1",
    initialize: async () => {
      await loadInternetSearchSeedVocabulary()
    },
    query: async (input: string, context?: any) => {
      const result = await internetSearchRunInference(input, context)
      return {
        response: result.response,
        confidence: result.confidence,
        sources: result.sources,
        metadata: result.metadata,
      }
    },
  })
}

void internetSearchInit()

export default internetSearchInit
