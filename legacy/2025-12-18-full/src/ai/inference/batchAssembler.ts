/**
 * File: src/ai/inference/batchAssembler.ts
 * Description: Assemble batches from variable-length sequences by padding and batching.
 */

export const padSequence = (
  seq: number[],
  length: number,
  padValue = 0,
): number[] => {
  const out = seq.slice(0, length);
  while (out.length < length) out.push(padValue);
  return out;
};

export const assembleBatches = (
  sequences: number[][],
  batchSize = 8,
): number[][][] => {
  const maxLen = Math.max(...sequences.map((s) => s.length));
  const padded = sequences.map((s) => padSequence(s, maxLen));
  const batches: number[][][] = [];
  for (let i = 0; i < padded.length; i += batchSize)
    batches.push(padded.slice(i, i + batchSize));
  return batches;
};
