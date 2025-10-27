/**
 * File: src/ai/search-engine/resultSummarizer.ts
 * Purpose: Summarize search results into concise answers
 * Depends on: None (atomic module)
 * Depended on by: src/ai/search-engine/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

export interface SummaryResult {
  summary: string
  sources: string[]
  confidence: number
}

/**
 * Summarize multiple search results into a concise answer
 * @param results - Array of search result snippets
 * @param query - Original search query
 * @returns Summarized answer with sources
 */
export function summarizeResults(results: string[], query: string): SummaryResult {
  if (results.length === 0) {
    return {
      summary: `No results found for: ${query}`,
      sources: [],
      confidence: 0,
    }
  }

  // Extract key sentences from results
  const sentences: string[] = []
  for (const result of results.slice(0, 3)) {
    const resultSentences = result
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20 && s.length < 200)
    sentences.push(...resultSentences.slice(0, 2))
  }

  // Create summary from top sentences
  const summary = sentences.slice(0, 3).join(". ") + "."

  return {
    summary,
    sources: results.slice(0, 3).map((_, i) => `Source ${i + 1}`),
    confidence: Math.min(0.9, results.length * 0.2),
  }
}
