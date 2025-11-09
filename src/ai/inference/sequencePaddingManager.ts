/**
 * File: src/ai/inference/sequencePaddingManager.ts
 * Description: Helpers for sequence padding/truncation.
 */

export const padOrTruncate = (
  arr: number[],
  targetLen: number,
  padValue = 0,
) => {
  if (arr.length > targetLen) return arr.slice(0, targetLen);
  const out = arr.slice();
  while (out.length < targetLen) out.push(padValue);
  return out;
};
