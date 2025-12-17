import path from "path"

import { domainRegistry } from "../domainRegistry"
import { INTERNET_SEARCH_DOMAIN } from "./internet_search_constants"
import { loadInternetSearchSeedVocabulary } from "./internet_search_vocabularyManager"

const DOMAIN_NAME = "internet_search"
const DOMAIN_ROOT = path.join(process.cwd(), "src", "ai", "knowledge-domains", DOMAIN_NAME)

const resolveDomainPath = (suffix: string) => path.join(DOMAIN_ROOT, `${DOMAIN_NAME}_${suffix}`)

// TODO: Use internetSearchQuery for additional context-aware search
/* const internetSearchQuery = async (input: string, context?: unknown) => {
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

  domainRegistry.registerDomain({
    name: INTERNET_SEARCH_DOMAIN,
    displayName: "Internet Search",
    description: "Web search capabilities, information retrieval, and research",
    atomicLevel: "organ",
    modules: [],
    seedDataPath: resolveDomainPath("seeds"),
    learnedDataPath: resolveDomainPath("learned"),
    weightsPath: resolveDomainPath("weights"),
    enabled: true,
  })
}

void internetSearchInit()

export default internetSearchInit
