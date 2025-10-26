/**
 * File: src/ai/knowledge_retrieval/localKBLoader.ts
 * Purpose: Load local knowledge base documents from a directory (MVP simulated loader).
 * Dependencies: `documentCache` for caching loaded docs.
 */
import { DocumentCache } from './documentCache';

export interface KBDocument {
  id: string;
  text: string;
  title?: string;
}

export const loadLocalKB = async (pathOrId: string): Promise<KBDocument[]> => {
  // In MVP we simulate loading: if pathOrId matches cache return, otherwise return a small sample
  const cached = DocumentCache.get<KBDocument[]>(pathOrId);
  if (cached) return cached as KBDocument[];
  const docs: KBDocument[] = [
    {
      id: `${pathOrId}-doc1`,
      title: 'Sample KB Doc 1',
      text: 'This is a sample local knowledge base document about APIs.',
    },
    {
      id: `${pathOrId}-doc2`,
      title: 'Sample KB Doc 2',
      text: 'This document contains notes on deployment and configuration.',
    },
  ];
  DocumentCache.set(pathOrId, docs);
  return docs;
};
