/**
 * File: src/ai/orchestration/knowledgeRetriever.ts
 * Purpose: Retrieves relevant knowledge from multiple sources
 * NO API SEARCH - Uses only local KB, cache, and domain-specific URL lookup
 */

import { DocumentCache } from "../knowledge_retrieval/documentCache";
import { DocumentRetrieverRanker } from "../knowledge_retrieval/documentRetrieverRanker";
import { LocalKBLoader } from "../knowledge_retrieval/localKBLoader";
import { findSources } from "../shared/tools/urlLookup";
import { scrapeURL } from "../shared/tools/webScraper";

export interface RetrievedKnowledge {
  documents: Array<{
    content: string;
    source: string;
    relevance: number;
  }>;
  webResults: Array<{
    title: string;
    snippet: string;
    url: string;
  }>;
  cacheHits: number;
  totalSources: number;
}

export class KnowledgeRetriever {
  private cache: typeof DocumentCache
  private retriever: DocumentRetrieverRanker
  private kbLoader: LocalKBLoader

  constructor() {
    this.cache = DocumentCache
    this.retriever = new DocumentRetrieverRanker()
    this.kbLoader = new LocalKBLoader()
  }

  public async retrieve(
    query: string,
    domains: string[],
    useWeb = true,
  ): Promise<RetrievedKnowledge> {
    const results: RetrievedKnowledge = {
      documents: [],
      webResults: [],
      cacheHits: 0,
      totalSources: 0,
    };

    // Step 1: Check cache
    const cached = this.cache.get<{ content: string }>(query)
    if (cached) {
      results.cacheHits++;
      results.documents.push({
        content: cached?.content ?? '',
        source: "cache",
        relevance: cached.relevance || 1.0,
      })
    }

    // Step 2: Load from local knowledge base
    const allKBDocs: Array<{ doc: import("../knowledge_retrieval/localKBLoader").KBDocument; domain: string }> = []
    for (const domain of domains) {
      const kbDocs = await this.kbLoader.load(domain)
      allKBDocs.push(...kbDocs.map((doc) => ({ doc, domain })))
    }

    // Step 3: Retrieve and rank documents
    if (allKBDocs.length > 0) {
      const rankedDocs = this.retriever.retrieve(query, allKBDocs.map(item => item.doc), 5)
      results.documents.push(...rankedDocs.map((doc, idx) => ({
        content: doc.text,
        relevance: 1.0 - (idx * 0.1), // Decreasing relevance
        source: `kb:${allKBDocs.find(item => item.doc.id === doc.id)?.domain || 'unknown'}`,
      })))
    }

    if (useWeb) {
      try {
        // Let each domain handle its own source lookups
        for (const domain of domains) {
          const domainSources = findSources(domain);

          for (const source of domainSources.slice(0, 2)) {
            // Limit to 2 sources per domain
            const searchUrl = source.searchPath
              ? `${source.url}${source.searchPath}${encodeURIComponent(query)}`
              : source.url;

            const content = await scrapeURL(searchUrl);

            if (content && content.snippet.length > 50) {
              results.webResults.push({
                title: content.title,
                snippet: content.snippet,
                url: content.url,
              });
            }
          }
        }
      } catch (error) {
        console.error("[KnowledgeRetriever] Web scraping failed:", error);
      }
    }

    // Step 5: Cache results
    if (results.documents.length > 0) {
      this.cache.set(query, {
        content: results.documents[0].content,
        timestamp: Date.now(),
      });
    }

    results.totalSources = results.documents.length + results.webResults.length;

    return results;
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

export const knowledgeRetriever = new KnowledgeRetriever();
