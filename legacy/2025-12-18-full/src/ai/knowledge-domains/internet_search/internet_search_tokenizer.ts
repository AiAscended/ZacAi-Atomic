/**
 * File: src/ai/data/internet_search/internet_search_tokenizer.ts
 * Purpose: Tokenizes input for internet search domain
 * Depends on: None
 * Depended on by: src/ai/data/internet_search/internet_search_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

export function internetSearchTokenizer(input: string): {
  tokens: string[];
  length: number;
} {
  // Remove punctuation except hyphens and apostrophes
  const cleaned = input
    .toLowerCase()
    .replace(/[^\w\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Split into tokens
  const tokens = cleaned.split(" ").filter((token) => token.length > 0);

  return {
    tokens,
    length: tokens.length,
  };
}
