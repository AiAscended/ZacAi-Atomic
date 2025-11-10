/**
 * File: src/ai/context_management/sentimentEmotionDetector.ts
 * Purpose: Heuristic sentiment/emotion detector for MVP.
 */

export const detectSentiment = (
  text: string
): { polarity: 'positive' | 'neutral' | 'negative'; emotion: string; confidence: number } => {
  const t = text.toLowerCase();
  const positive = ['good', 'great', 'love', 'happy', 'awesome'];
  const negative = ['bad', 'hate', 'angry', 'sad', 'terrible', 'awful'];
  
  // Emotion patterns
  const emotions = {
    happy: ['happy', 'joy', 'excited', 'glad', 'delighted'],
    sad: ['sad', 'unhappy', 'disappointed', 'depressed'],
    angry: ['angry', 'furious', 'mad', 'annoyed'],
    fearful: ['afraid', 'scared', 'worried', 'anxious'],
    neutral: ['okay', 'fine', 'alright']
  };
  
  const p = positive.reduce((acc, w) => acc + (t.includes(w) ? 1 : 0), 0);
  const n = negative.reduce((acc, w) => acc + (t.includes(w) ? 1 : 0), 0);
  
  // Detect emotion
  let detectedEmotion = 'neutral';
  let emotionCount = 0;
  for (const [emotion, words] of Object.entries(emotions)) {
    const count = words.reduce((acc, w) => acc + (t.includes(w) ? 1 : 0), 0);
    if (count > emotionCount) {
      emotionCount = count;
      detectedEmotion = emotion;
    }
  }
  
  if (p > n) return { polarity: 'positive', emotion: detectedEmotion, confidence: p / (p + n || 1) };
  if (n > p) return { polarity: 'negative', emotion: detectedEmotion, confidence: n / (p + n || 1) };
  return { polarity: 'neutral', emotion: detectedEmotion, confidence: 0.5 };
};
