/**
 * File: src/ai/data_pipeline/featureEngineer.ts
 * Purpose: Simple feature engineering utilities (text -> token counts, n-grams).
 */

export const tokenCounts = (text: string) => {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean)
    .reduce<Record<string, number>>((acc, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
};

export const ngrams = (text: string, n = 2) => {
  const toks = text.split(/\W+/).filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i + n <= toks.length; i++) out.push(toks.slice(i, i + n).join(' '));
  return out;
};
