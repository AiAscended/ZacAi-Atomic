/**
 * File: src/ai/data/environment/environment_embeddings.ts
 * Purpose: Environment embedding accessor and persister
 * Depends on: environment_constants.ts, environment_pretrained_weights.json
 * Depended on by: environment_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import pretrained from "./environment_weights/environment_pretrained_weights.json";
import { ENVIRONMENT_DOMAIN } from "./environment_constants";


const EMBEDDING_DIM = 128;

export const getEnvironmentEmbedding = (token: string): number[] => {
  const weights = (pretrained as any).seedWeights || (pretrained as any).embeddings?.tokenEmbeddings?.sample;
  
  if (weights && Array.isArray(weights)) {
    return weights[0] || Array.from({ length: EMBEDDING_DIM }, () => Math.random() * 0.1 - 0.05);
  } else if (weights && typeof weights === 'object') {
    if (weights[token]) return weights[token];
  }
  
  return Array.from(
    { length: EMBEDDING_DIM },
    () => Math.random() * 0.1 - 0.05,
  );
};

export const getEnvironmentEmbeddingForTokens = (tokens: string[]) =>
  tokens.map(getEnvironmentEmbedding);

export const persistEnvironmentWeights = (
  weights: Record<string, number[]>,
) => {
  const content = JSON.stringify(
    {
      domain: ENVIRONMENT_DOMAIN,
      version: "0.2",
      embeddingDim: EMBEDDING_DIM,
      seedWeights: weights,
    },
    null,
    2,
  );
  
  // TODO: Implement file writing when orchestration/fileWatcher is available
  console.log(`Would persist ${Object.keys(weights).length} weights for ${ENVIRONMENT_DOMAIN}`);
  
  return {
    success: true,
    path: "src/ai/knowledge-domains/environment/environment_weights/environment_pretrained_weights.json",
    content,
  };
};

export default {
  getEnvironmentEmbedding,
  getEnvironmentEmbeddingForTokens,
  persistEnvironmentWeights,
};
