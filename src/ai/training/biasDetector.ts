/**
 * File: src/ai/training/biasDetector.ts
 * Purpose: Minimal bias detector that flags over-represented tokens/classes in a dataset.
 */

export const detectBias = (texts: string[], threshold = 0.5) => {
  const tokenCounts: Record<string, number> = {};
  let total = 0;
  for (const t of texts) {
    const toks = t.toLowerCase().split(/\W+/).filter(Boolean);
    for (const tk of toks) {
      tokenCounts[tk] = (tokenCounts[tk] || 0) + 1;
      total++;
    }
  }
  const issues = Object.entries(tokenCounts)
    .filter(([, c]) => c / (total || 1) > threshold)
    .map(([k]) => k);
  return { issues, totalTokens: total };
};
