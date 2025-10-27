/**
 * File: src/ai/knowledge_retrieval/webSearchAPIConnector.ts
 * Purpose: Web search connector - returns empty results in preview environment
 * In production, this would connect to a real search API
 */

export interface WebResult {
  id: string
  title: string
  snippet: string
  url?: string
}

export const webSearch = async (query: string, limit = 5): Promise<WebResult[]> => {
  // In preview environment, return empty results
  // In production, this would call an external search API (Google, Bing, etc.)
  return []
}

export const searchWeb = webSearch
