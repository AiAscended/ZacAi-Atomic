import path from 'path'

import { INTERNET_SEARCH_DOMAIN } from "./internet_search_constants"

const DOMAIN_NAME = 'internet_search';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);
import { loadInternetSearchSeedVocabulary } from "./internet_search_vocabularyManager"
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

}

void internetSearchInit()

export default internetSearchInit
