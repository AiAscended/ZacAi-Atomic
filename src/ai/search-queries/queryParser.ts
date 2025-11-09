/**
 * File: src/ai/search-queries/queryParser.ts
 * Purpose: Parse and analyze search queries to extract intent, keywords, and filters
 * Depends on: None (atomic module)
 * Depended on by: src/ai/search-queries/index.ts, src/ai/data/internet_search/internet_search_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

export interface ParsedQuery {
  originalQuery: string;
  keywords: string[];
  intent: "informational" | "navigational" | "transactional" | "local";
  filters: {
    site?: string;
    fileType?: string;
    dateRange?: { start?: Date; end?: Date };
    language?: string;
  };
  modifiers: {
    exact?: string[];
    exclude?: string[];
    or?: string[][];
  };
}

/**
 * Parse a search query into structured components
 * @param query - Raw search query string
 * @returns Parsed query with keywords, intent, and filters
 */
export function parseQuery(query: string): ParsedQuery {
  const parsed: ParsedQuery = {
    originalQuery: query,
    keywords: [],
    intent: "informational",
    filters: {},
    modifiers: { exact: [], exclude: [], or: [] },
  };

  let workingQuery = query;

  // Extract site filter (site:example.com)
  const siteMatch = workingQuery.match(/site:(\S+)/i);
  if (siteMatch) {
    parsed.filters.site = siteMatch[1];
    workingQuery = workingQuery.replace(siteMatch[0], "");
  }

  // Extract file type filter (filetype:pdf)
  const fileTypeMatch = workingQuery.match(/filetype:(\S+)/i);
  if (fileTypeMatch) {
    parsed.filters.fileType = fileTypeMatch[1];
    workingQuery = workingQuery.replace(fileTypeMatch[0], "");
  }

  // Extract exact phrases ("exact phrase")
  const exactMatches = workingQuery.match(/"([^"]+)"/g);
  if (exactMatches) {
    parsed.modifiers.exact = exactMatches.map((m) => m.replace(/"/g, ""));
    workingQuery = workingQuery.replace(/"[^"]+"/g, "");
  }

  // Extract exclusions (-word)
  const excludeMatches = workingQuery.match(/-(\w+)/g);
  if (excludeMatches) {
    parsed.modifiers.exclude = excludeMatches.map((m) => m.substring(1));
    workingQuery = workingQuery.replace(/-\w+/g, "");
  }

  // Extract keywords (remaining words)
  parsed.keywords = workingQuery
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  // Determine intent
  if (query.match(/\b(how|what|why|when|where|who)\b/i)) {
    parsed.intent = "informational";
  } else if (query.match(/\b(buy|purchase|price|shop|order)\b/i)) {
    parsed.intent = "transactional";
  } else if (query.match(/\b(near me|nearby|location|address)\b/i)) {
    parsed.intent = "local";
  } else if (query.match(/\b(go to|visit|website|homepage)\b/i)) {
    parsed.intent = "navigational";
  }

  return parsed;
}
