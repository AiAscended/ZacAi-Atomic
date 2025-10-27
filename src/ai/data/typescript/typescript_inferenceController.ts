/**
 * File: src/ai/data/typescript/typescript_inferenceController.ts
 * Purpose: Controls inference operations for TypeScript domain
 * Depends on: src/ai/data/typescript/typescript_tokenizer.ts, src/ai/data/typescript/typescript_semanticAnalyzer.ts
 * Depended on by: src/ai/data/typescript/typescript_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { typescriptTokenizer } from "./typescript_tokenizer"
import { typescriptSemanticAnalyzer } from "./typescript_semanticAnalyzer"

export function typescriptRunInference(input: string, context?: any): any {
  const tokens = typescriptTokenizer(input)
  const semantics = typescriptSemanticAnalyzer(input)

  return {
    domain: "typescript",
    tokens,
    semantics,
    confidence: tokens.length > 0 ? 0.85 : 0.1,
    suggestions: generateTypescriptSuggestions(semantics),
  }
}

function generateTypescriptSuggestions(semantics: Record<string, any>): string[] {
  const suggestions: string[] = []

  if (!semantics.hasTypeAnnotations) {
    suggestions.push("Consider adding type annotations for better type safety")
  }
  if (semantics.hasAsyncCode && !semantics.hasFunctions) {
    suggestions.push("Async code detected - ensure proper error handling")
  }
  if (semantics.complexity > 100) {
    suggestions.push("High complexity detected - consider refactoring")
  }

  return suggestions
}
