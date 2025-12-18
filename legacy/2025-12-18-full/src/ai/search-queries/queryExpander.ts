/**
 * File: src/ai/search-queries/queryExpander.ts
 * Purpose: Expand search queries with synonyms and related terms
 * Depends on: None (atomic module)
 * Depended on by: src/ai/search-queries/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Expand a query with synonyms and related terms
 * @param query - Original search query
 * @returns Expanded query variations
 */
export function expandQuery(query: string): string[] {
  const expansions: string[] = [query];
  const lowerQuery = query.toLowerCase();

  // Common synonym mappings
  const synonyms: Record<string, string[]> = {
    ai: ["artificial intelligence", "machine learning", "neural network"],
    search: ["find", "lookup", "query", "discover"],
    flight: ["flights", "airline", "aviation", "air travel"],
    calculate: ["compute", "evaluate", "solve", "determine"],
    internet: ["web", "online", "www", "net"],
    latest: ["newest", "recent", "current", "up-to-date"],
    meaning: ["definition", "explanation", "what is", "describe"],
  };

  // Add synonym variations
  for (const [word, syns] of Object.entries(synonyms)) {
    if (lowerQuery.includes(word)) {
      for (const syn of syns) {
        expansions.push(query.replace(new RegExp(word, "gi"), syn));
      }
    }
  }

  return expansions.slice(0, 5); // Limit to 5 variations
}
