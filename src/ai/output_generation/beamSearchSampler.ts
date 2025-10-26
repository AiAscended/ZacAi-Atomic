/**
 * File: src/ai/output_generation/beamSearchSampler.ts
 * Purpose: Minimal beam search sampler stub (returns top-k tokens by score map).
 */

export const beamSearch = (scores: number[][], beamWidth = 3) => {
  // scores: array per time-step, each with per-token score
  const beams: { seq: number[]; score: number }[] = [{ seq: [], score: 0 }];
  for (const step of scores) {
    const next: typeof beams = [];
    for (const b of beams) {
      for (let t = 0; t < step.length; t++) {
        next.push({ seq: [...b.seq, t], score: b.score + step[t] });
      }
    }
    next.sort((a, b) => b.score - a.score);
    beams.length = 0;
    beams.push(...next.slice(0, beamWidth));
  }
  return beams.map((b) => b.seq);
};
