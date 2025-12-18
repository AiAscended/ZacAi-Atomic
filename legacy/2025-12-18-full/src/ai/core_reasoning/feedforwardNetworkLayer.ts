/**
 * File: src/ai/core_reasoning/feedforwardNetworkLayer.ts
 * Description: Tiny feedforward layer: linear transform + activation.
 */

export const dense = (
  input: number[],
  weights: number[][],
  bias: number[],
  activation?: (x: number) => number,
): number[] => {
  const out = weights.map((row, i) => {
    let s = bias[i] || 0;
    for (let j = 0; j < row.length; j++) s += row[j] * (input[j] || 0);
    return activation ? activation(s) : s;
  });
  return out;
};
