import pretrained from './english_weights/english_pretrained_weights.json';
import { ENGLISH_DOMAIN } from './english_constants';
import { updateFile } from '../dataRegistry';

/**
 * English embedding accessor and persister.
 * - Returns seed vector from pretrained JSON if present
 * - Otherwise returns a deterministic seeded fallback vector (stable across runs)
 */
const p = pretrained as Record<string, unknown>;
const EMBEDDING_DIM = typeof p.embeddingDim === 'number' ? (p.embeddingDim as number) : 128;

const seededVector = (s: string, dim = EMBEDDING_DIM) => {
  const out: number[] = new Array(dim).fill(0).map((_, i) => {
    // deterministic FNV-like hash -> float in [-0.2,0.2]
    let h = 2166136261 >>> 0;
    for (let j = 0; j < s.length; j++) h = Math.imul(h ^ s.charCodeAt(j), 16777619) >>> 0;
    const v = ((h >> i % 24) & 0xffff) / 0xffff; // 0..1
    return (v - 0.5) * 0.4; // scale to [-0.2,0.2]
  });
  return out;
};

export const getEnglishEmbedding = (token: string): number[] => {
  const seed = (p.seedWeights ?? {}) as Record<string, number[]>;
  if (Object.prototype.hasOwnProperty.call(seed, token)) return seed[token];
  return seededVector(token, EMBEDDING_DIM);
};

export const getEnglishEmbeddingForTokens = (tokens: string[]) => tokens.map(getEnglishEmbedding);

export const persistEnglishWeights = (weights: Record<string, number[]>) => {
  try {
    const content = JSON.stringify(
      { domain: ENGLISH_DOMAIN, version: '0.2', embeddingDim: EMBEDDING_DIM, seedWeights: weights },
      null,
      2
    );
    updateFile(ENGLISH_DOMAIN, 'src/ai/knowledge-domains/english/english_weights/english_pretrained_weights.json', content);
    return true;
  } catch (e) {
    return false;
  }
};

const english_embeddings_bundle = { getEnglishEmbedding, getEnglishEmbeddingForTokens, persistEnglishWeights };

export default english_embeddings_bundle;
