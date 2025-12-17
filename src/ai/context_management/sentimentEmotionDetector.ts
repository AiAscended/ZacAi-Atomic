/**
 * File: src/ai/context_management/sentimentEmotionDetector.ts
 * Purpose: Heuristic sentiment/emotion detector for MVP.
 */

export const detectSentiment = (
  text: string,
): { sentiment: "positive" | "neutral" | "negative"; score: number } => {
  const t = text.toLowerCase();
  const positive = ["good", "great", "love", "happy", "awesome"];
  const negative = ["bad", "hate", "angry", "sad", "terrible", "awful"];
  const p = positive.reduce((acc, w) => acc + (t.includes(w) ? 1 : 0), 0);
  const n = negative.reduce((acc, w) => acc + (t.includes(w) ? 1 : 0), 0);
  if (p > n) return { sentiment: "positive", score: p / (p + n || 1) };
  if (n > p) return { sentiment: "negative", score: n / (p + n || 1) };
  return { sentiment: "neutral", score: 0.5 };
};
