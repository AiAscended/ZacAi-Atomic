/**
 * File: src/ai/orchestration/knowledgeRetriever.ts
 * Purpose: Retrieves relevant knowledge from multiple sources
 * NO API SEARCH - Uses only local KB, cache, and web scraping
 */

import { DocumentCache } from "../knowledge_retrieval/documentCache"
import { DocumentRetrieverRanker } from "../knowledge_retrieval/documentRetrieverRanker"
import { LocalKBLoader } from "../knowledge_retrieval/localKBLoader"
import { searchWikipedia, searchAndScrapeGoogle } from "../shared/tools/webScraper"

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

export class KnowledgeRetriever {
  private cache: DocumentCache
  private retriever: DocumentRetrieverRanker
  private kbLoader: LocalKBLoader

  constructor() {
    this.cache = new DocumentCache(1000)
    this.retriever = new DocumentRetrieverRanker()
    this.kbLoader = new LocalKBLoader()
  }

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
      results.documents = ranked.slice(0, 5)
    }

    if (useWeb) {
      try {
        // Try Wikipedia first for knowledge queries
        const wikiResult = await searchWikipedia(query)
        if (wikiResult) {
          results.webResults.push({
            title: wikiResult.title,
            snippet: wikiResult.snippet,
            url: wikiResult.url,
          })
        }

        // Then try Google scraping
        if (results.webResults.length === 0) {
          const googleResults = await searchAndScrapeGoogle(query, 3)
          results.webResults.push(...googleResults)
        }
      } catch (error) {
        console.error("[KnowledgeRetriever] Web scraping failed:", error)
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

  public clearCache(): void {
    this.cache.clear()
  }
}

export const knowledgeRetriever = new KnowledgeRetriever()
