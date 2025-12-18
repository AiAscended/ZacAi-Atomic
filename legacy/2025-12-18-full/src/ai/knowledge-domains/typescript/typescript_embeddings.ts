import pretrained from "./typescript_weights/typescript_pretrained_weights.json";
import { TYPESCRIPT_DOMAIN } from "./typescript_constants";
import { updateFile } from "../dataRegistry";

const p = pretrained as Record<string, unknown>;
const EMBEDDING_DIM =
  typeof p.embeddingDim === "number" ? (p.embeddingDim as number) : 64;

const seededVector = (s: string, dim = EMBEDDING_DIM) => {
  const out: number[] = new Array(dim).fill(0).map((_, i) => {
    let h = 2166136261 >>> 0;
    for (let j = 0; j < s.length; j++)
      h = Math.imul(h ^ s.charCodeAt(j), 16777619) >>> 0;
    const v = ((h >> i % 24) & 0xffff) / 0xffff;
    return (v - 0.5) * 0.4;
  });
  return out;
};

export const getTypescriptEmbedding = (token: string): number[] => {
  const seed = (p.seedWeights ?? {}) as Record<string, number[]>;
  if (Object.prototype.hasOwnProperty.call(seed, token)) return seed[token];
  return seededVector(token, EMBEDDING_DIM);
};

export const getTypescriptEmbeddingsForTokens = (tokens: string[]) =>
  tokens.map(getTypescriptEmbedding);

export const persistTypeScriptWeights = (weights: Record<string, number[]>) => {
  try {
    const content = JSON.stringify(
      {
        domain: TYPESCRIPT_DOMAIN,
        version: "0.2",
        embeddingDim: EMBEDDING_DIM,
        seedWeights: weights,
      },
      null,
      2,
    );
    updateFile(
      TYPESCRIPT_DOMAIN,
      "src/ai/knowledge-domains/typescript/typescript_weights/typescript_pretrained_weights.json",
      content,
    );
    return true;
  } catch (error) {
    console.error('[TypeScript] Failed to persist pretrained weights:', error);
    return false;
  }
};

const typescript_embeddings_bundle = {
  getTypescriptEmbedding,
  getTypescriptEmbeddingsForTokens,
  persistTypeScriptWeights,
};

export default typescript_embeddings_bundle;
