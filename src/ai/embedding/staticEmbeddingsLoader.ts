/**
 * File: src/ai/embedding/staticEmbeddingsLoader.ts
 * Description: Load static embeddings from in-memory or a JSON file (placeholder).
 * Dependencies: none
 * Dependents: retrieval, inference
 */

export const loadStaticEmbeddings = async (
  _source?: string,
): Promise<Record<string, number[]>> => {
  // In an MVP we'll return deterministic sample embeddings for tokens
  const sample = ["hello", "world", "zacai", "atomic"];
  const out: Record<string, number[]> = {};
  for (const t of sample) {
    out[t] = Array.from(
      { length: 8 },
      (_, i) => ((t.charCodeAt(0) + i) % 100) / 100,
    );
  }
  return out;
};
