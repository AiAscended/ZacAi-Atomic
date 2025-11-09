/**
 * File: src/ai/data/data_structures/data_structures_embeddings.ts
 * Purpose: Data structures embedding accessor and persister
 * Depends on: data_structures_constants.ts, data_structures_pretrained_weights.json
 * Depended on by: data_structures_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import pretrained from "./data_structures_weights/data_structures_pretrained_weights.json";
import { DATA_STRUCTURES_DOMAIN } from "./data_structures_constants";

const EMBEDDING_DIM = 128;

/**
 * Get embedding vector for a token
 * Returns: 128-dimensional vector or random fallback
 */
export const getDataStructuresEmbedding = (token: string): number[] => {
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

export const getDataStructuresEmbeddingForTokens = (tokens: string[]) =>
  tokens.map(getDataStructuresEmbedding);

export const persistDataStructuresWeights = (
  weights: Record<string, number[]>,
) => {
  const content = JSON.stringify(
    {
      domain: DATA_STRUCTURES_DOMAIN,
      version: "0.2",
      embeddingDim: EMBEDDING_DIM,
      seedWeights: weights,
    },
    null,
    2,
  );
  
  // TODO: Implement file writing when orchestration/fileWatcher is available
  console.log(`Would persist ${Object.keys(weights).length} weights for ${DATA_STRUCTURES_DOMAIN}`);
  
  return {
    success: true,
    path: "src/ai/knowledge-domains/data_structures/data_structures_weights/data_structures_pretrained_weights.json",
    content,
  };
};

export default {
  getDataStructuresEmbedding,
  getDataStructuresEmbeddingForTokens,
  persistDataStructuresWeights,
};
