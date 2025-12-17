/**
 * File: src/ai/context_management/sentimentEmotionDetector.ts
 * Purpose: Heuristic sentiment/emotion detector for MVP.
 */

export interface SentimentResult {
  polarity: "positive" | "neutral" | "negative"
  emotion: string
  confidence: number
}

export const detectSentiment = (text: string): SentimentResult => {
  const t = text.toLowerCase()
  const positive = ["good", "great", "love", "happy", "awesome"]
  const negative = ["bad", "hate", "angry", "sad", "terrible", "awful"]

  const positiveHits = positive.reduce((acc, word) => acc + (t.includes(word) ? 1 : 0), 0)
  const negativeHits = negative.reduce((acc, word) => acc + (t.includes(word) ? 1 : 0), 0)
  const totalHits = positiveHits + negativeHits

  if (positiveHits > negativeHits) {
    return {
      polarity: "positive",
      emotion: "optimistic",
      confidence: totalHits > 0 ? positiveHits / totalHits : 0.6,
    }
  }

  if (negativeHits > positiveHits) {
    return {
      polarity: "negative",
      emotion: "frustrated",
      confidence: totalHits > 0 ? negativeHits / totalHits : 0.6,
    }
  }

  return {
    polarity: "neutral",
    emotion: "calm",
    confidence: 0.5,
  }
}
