/**
 * File: src/ai/knowledge-domains/internet_search/internet_search_inferenceController.ts
 * Purpose: Internet search domain inference controller - uses web scraping only (NO API)
 * Depends on:
 *   - src/ai/knowledge-domains/internet_search/internet_search_tokenizer.ts
 *   - src/ai/knowledge-domains/internet_search/internet_search_semanticAnalyzer.ts
 *   - src/ai/knowledge-domains/internet_search/seeds/internet_search_seeds.json
 *   - src/ai/knowledge-domains/internet_search/weights/internet_search_pretrained_weights.json
 *   - src/ai/data/url_lookup.ts
 *   - src/ai/shared/tools/webScraper.ts
 * Depended on by: src/ai/orchestration/aiOrchestrator.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { internetSearchTokenizer } from "./internet_search_tokenizer"
import { internetSearchSemanticAnalyzer } from "./internet_search_semanticAnalyzer"
import pretrainedWeights from "./internet_search_weights/internet_search_pretrained_weights.json"
import seeds from "./internet_search_seeds/internet_search_seeds.json"
import { normalizeThresholds, normalizeVocabularyWeights, type ThresholdLike } from "../utils/embeddingUtils"
import { findSources } from "../url_lookup"
import { scrapeURL, type ScrapedContent } from "../../shared/tools/webScraper"
import { INTERNET_SEARCH_DOMAIN } from "./internet_search_constants"

type SemanticAnalysis = ReturnType<typeof internetSearchSemanticAnalyzer>
type DomainSource = ReturnType<typeof findSources>[number]

interface SearchPattern {
  pattern: string
  weight: number
}

interface InternetSearchSeeds {
  vocabulary: Record<string, number>
  thresholds?: ThresholdLike
  patterns?: SearchPattern[]
}

interface InternetSearchPretrainedWeights {
  thresholds?: ThresholdLike
}

interface InferenceContext {
  tokens?: string[]
  inferenceResults?: Record<string, unknown>
  sentiment?: string
  slots?: Record<string, string>
  userProfile?: {
    preferredEngine?: string
  }
}

interface SearchResult {
  title: string
  snippet: string
  url: string
  source: string
}

interface InternetSearchInferenceMetadata {
  tokensUsed: number
  semanticAnalysis: SemanticAnalysis
  searchQuery: string
  resultCount: number
  method: "url_lookup_scraping" | "inference_only"
  preferredEngine?: string
}

interface InternetSearchInferenceResponse {
  response: string | null
  confidence: number
  domain: string
  sources: string[]
  error?: {
    code: string
    message: string
  }
  metadata: InternetSearchInferenceMetadata
}

/**
 * Calculate confidence using pretrained weights and token analysis
 */
const SEEDS = seeds as InternetSearchSeeds
const PRETRAINED = pretrainedWeights as InternetSearchPretrainedWeights
const VOCABULARY = normalizeVocabularyWeights(SEEDS.vocabulary ?? {}, 0.7)
const THRESHOLDS = normalizeThresholds(PRETRAINED.thresholds, SEEDS.thresholds)
const PATTERNS = SEEDS.patterns ?? []

function calculateConfidence(tokens: string[], input: string): number {
  const lowerInput = input.toLowerCase()

  let tokenScore = 0
  let matchCount = 0

  // Calculate token-based confidence
  for (const token of tokens) {
    const lowerToken = token.toLowerCase()
    if (VOCABULARY[lowerToken]) {
      tokenScore += VOCABULARY[lowerToken]
      matchCount++
    }
  }

  const avgTokenScore = matchCount > 0 ? tokenScore / matchCount : 0

  // Semantic pattern matching
  let semanticScore = 0
  for (const patternObj of PATTERNS) {
    if (lowerInput.includes(patternObj.pattern)) {
      semanticScore += patternObj.weight
    }
  }

  semanticScore = Math.min(semanticScore / 2, 1.0)

  // Combine scores
  const finalConfidence = avgTokenScore * THRESHOLDS.tokenMatchWeight + semanticScore * THRESHOLDS.semanticWeight

  return Math.min(finalConfidence, 1.0)
}

/**
 * Extract search query from user input
 */
function extractSearchQuery(input: string, semantics: SemanticAnalysis): string {
  // Simply clean up the query by removing common prefixes
  let query = input
    .replace(/^(can you |could you |please |would you )/i, "")
    .replace(/^(search for |find |lookup |google |tell me about )/i, "")
    .replace(/\?$/g, "")
    .trim()

  if (!query && Array.isArray((semantics as { keywords?: string[] }).keywords)) {
    const keywords = (semantics as { keywords?: string[] }).keywords ?? []
    query = keywords.slice(0, 3).join(" ")
  }

  return query
}

/**
 * Main inference function for internet_search domain
 * NO PRIORITY - inference decides which search engine to use
 */
export async function internetSearchRunInference(
  input: string,
  context?: InferenceContext,
): Promise<InternetSearchInferenceResponse> {
  const { tokens } = internetSearchTokenizer(input)
  const semantics = internetSearchSemanticAnalyzer(input)

  const confidence = calculateConfidence(tokens, input)

  console.log(`[v0] ${INTERNET_SEARCH_DOMAIN} inference confidence:`, confidence)
  console.log(`[v0] ${INTERNET_SEARCH_DOMAIN} semantics:`, semantics)

  if (confidence < 0.01) {
    return {
      response: null,
      confidence: 0,
      domain: INTERNET_SEARCH_DOMAIN,
      sources: [],
      error: {
        code: "LOW_CONFIDENCE",
        message: `Query confidence (${confidence.toFixed(2)}) below threshold (0.01)`,
      },
      metadata: {
        tokensUsed: tokens.length,
        semanticAnalysis: semantics,
        searchQuery: "",
        resultCount: 0,
        method: "inference_only",
        preferredEngine: context?.userProfile?.preferredEngine,
      },
    }
  }

  const searchQuery = extractSearchQuery(input, semantics)
  console.log(`[v0] ${INTERNET_SEARCH_DOMAIN} extracted query:`, searchQuery)

  const searchEngines = prioritizeSearchEngines(
    findSources(INTERNET_SEARCH_DOMAIN),
    context?.userProfile?.preferredEngine,
  )
  const results: SearchResult[] = []

  for (const engine of searchEngines) {
    try {
      const searchUrl = buildEngineSearchUrl(engine, searchQuery)
      if (!searchUrl) continue

      console.log(`[v0] ${INTERNET_SEARCH_DOMAIN} trying ${engine.name} at: ${searchUrl}`)

      const content = await scrapeURL(searchUrl)

      if (content && content.snippet.length > 50) {
        results.push(mapScrapeToResult(content, engine.name))
      }
    } catch (error) {
      console.error(`[v0] ${INTERNET_SEARCH_DOMAIN} ${engine.name} failed:`, error)
    }
  }

  if (results.length > 0) {
    const resultText = results
      .map((r, i) => `**${i + 1}. ${r.title}** (${r.source})\n${r.snippet}\n[Source](${r.url})`)
      .join("\n\n")

    return {
      response: `**Search Results:**\n\n${resultText}`,
      confidence: Math.max(confidence, 0.7),
      domain: INTERNET_SEARCH_DOMAIN,
      sources: results.map((r) => r.url),
      metadata: {
        tokensUsed: tokens.length,
        semanticAnalysis: semantics,
        searchQuery,
        resultCount: results.length,
        method: "url_lookup_scraping",
        preferredEngine: context?.userProfile?.preferredEngine,
      },
    }
  }

  return {
    response:
      `**Internet Search Domain**\n\n` +
      `Query: "${searchQuery}"\n` +
      `Type: ${semantics.queryType}\n\n` +
      `I attempted to search using domain sources (Google, Bing, DuckDuckGo) but encountered technical limitations. ` +
      `The system uses autonomous web crawling (no API keys required).`,
    confidence: Math.max(confidence, 0.4),
    domain: INTERNET_SEARCH_DOMAIN,
    sources: ["Internet Search Domain (Inference)"],
    metadata: {
      tokensUsed: tokens.length,
      semanticAnalysis: semantics,
      searchQuery,
      resultCount: 0,
      method: "inference_only",
      preferredEngine: context?.userProfile?.preferredEngine,
    },
  }
}

export default internetSearchRunInference;

function buildEngineSearchUrl(engine: DomainSource, query: string): string | null {
  if (engine.searchPath) {
    return `${engine.url}${engine.searchPath}${encodeURIComponent(query)}`
  }
  if (engine.url.endsWith("=") || engine.url.endsWith("/")) {
    return `${engine.url}${encodeURIComponent(query)}`
  }
  return null
}

function mapScrapeToResult(content: ScrapedContent, source: string): SearchResult {
  return {
    title: content.title,
    snippet: content.snippet,
    url: content.url,
    source,
  }
}

function prioritizeSearchEngines(sources: DomainSource[], preferredEngine?: string): DomainSource[] {
  if (!preferredEngine) return sources
  return [...sources].sort((a, b) => {
    if (a.name === preferredEngine) return -1
    if (b.name === preferredEngine) return 1
    return 0
  })
}
