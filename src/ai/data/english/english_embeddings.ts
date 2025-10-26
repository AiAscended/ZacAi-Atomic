import pretrained from './english_pretrained_weights.json';

/**
 * Simple English embedding accessor/initializer.
 * - If a seed weight vector exists in `english_pretrained_weights.json` it is returned.
 * - Otherwise a small deterministic pseudo-random vector is generated from the token string.
 */
const p = pretrained as Record<string, unknown>;
const EMBEDDING_DIM = typeof p.embeddingDim === 'number' ? (p.embeddingDim as number) : 32;

const seededVector = (s: string, dim = EMBEDDING_DIM) => {
  const out: number[] = new Array(dim).fill(0).map((_, i) => {
    // deterministic hash -> float in [-0.2,0.2]
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
  // fallback to seeded vector
  return seededVector(token, EMBEDDING_DIM);
};

export const getEnglishEmbeddingForTokens = (tokens: string[]) => tokens.map(getEnglishEmbedding);

export default { getEnglishEmbedding, getEnglishEmbeddingForTokens };
