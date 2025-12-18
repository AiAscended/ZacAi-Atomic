import pretrained from "./general_knowledge_weights/general_knowledge_pretrained_weights.json";
import { GENERAL_DOMAIN } from "./general_knowledge_constants";
import { updateFile } from "../dataRegistry";

const p = pretrained as Record<string, unknown>;
const EMBEDDING_DIM =
  typeof p.embeddingDim === "number" ? (p.embeddingDim as number) : 32;

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

export const getGeneralEmbedding = (token: string): number[] => {
  return SEED_WEIGHTS[token] ?? seededVector(token, EMBEDDING_DIM)
}

export const getGeneralEmbeddingsForTokens = (tokens: string[]) =>
  tokens.map(getGeneralEmbedding);

type PersistResult = {
  success: boolean
  path: string
}

export const persistGeneralWeights = (weights: GeneralSeedWeights): PersistResult => {
  try {
    const content = JSON.stringify(
      {
        domain: GENERAL_DOMAIN,
        version: "0.2",
        embeddingDim: EMBEDDING_DIM,
        seedWeights: weights,
      },
      null,
      2,
    );
    updateFile(
      GENERAL_DOMAIN,
      "src/ai/knowledge-domains/general/general_weights/general_pretrained_weights.json",
      content,
    );
    return true;
  } catch (e) {
    return false;
  }
}

export default {
  getGeneralEmbedding,
  getGeneralEmbeddingsForTokens,
  persistGeneralWeights,
};
