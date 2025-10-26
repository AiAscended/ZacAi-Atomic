/**
 * File: src/ai/inference/modelSharder.ts
 * Description: Lightweight model sharding helper (logical splits for large params).
 */

export const shardArray = <T>(arr: T[], parts = 2): T[][] => {
  const out: T[][] = Array.from({ length: parts }, () => []);
  for (let i = 0; i < arr.length; i++) out[i % parts].push(arr[i]);
  return out;
};
