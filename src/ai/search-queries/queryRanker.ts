/**
 * File: src/ai/search-queries/queryRanker.ts
 * Purpose: Rank and score search results based on relevance
 * Depends on: src/ai/search-queries/queryParser.ts
 * Depended on by: src/ai/search-queries/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

import type { ParsedQuery } from "./queryParser";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  score?: number;
}

/**
 * Rank search results by relevance to query
 * @param results - Array of search results
 * @param parsedQuery - Parsed query object
 * @returns Ranked results with scores
 */
export function rankResults(
  results: SearchResult[],
  parsedQuery: ParsedQuery,
): SearchResult[] {
  return results
    .map((result) => ({
      ...result,
      score: calculateRelevanceScore(result, parsedQuery),
    }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));
}

/**
 * Calculate relevance score for a result
 */
function calculateRelevanceScore(
  result: SearchResult,
  query: ParsedQuery,
): number {
  let score = 0;
  const titleLower = result.title.toLowerCase();
  const snippetLower = result.snippet.toLowerCase();

  // Keyword matching in title (higher weight)
  for (const keyword of query.keywords) {
    if (titleLower.includes(keyword.toLowerCase())) {
      score += 3;
    }
    if (snippetLower.includes(keyword.toLowerCase())) {
      score += 1;
    }
  }

  // Exact phrase matching (highest weight)
  for (const exact of query.modifiers.exact || []) {
    if (titleLower.includes(exact.toLowerCase())) {
      score += 5;
    }
    if (snippetLower.includes(exact.toLowerCase())) {
      score += 2;
    }
  }

  // Penalty for excluded terms
  for (const exclude of query.modifiers.exclude || []) {
    if (
      titleLower.includes(exclude.toLowerCase()) ||
      snippetLower.includes(exclude.toLowerCase())
    ) {
      score -= 10;
    }
  }

  return Math.max(0, score);
}
