/**
 * File: src/ai/context_management/sentimentEmotionDetector.ts
 * Purpose: Heuristic sentiment/emotion detector for MVP.
 */

export const detectSentiment = (
  text: string
): { 
  sentiment: 'positive' | 'neutral' | 'negative'
  score: number
  emotion: string
} => {
  const t = text.toLowerCase();
  const positive = ['good', 'great', 'love', 'happy', 'awesome', 'excellent', 'wonderful'];
  const negative = ['bad', 'hate', 'angry', 'sad', 'terrible', 'awful', 'frustrated'];
  
  // Emotion keywords
  const emotions = {
    happy: ['happy', 'joy', 'excited', 'delighted'],
    angry: ['angry', 'mad', 'furious', 'hate'],
    sad: ['sad', 'disappointed', 'depressed'],
    frustrated: ['frustrated', 'annoyed', 'irritated'],
    surprised: ['surprised', 'amazed', 'shocked'],
    neutral: ['okay', 'fine', 'alright'],
  };
  
  const p = positive.reduce((acc, w) => acc + (t.includes(w) ? 1 : 0), 0);
  const n = negative.reduce((acc, w) => acc + (t.includes(w) ? 1 : 0), 0);
  
  // Detect emotion
  let detectedEmotion = 'neutral';
  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(kw => t.includes(kw))) {
      detectedEmotion = emotion;
      break;
    }
  }
  
  if (p > n) return { sentiment: 'positive', score: p / (p + n || 1), emotion: detectedEmotion };
  if (n > p) return { sentiment: 'negative', score: n / (p + n || 1), emotion: detectedEmotion };
  return { sentiment: 'neutral', score: 0.5, emotion: detectedEmotion };
};
