const DEFAULT_DIMENSION = 128;

export interface PretrainedEmbeddingManifest {
  architecture?: {
    embeddingDim?: number;
  };
  embeddings?: {
    tokenEmbeddings?: {
      sample?: number[][];
      shape?: number[];
    };
  };
  seedWeights?: Record<string, number[]>;
}

export interface SeedVocabularySource {
  vocabulary?: string[] | Record<string, unknown>;
  terms?: string[];
}

export interface ThresholdLike {
  token_match_weight?: number;
  semantic_weight?: number;
  tokenMatchWeight?: number;
  semanticWeight?: number;
  minConfidence?: number;
  highConfidence?: number;
}

export interface ThresholdConfig {
  tokenMatchWeight: number;
  semanticWeight: number;
  minConfidence: number;
  highConfidence: number;
}

const HASH_OFFSET_BASIS = 2166136261 >>> 0;
const HASH_PRIME = 16777619;

const DEFAULT_THRESHOLDS: ThresholdConfig = {
  tokenMatchWeight: 0.6,
  semanticWeight: 0.4,
  minConfidence: 0.05,
  highConfidence: 0.85,
};

export function normalizeSeedTokens(source?: SeedVocabularySource | null): string[] {
  if (!source) return [];
  const tokens = new Set<string>();

  if (Array.isArray(source.vocabulary)) {
    source.vocabulary.filter(Boolean).forEach((term) => tokens.add(String(term)));
  } else if (source.vocabulary && typeof source.vocabulary === "object") {
    Object.keys(source.vocabulary).forEach((term) => tokens.add(term));
  }

  if (Array.isArray(source.terms)) {
    source.terms.filter(Boolean).forEach((term) => tokens.add(String(term)));
  }

  return Array.from(tokens);
}

export function normalizeVocabularyWeights(
  vocabulary?: string[] | Record<string, unknown>,
  defaultWeight = 0.75,
): Record<string, number> {
  if (!vocabulary) return {};

  if (Array.isArray(vocabulary)) {
    return vocabulary.reduce<Record<string, number>>((acc, term) => {
      if (!term) return acc;
      acc[String(term)] = defaultWeight;
      return acc;
    }, {});
  }

  return Object.entries(vocabulary).reduce<Record<string, number>>((acc, [term, weight]) => {
    if (!term) return acc;
    acc[term] = typeof weight === "number" ? weight : defaultWeight;
    return acc;
  }, {});
}

export function resolveEmbeddingDimension(manifest?: PretrainedEmbeddingManifest, fallback = DEFAULT_DIMENSION): number {
  return (
    manifest?.architecture?.embeddingDim ??
    manifest?.embeddings?.tokenEmbeddings?.sample?.[0]?.length ??
    manifest?.embeddings?.tokenEmbeddings?.shape?.[1] ??
    fallback
  );
}

export function deterministicVector(token: string, dimension: number): number[] {
  let hash = HASH_OFFSET_BASIS;
  for (let i = 0; i < token.length; i++) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, HASH_PRIME);
  }

  const vector: number[] = new Array(dimension);
  for (let idx = 0; idx < dimension; idx++) {
    hash ^= idx;
    hash = Math.imul(hash, HASH_PRIME);
    const sample = (hash & 0xffff) / 0xffff;
    vector[idx] = sample * 0.4 - 0.2; // keep values in [-0.2, 0.2]
  }

  return vector;
}

export function buildSeedWeightMap(
  manifest: PretrainedEmbeddingManifest,
  seedTokens: string[],
  fallbackDimension = DEFAULT_DIMENSION,
): Record<string, number[]> {
  const existing = manifest.seedWeights;
  if (existing && Object.keys(existing).length > 0) {
    return existing;
  }

  const dimension = resolveEmbeddingDimension(manifest, fallbackDimension);
  const sampleVectors = manifest.embeddings?.tokenEmbeddings?.sample ?? [];
  const sampleCount = sampleVectors.length;
  const generated: Record<string, number[]> = {};

  for (const token of seedTokens) {
    if (!token) continue;
    if (sampleCount > 0) {
      const idx = Math.abs(hashString(token)) % sampleCount;
      const base = sampleVectors[idx];
      generated[token] = normalizeVector(base, dimension, token);
    } else {
      generated[token] = deterministicVector(token, dimension);
    }
  }

  return generated;
}

export function normalizeThresholds(...sources: Array<ThresholdLike | undefined>): ThresholdConfig {
  const resolved: ThresholdConfig = { ...DEFAULT_THRESHOLDS };

  for (const src of sources) {
    if (!src) continue;
    if (typeof src.token_match_weight === "number") resolved.tokenMatchWeight = src.token_match_weight;
    if (typeof src.tokenMatchWeight === "number") resolved.tokenMatchWeight = src.tokenMatchWeight;
    if (typeof src.semantic_weight === "number") resolved.semanticWeight = src.semantic_weight;
    if (typeof src.semanticWeight === "number") resolved.semanticWeight = src.semanticWeight;
    if (typeof src.minConfidence === "number") resolved.minConfidence = src.minConfidence;
    if (typeof src.highConfidence === "number") resolved.highConfidence = src.highConfidence;
  }

  return resolved;
}

function normalizeVector(base: number[] | undefined, dimension: number, token: string): number[] {
  if (!base || base.length === 0) {
    return deterministicVector(token, dimension);
  }

  if (base.length === dimension) {
    return [...base];
  }

  if (base.length > dimension) {
    return base.slice(0, dimension);
  }

  const vector = base.slice();
  while (vector.length < dimension) {
    vector.push(vector[vector.length % base.length]);
  }

  return vector.slice(0, dimension);
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
