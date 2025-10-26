/**
 * File: src/ai/data_pipeline/featureStoreAPI.ts
 * Purpose: Minimal feature store API: register and fetch feature vectors (MVP in-memory).
 */

const features = new Map<string, number[]>();

export const putFeature = (key: string, vec: number[]) => features.set(key, vec.slice());
export const getFeature = (key: string) => features.get(key) ?? null;
export const listFeatureKeys = () => Array.from(features.keys());
