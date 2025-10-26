/**
 * File: src/ai/knowledge_retrieval/queryRewriter.ts
 * Purpose: Small query rewriter to expand queries using synonyms (MVP).
 */

const synonyms: Record<string, string[]> = {
  purchase: ['buy', 'acquire'],
  error: ['bug', 'failure', 'issue'],
};

export const rewriteQuery = (q: string) => {
  const tokens = q.split(/\W+/).filter(Boolean);
  const expanded = new Set<string>(tokens);
  for (const t of tokens) {
    const s = synonyms[t.toLowerCase()];
    if (s) s.forEach((w) => expanded.add(w));
  }
  return Array.from(expanded).join(' ');
};
