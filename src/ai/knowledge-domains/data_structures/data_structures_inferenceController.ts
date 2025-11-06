/**
 * File: src/ai/knowledge-domains/data_structures/data_structures_inferenceController.ts
 * Purpose: Data structures domain inference pipeline wrapper
 * Depends on: data_structures_tokenizer.ts, data_structures_semanticAnalyzer.ts
 * Depended on by: data_structures_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { dataStructuresTokenizer } from "./data_structures_tokenizer"
import { dataStructuresSemanticAnalyzer } from "./data_structures_semanticAnalyzer"

export const dataStructuresRunInference = async (input: string) => {
  const t = dataStructuresTokenizer(input)
  const sem = dataStructuresSemanticAnalyzer(input)
  return {
    domain: "data_structures",
    tokens: t.tokens,
    semanticScore: sem.semanticScore,
    response: `Data structures analysis: ${sem.parsed.structures.join(", ")} detected with ${sem.parsed.complexity} complexity.`,
  }
}

export default dataStructuresRunInference
