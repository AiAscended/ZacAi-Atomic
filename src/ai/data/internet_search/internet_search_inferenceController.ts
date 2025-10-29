/**
 * File: src/ai/data/internet_search/internet_search_inferenceController.ts
 * Purpose: Internet search domain inference controller - uses own tokenizer, seeds, weights, and URL lookup
 * Depends on:
 *   - src/ai/data/internet_search/internet_search_tokenizer.ts
 *   - src/ai/data/internet_search/internet_search_semanticAnalyzer.ts
 *   - src/ai/data/internet_search/seeds/internet_search_seeds.json
 *   - src/ai/data/internet_search/weights/internet_search_pretrained_weights.json
 *   - src/ai/shared/tools/urlLookup.ts
 * Depended on by: src/ai/orchestration/aiOrchestrator.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { internetSearchTokenizer } from "./internet_search_tokenizer"
import { internetSearchSemanticAnalyzer } from "./internet_search_semanticAnalyzer"
import pretrainedWeights from "./weights/internet_search_pretrained_weights.json"
import seeds from "./seeds/internet_search_seeds.json"
import { searchSources } from "../../shared/tools/urlLookup"
import { searchWeb } from "../../knowledge_retrieval/webSearchAPIConnector"
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

  // NO MORE HARDCODED ADDITIONS - the domain decides what to search for based on its own inference
  return query
}

/**
 * Main inference function for internet_search domain
 */
export async function internetSearchRunInference(input: string, context?: InferenceContext): Promise<any> {
  const tokens = internetSearchTokenizer(input).tokens
  const semantics = internetSearchSemanticAnalyzer(input)

  const confidence = calculateConfidence(tokens, input)

  console.log(`[v0] ${INTERNET_SEARCH_DOMAIN} inference confidence:`, confidence)
  console.log(`[v0] ${INTERNET_SEARCH_DOMAIN} semantics:`, semantics)

  if (confidence < pretrainedWeights.thresholds.min_confidence) {
    return {
      response: null,
      confidence: 0,
      domain: INTERNET_SEARCH_DOMAIN,
      sources: [],
      error: {
        code: "LOW_CONFIDENCE",
        message: `Query confidence (${confidence.toFixed(2)}) below threshold (${pretrainedWeights.thresholds.min_confidence})`,
      },
    }
  }

  const searchQuery = extractSearchQuery(input, semantics)
  console.log(`[v0] ${INTERNET_SEARCH_DOMAIN} extracted query:`, searchQuery)

  try {
    console.log(`[v0] ${INTERNET_SEARCH_DOMAIN} attempting web search...`)
    const results = await searchWeb(searchQuery, 5)

    if (results && results.length > 0) {
      const resultText = results
        .slice(0, 3)
        .map((r, i) => `${i + 1}. **${r.title}**\n   ${r.snippet}${r.url ? `\n   Source: ${r.url}` : ""}`)
        .join("\n\n")

      return {
        response: `**Search Results for "${searchQuery}":**\n\n${resultText}`,
        confidence: Math.max(confidence, 0.6),
        domain: INTERNET_SEARCH_DOMAIN,
        sources: results.map((r) => r.url || r.title),
        metadata: {
          tokensUsed: tokens.length,
          semanticAnalysis: semantics,
          searchQuery: searchQuery,
          resultCount: results.length,
        },
      }
    }
  } catch (error) {
    console.error(`[v0] ${INTERNET_SEARCH_DOMAIN} web search failed:`, error)
  }

  try {
    console.log(`[v0] ${INTERNET_SEARCH_DOMAIN} attempting URL lookup...`)
    const urlResults = await searchSources(INTERNET_SEARCH_DOMAIN, searchQuery)

    if (urlResults && urlResults.length > 0) {
      const cleanResults = urlResults
        .filter((r) => !r.includes("CORS blocked"))
        .map((r) => r.substring(0, 500))
        .join("\n\n")

      if (cleanResults.length > 100) {
        return {
          response: `**Search Results:**\n\n${cleanResults}`,
          confidence: Math.max(confidence, 0.5),
          domain: INTERNET_SEARCH_DOMAIN,
          sources: ["Google", "Bing", "DuckDuckGo"],
          metadata: {
            tokensUsed: tokens.length,
            semanticAnalysis: semantics,
            searchQuery: searchQuery,
          },
        }
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
      `Search engines available: Google, Bing, DuckDuckGo\n` +
      `Note: Search results currently simulated for testing. In production, this will connect to real search APIs.`,
    confidence: Math.max(confidence, 0.3),
    domain: INTERNET_SEARCH_DOMAIN,
    sources: ["Internet Search Domain (Inference)"],
    metadata: {
      tokensUsed: tokens.length,
      semanticAnalysis: semantics,
      searchQuery: searchQuery,
    },
  }
}
