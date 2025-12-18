/**
 * File: src/ai/output_generation/responseReRanker.ts
 * Purpose: Re-rank multiple candidate responses by a simple heuristic (length + keyword match).
 */

export const rerankResponses = (candidates: string[], query: string) => {
  const q = query.toLowerCase();
  return candidates
    .map((c) => ({
      c,
      score:
        c.split(/\s+/).length +
        q.split(/\s+/).filter((t) => c.toLowerCase().includes(t)).length * 2,
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.c);
};
