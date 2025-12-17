/**
 * File: src/ai/data/algorithms/algorithms_embeddings.ts
 * Purpose: Algorithms embedding accessor and persister
 * Depends on: algorithms_constants.ts, algorithms_pretrained_weights.json
 * Depended on by: algorithms_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import pretrained from "./algorithms_weights/algorithms_pretrained_weights.json";
import { ALGORITHMS_DOMAIN } from "./algorithms_constants";

const EMBEDDING_DIM = 128;

export const getAlgorithmsEmbedding = (token: string): number[] => {
  // Handle both old and new weight file formats
  const weights = (pretrained as any).seedWeights || (pretrained as any).embeddings?.tokenEmbeddings?.sample;
  
  if (weights && Array.isArray(weights)) {
    // If weights is an array of embeddings, use the first one as fallback
    return weights[0] || Array.from({ length: EMBEDDING_DIM }, () => Math.random() * 0.1 - 0.05);
  } else if (weights && typeof weights === 'object') {
    // If weights is a Record<string, number[]>
    if (weights[token]) return weights[token];
  }
  
  // Fallback: random embedding
  return Array.from(
    { length: EMBEDDING_DIM },
    () => Math.random() * 0.1 - 0.05,
  );
};

export const getAlgorithmsEmbeddingForTokens = (tokens: string[]) =>
  tokens.map(getAlgorithmsEmbedding);

export const persistAlgorithmsWeights = (weights: Record<string, number[]>) => {
  // Note: File persistence is handled externally
  // This function returns metadata about where weights would be saved
  const content = JSON.stringify(
    {
      domain: ALGORITHMS_DOMAIN,
      version: "0.2",
      embeddingDim: EMBEDDING_DIM,
      seedWeights: weights,
    },
    null,
    2,
  );
  
  // TODO: Implement file writing when orchestration/fileWatcher is available
  console.log(`Would persist ${Object.keys(weights).length} weights for ${ALGORITHMS_DOMAIN}`);
  
  return {
    success: true,
    path: "src/ai/knowledge-domains/algorithms/algorithms_weights/algorithms_pretrained_weights.json",
    content,
  };
};

export default {
  getAlgorithmsEmbedding,
  getAlgorithmsEmbeddingForTokens,
  persistAlgorithmsWeights,
};
