/**
 * File: src/ai/embedding/contextualEmbeddingsGenerator.ts
 * Description: Generate simple contextual embeddings by combining token features.
 * Dependencies: wordTokenizer (for simple tokenization)
 */

import { wordTokenizer } from '../input_processing/wordTokenizer';

export const contextualEmbeddingsGenerator = (text: string): number[][] => {
  const tokens = wordTokenizer(text);
  return tokens.map((t, idx) => {
    // Minimal embedding: token length + position scaled
    const base = t.length / 10;
    return [base, idx / Math.max(1, tokens.length), (t.charCodeAt(0) % 100) / 100];
  });
};
