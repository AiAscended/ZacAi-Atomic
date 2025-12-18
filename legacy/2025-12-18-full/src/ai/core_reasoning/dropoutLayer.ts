/**
 * File: src/ai/core_reasoning/dropoutLayer.ts
 * Description: Simple dropout mask generator for training-time regularization (deterministic stub).
 */

export const dropoutMask = (size: number, rate = 0.1): number[] => {
  const mask: number[] = [];
  for (let i = 0; i < size; i++) mask.push(Math.random() > rate ? 1 : 0);
  return mask;
};
