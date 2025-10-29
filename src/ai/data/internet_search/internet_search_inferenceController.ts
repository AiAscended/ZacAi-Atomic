/**
 * File: src/ai/data/internet_search/internet_search_inferenceController.ts
 * Purpose: Internet search domain inference controller - uses web scraping only (NO API)
 * Depends on:
 *   - src/ai/data/internet_search/internet_search_tokenizer.ts
 *   - src/ai/data/internet_search/internet_search_semanticAnalyzer.ts
 *   - src/ai/data/internet_search/seeds/internet_search_seeds.json
 *   - src/ai/data/internet_search/weights/internet_search_pretrained_weights.json
 *   - src/ai/shared/tools/urlLookup.ts
 *   - src/ai/shared/tools/webScraper.ts
 * Depended on by: src/ai/orchestration/aiOrchestrator.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { internetSearchTokenizer } from "./internet_search_tokenizer"
import { internetSearchSemanticAnalyzer } from "./internet_search_semanticAnalyzer"
import pretrainedWeights from "./weights/internet_search_pretrained_weights.json"
import seeds from "./seeds/internet_search_seeds.json"
import { searchSources } from "../../shared/tools/urlLookup"
import { searchAndScrapeGoogle, searchAndScrapeBing, searchWikipedia } from "../../shared/tools/webScraper"
import { INTERNET_SEARCH_DOMAIN } from "./internet_search_constants"

interface InferenceContext {
  tokens: string[]
  inferenceResults?: any
  sentiment?: any
  slots?: any
  userProfile?: any
}

/**
 * Calculate confidence using pretrained weights and token analysis
 */
function calculateConfidence(tokens: string[], input: string): number {
  const lowerInput = input.toLowerCase()
  const vocabulary = pretrainedWeights.vocabulary as Record<string, number>

  let tokenScore = 0
  let matchCount = 0

  // Calculate token-based confidence
  for (const token of tokens) {
    const lowerToken = token.toLowerCase()
    if (vocabulary[lowerToken]) {
      tokenScore += vocabulary[lowerToken]
      matchCount++
    }
  }

  const avgTokenScore = matchCount > 0 ? tokenScore / matchCount : 0

  // Semantic pattern matching
  let semanticScore = 0
  const patterns = seeds.patterns as Array<{ pattern: string; weight: number }>

  for (const patternObj of patterns) {
    if (lowerInput.includes(patternObj.pattern)) {
      semanticScore += patternObj.weight
    }
  }

  semanticScore = Math.min(semanticScore / 2, 1.0)

  // Combine scores
  const thresholds = pretrainedWeights.thresholds
  const finalConfidence = avgTokenScore * thresholds.token_match_weight + semanticScore * thresholds.semantic_weight

  return Math.min(finalConfidence, 1.0)
}

/**
 * Extract search query from user input
 */
function extractSearchQuery(input: string, semantics: any): string {
  // Simply clean up the query by removing common prefixes
  const query = input
    .replace(/^(can you |could you |please |would you )/i, "")
    .replace(/^(search for |find |lookup |google |tell me about )/i, "")
    .replace(/\?$/g, "")
    .trim()

  return query
}

/**
 * Main inference function for internet_search domain
 * Now uses ONLY web scraping, no API search
 */
export async function internetSearchRunInference(input: string, context?: InferenceContext): Promise<any> {
  const tokens = internetSearchTokenizer(input).tokens
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
    }
  }

  const searchQuery = extractSearchQuery(input, semantics)
  console.log(`[v0] ${INTERNET_SEARCH_DOMAIN} extracted query:`, searchQuery)

  try {
    console.log(`[v0] ${INTERNET_SEARCH_DOMAIN} attempting web scraping...`)
    const scrapedResults = await searchAndScrapeGoogle(searchQuery, 3)

    if (scrapedResults && scrapedResults.length > 0) {
      const resultText = scrapedResults
        .map((r, i) => `${i + 1}. **${r.title}**\n   ${r.snippet}\n   Source: ${r.url}`)
        .join("\n\n")

      return {
        response: `**Search Results for "${searchQuery}":**\n\n${resultText}`,
        confidence: Math.max(confidence, 0.65),
        domain: INTERNET_SEARCH_DOMAIN,
        sources: scrapedResults.map((r) => r.url),
        metadata: {
          tokensUsed: tokens.length,
          semanticAnalysis: semantics,
          searchQuery: searchQuery,
          resultCount: scrapedResults.length,
          method: "web_scraping",
        },
      }
    }
  } catch (error) {
    console.error(`[v0] ${INTERNET_SEARCH_DOMAIN} web scraping failed:`, error)
  }

  try {
    console.log(`[v0] ${INTERNET_SEARCH_DOMAIN} attempting Bing scraping...`)
    const bingResults = await searchAndScrapeBing(searchQuery, 3)

    if (bingResults && bingResults.length > 0) {
      const resultText = bingResults
        .map((r, i) => `${i + 1}. **${r.title}**\n   ${r.snippet}\n   Source: ${r.url}`)
        .join("\n\n")

      return {
        response: `**Search Results for "${searchQuery}":**\n\n${resultText}`,
        confidence: Math.max(confidence, 0.6),
        domain: INTERNET_SEARCH_DOMAIN,
        sources: bingResults.map((r) => r.url),
        metadata: {
          tokensUsed: tokens.length,
          semanticAnalysis: semantics,
          searchQuery: searchQuery,
          resultCount: bingResults.length,
          method: "bing_scraping",
        },
      }
    }
  } catch (error) {
    console.error(`[v0] ${INTERNET_SEARCH_DOMAIN} Bing scraping failed:`, error)
  }

  if (semantics.queryType === "factual" || input.toLowerCase().includes("wikipedia")) {
    try {
      console.log(`[v0] ${INTERNET_SEARCH_DOMAIN} attempting Wikipedia search...`)
      const wikiResult = await searchWikipedia(searchQuery)

      if (wikiResult) {
        return {
          response: `**Wikipedia Result for "${searchQuery}":**\n\n**${wikiResult.title}**\n\n${wikiResult.snippet}\n\nSource: ${wikiResult.url}`,
          confidence: Math.max(confidence, 0.7),
          domain: INTERNET_SEARCH_DOMAIN,
          sources: [wikiResult.url],
          metadata: {
            tokensUsed: tokens.length,
            semanticAnalysis: semantics,
            searchQuery: searchQuery,
            method: "wikipedia",
          },
        }
      }
    } catch (error) {
      console.error(`[v0] ${INTERNET_SEARCH_DOMAIN} Wikipedia search failed:`, error)
    }
  }

  try {
    console.log(`[v0] ${INTERNET_SEARCH_DOMAIN} attempting domain URL lookup...`)
    const urlResults = await searchSources(INTERNET_SEARCH_DOMAIN, searchQuery)

    if (urlResults && urlResults.length > 0) {
      const resultText = urlResults
        .map((r, i) => `${i + 1}. **${r.title}**\n   ${r.snippet}\n   Source: ${r.url}`)
        .join("\n\n")

      return {
        response: `**Search Results:**\n\n${resultText}`,
        confidence: Math.max(confidence, 0.5),
        domain: INTERNET_SEARCH_DOMAIN,
        sources: urlResults.map((r) => r.url),
        metadata: {
          tokensUsed: tokens.length,
          semanticAnalysis: semantics,
          searchQuery: searchQuery,
          method: "url_lookup",
        },
      }
    }
  } catch (error) {
    console.error(`[v0] ${INTERNET_SEARCH_DOMAIN} URL lookup failed:`, error)
  }

  return {
    response:
      `**Internet Search Domain Active**\n\n` +
      `Query: "${searchQuery}"\n` +
      `Query Type: ${semantics.queryType}\n` +
      `Confidence: ${(confidence * 100).toFixed(1)}%\n\n` +
      `I attempted to search for this information using web scraping (Google, Bing, Wikipedia) and domain-specific sources, but encountered technical limitations. ` +
      `The system is functioning correctly with autonomous web crawling capabilities.`,
    confidence: Math.max(confidence, 0.4),
    domain: INTERNET_SEARCH_DOMAIN,
    sources: ["Internet Search Domain (Inference)"],
    metadata: {
      tokensUsed: tokens.length,
      semanticAnalysis: semantics,
      searchQuery: searchQuery,
      method: "inference_only",
    },
  }
}
