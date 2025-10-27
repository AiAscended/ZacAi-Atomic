/**
 * File: src/ai/orchestration/knowledgeRetriever.ts
 * Purpose: Retrieves relevant knowledge from multiple sources including
 * local knowledge base, document cache, and web search.
 *
 * Dependencies:
 * - src/ai/knowledge_retrieval/documentCache.ts
 * - src/ai/knowledge_retrieval/documentRetrieverRanker.ts
 * - src/ai/knowledge_retrieval/localKBLoader.ts
 * - src/ai/knowledge_retrieval/webSearchAPIConnector.ts
 *
 * Depended on by:
 * - src/ai/orchestration/aiOrchestrator.ts
 */

import { DocumentCache } from "../knowledge_retrieval/documentCache"
import { DocumentRetrieverRanker } from "../knowledge_retrieval/documentRetrieverRanker"
import { LocalKBLoader } from "../knowledge_retrieval/localKBLoader"
import { searchWeb } from "../knowledge_retrieval/webSearchAPIConnector"

/**
 * Retrieved knowledge with sources
 */
export interface RetrievedKnowledge {
  documents: Array<{
    content: string
    source: string
    relevance: number
  }>
  webResults: Array<{
    title: string
    snippet: string
    url: string
  }>
  cacheHits: number
  totalSources: number
}

/**
 * Knowledge Retriever - Fetches relevant information from multiple sources
 */
export class KnowledgeRetriever {
  private cache: DocumentCache
  private retriever: DocumentRetrieverRanker
  private kbLoader: LocalKBLoader

  constructor() {
    this.cache = new DocumentCache(1000)
    this.retriever = new DocumentRetrieverRanker()
    this.kbLoader = new LocalKBLoader()
  }

  /**
   * Retrieve knowledge for a query
   */
  public async retrieve(query: string, domains: string[], useWeb = true): Promise<RetrievedKnowledge> {
    const results: RetrievedKnowledge = {
      documents: [],
      webResults: [],
      cacheHits: 0,
      totalSources: 0,
    }

    // Step 1: Check cache
    const cached = this.cache.get(query)
    if (cached) {
      results.cacheHits++
      results.documents.push({
        content: cached.content,
        source: "cache",
        relevance: 1.0,
      })
    }

    // Step 2: Load from local knowledge base
    for (const domain of domains) {
      const kbDocs = await this.kbLoader.load(domain, query)
      results.documents.push(...kbDocs.map((doc) => ({ ...doc, source: `kb:${domain}` })))
    }

    // Step 3: Retrieve and rank documents
    if (results.documents.length > 0) {
      const ranked = this.retriever.rank(query, results.documents)
      results.documents = ranked.slice(0, 5) // Top 5 documents
    }

    // Step 4: Web search if needed
    if (useWeb) {
      try {
        const webResults = await searchWeb(query)
        results.webResults = webResults.map((r) => ({
          title: r.title,
          snippet: r.snippet || "",
          url: r.url || "",
        }))
      } catch (error) {
        console.error("[KnowledgeRetriever] Web search failed:", error)
      }
    }

    // Step 5: Cache results
    if (results.documents.length > 0) {
      this.cache.set(query, {
        content: results.documents[0].content,
        timestamp: Date.now(),
      })
    }

    results.totalSources = results.documents.length + results.webResults.length

    return results
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear()
  }
}

// Export singleton
export const knowledgeRetriever = new KnowledgeRetriever()
