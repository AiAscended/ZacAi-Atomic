/**
 * File: src/ai/knowledge-domains/science/science_inferenceController.ts
 * Purpose: Science domain inference pipeline wrapper
 * Depends on: science_tokenizer.ts, science_semanticAnalyzer.ts
 * Depended on by: science_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { scienceTokenizer } from "./science_tokenizer";
import { scienceSemanticAnalyzer } from "./science_semanticAnalyzer";

export const scienceRunInference = async (input: string) => {
  const t = scienceTokenizer(input);
  const sem = scienceSemanticAnalyzer(input);
  return {
    tokens: t.tokens,
    tokenCount: t.length,
    semantics: sem,
    response: `Science domain identified ${sem.concepts.length} scientific concepts in ${sem.domains.join(", ") || "general science"}.`,
  };
};
