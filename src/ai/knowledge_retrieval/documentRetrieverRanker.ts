/**
 * File: src/ai/knowledge_retrieval/documentRetrieverRanker.ts
 * Purpose: Very small retriever+ranker using TF-like scoring for MVP.
 */

import type { KBDocument } from "./localKBLoader"

const tokenize = (t: string) => t.toLowerCase().split(/\W+/).filter(Boolean)

const scoreDoc = (queryTokens: string[], doc: KBDocument) => {
  const dt = tokenize(doc.text + " " + (doc.title ?? ""))
  const freqs = dt.reduce<Record<string, number>>((acc, w) => {
    acc[w] = (acc[w] || 0) + 1
    return acc
  }, {})
  let score = 0
  for (const qt of queryTokens) score += freqs[qt] || 0
  return score
}

export interface RankedDocument {
  doc: KBDocument
  score: number
}

export const retrieveAndRank = (query: string, docs: KBDocument[], topK = 5): RankedDocument[] => {
  const qtokens = tokenize(query)
  const scored = docs.map((doc) => ({ doc, score: scoreDoc(qtokens, doc) }))
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK)
}

export class DocumentRetrieverRanker {
  retrieve(query: string, docs: KBDocument[], topK = 5): KBDocument[] {
    return retrieveAndRank(query, docs, topK).map((entry) => entry.doc)
  }

  rank(query: string, docs: KBDocument[], topK = 5): RankedDocument[] {
    return retrieveAndRank(query, docs, topK)
  }
}
