/**
 * File: src/ai/training/hyperparameterTuner.ts
 * Purpose: Minimal grid-search tuner (synchronous small search for MVP).
 */

export const gridSearch = <T>(
  searchSpace: Record<string, T[]>,
  evalFn: (params: Record<string, T>) => number
) => {
  const keys = Object.keys(searchSpace);
  const results: Array<{ params: Record<string, T>; score: number }> = [];

  const rec = (idx: number, cur: Record<string, T>) => {
    if (idx === keys.length) {
      const score = evalFn(cur);
      results.push({ params: { ...cur }, score });
      return;
    }
    const k = keys[idx];
    for (const v of searchSpace[k]) {
      cur[k] = v;
      rec(idx + 1, cur);
    }
  };

  rec(0, {} as Record<string, T>);
  results.sort((a, b) => b.score - a.score);
  return results;
};
