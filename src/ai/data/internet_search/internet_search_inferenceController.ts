/**
 * File: src/ai/data/internet_search/internet_search_inferenceController.ts
 * Purpose: Main inference controller for internet search domain - orchestrates query parsing, expansion, ranking, and result summarization
 * Depends on:
 *   - src/ai/search-queries/queryParser.ts
 *   - src/ai/search-queries/queryExpander.ts
 *   - src/ai/search-queries/queryRanker.ts
 *   - src/ai/search-engine/resultSummarizer.ts
 *   - src/ai/shared/tools/urlLookup.ts
 *   - src/ai/knowledge_retrieval/webSearchAPIConnector.ts
 * Depended on by: src/ai/orchestrator/orchestrator.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { parseQuery } from "../../search-queries/queryParser"
import { expandQuery } from "../../search-queries/queryExpander"
import { rankResults } from "../../search-queries/queryRanker"
import { summarizeResults } from "../../search-engine/resultSummarizer"
import { getSearchEngines, searchSources } from "../../shared/tools/urlLookup"
import { INTERNET_SEARCH_DOMAIN } from "./internet_search_constants"
import { searchWeb } from "../../knowledge_retrieval/webSearchAPIConnector"

/**
 * Parse HTML content and extract readable text snippets
 * Removes HTML tags, scripts, styles, and extracts meaningful content
 */
function parseHTMLToText(html: string): string {
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
  text = text.replace(/<[^>]+>/g, " ")
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  text = text.replace(/\s+/g, " ").trim()
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 50)
  return sentences.slice(0, 3).join(". ") + (sentences.length > 0 ? "." : "")
}

export async function internetSearchRunInference(
  input: string,
  context?: any,
): Promise<{ response: string; confidence?: number }> {
  const lowerInput = input.toLowerCase()
  const inferenceResults = context?.inferenceResults
  const tokens = context?.tokens || []

  let confidence = 0
  if (Array.isArray(inferenceResults)) {
    const ownResult = inferenceResults.find((r) => r.domain === "internet_search")
    confidence = ownResult?.confidence || 0
  } else if (inferenceResults?.confidence) {
    confidence = inferenceResults.confidence
  }

  console.log(`[v0] ${INTERNET_SEARCH_DOMAIN} inference confidence:`, confidence)

  if (confidence < 0.1) {
    return {
      response: null as any,
      confidence: 0,
    }
  }

  const parsedQuery = parseQuery(input)
  console.log("[v0] Parsed query:", parsedQuery)

  if (
    lowerInput.includes("search") ||
    lowerInput.includes("find") ||
    lowerInput.includes("lookup") ||
    lowerInput.includes("latest") ||
    lowerInput.includes("what is") ||
    lowerInput.includes("who is") ||
    lowerInput.includes("where is") ||
    lowerInput.includes("when is") ||
    lowerInput.includes("how to") ||
    parsedQuery.intent === "informational"
  ) {
    const searchEngines = getSearchEngines()
    console.log(`[v0] Available search engines: ${searchEngines.map((e) => e.name).join(", ")}`)

    try {
      console.log("[v0] Attempting internet search via URL lookup...")
      const urlSearchResults = await searchSources(INTERNET_SEARCH_DOMAIN, input)

      if (urlSearchResults.length > 0 && !urlSearchResults[0].includes("CORS blocked")) {
        const parsedResults = urlSearchResults
          .map((html) => {
            const engineMatch = html.match(/From (\w+):/)
            const engine = engineMatch ? engineMatch[1] : "Unknown"
            const text = parseHTMLToText(html)
            if (text.length > 100) {
              return `**${engine}**: ${text.substring(0, 300)}...`
            }
            return null
          })
          .filter((result) => result !== null)

        if (parsedResults.length > 0) {
          return {
            response:
              `**Search Results:**\n\n${parsedResults.join("\n\n")}\n\n` +
              `(Searched via: ${searchEngines.map((e) => e.name).join(", ")}, ` +
              `processed ${tokens.length} tokens, confidence: ${(confidence * 100).toFixed(1)}%)`,
            confidence: Math.max(confidence, 0.5),
          }
        }
      }
    } catch (error) {
      console.log("[v0] URL lookup search failed:", error)
    }

    try {
      const expandedQueries = expandQuery(input)
      console.log("[v0] Expanded queries:", expandedQueries)

      const results = await searchWeb(expandedQueries[0], 5)

      if (results && results.length > 0) {
        const rankedResults = rankResults(results, parsedQuery)
        const snippets = rankedResults.slice(0, 3).map((r) => r.snippet)
        const summary = summarizeResults(snippets, input)

        const resultText = rankedResults
          .slice(0, 3)
          .map(
            (r, i) =>
              `${i + 1}. **${r.title}** (relevance: ${r.score?.toFixed(1)})\n   ${r.snippet}${r.url ? `\n   Source: ${r.url}` : ""}`,
          )
          .join("\n\n")

        return {
          response:
            `**Summary**: ${summary.summary}\n\n` +
            `**Detailed Results**:\n${resultText}\n\n` +
            `(Processed ${tokens.length} tokens, confidence: ${(confidence * 100).toFixed(1)}%, ` +
            `query intent: ${parsedQuery.intent})`,
          confidence: Math.max(confidence, summary.confidence, 0.5),
        }
      }
    } catch (error) {
      console.log("[v0] Web search failed:", error)
    }

    return {
      response:
        `Search capability available. Available engines: ${searchEngines.map((e) => e.name).join(", ")}\n\n` +
        `(Query analysis: ${parsedQuery.keywords.length} keywords, intent: ${parsedQuery.intent}, ` +
        `confidence: ${(confidence * 100).toFixed(1)}%)`,
      confidence,
    }
  }

  return {
    response: null as any,
    confidence: 0,
  }
}
