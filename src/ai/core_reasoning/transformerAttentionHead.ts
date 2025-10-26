/**
 * File: src/ai/core_reasoning/transformerAttentionHead.ts
 * Description: Minimal scaled dot-product attention implementation for small sequences.
 * Dependencies: none
 */

export const scaledDotProductAttention = (
  q: number[][],
  k: number[][],
  v: number[][]
): number[][] => {
  // q,k,v: [seqLen][dim]
  const seq = q.length;
  const dim = q[0].length;
  const out: number[][] = [];
  for (let i = 0; i < seq; i++) {
    const qi = q[i];
    // compute scores
    const scores: number[] = [];
    for (let j = 0; j < seq; j++) {
      let s = 0;
      for (let d = 0; d < dim; d++) s += qi[d] * k[j][d];
      scores.push(s / Math.sqrt(dim));
    }
    // softmax
    const maxS = Math.max(...scores);
    const exps = scores.map((s) => Math.exp(s - maxS));
    const sum = exps.reduce((a, b) => a + b, 0) || 1;
    const probs = exps.map((e) => e / sum);
    // weighted sum
    const outVec = new Array<number>(dim).fill(0);
    for (let j = 0; j < seq; j++) {
      for (let d = 0; d < dim; d++) outVec[d] += probs[j] * v[j][d];
    }
    out.push(outVec);
  }
  return out;
};
