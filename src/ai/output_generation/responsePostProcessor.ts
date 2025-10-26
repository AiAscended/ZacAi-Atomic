/**
 * File: src/ai/output_generation/responsePostProcessor.ts
 * Purpose: Small post-processor for generated text (cleanup, trimming, profanity filter stub).
 */

export const postProcess = (text: string) => {
  // minimal cleaning
  return text.replace(/\s+/g, ' ').trim();
};
