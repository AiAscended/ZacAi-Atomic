/**
 * File: src/ai/data/typescript/typescript_semanticAnalyzer.ts
 * Purpose: Performs semantic analysis on TypeScript code
 * Depends on: src/ai/data/typescript/typescript_tokenizer.ts, src/ai/data/typescript/typescript_parser.ts
 * Depended on by: src/ai/data/typescript/typescript_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { typescriptTokenizer } from "./typescript_tokenizer"

export interface TypescriptSemanticAnalysis {
  hasTypeAnnotations: boolean
  hasInterfaces: boolean
  hasClasses: boolean
  hasFunctions: boolean
  hasAsyncCode: boolean
  hasImports: boolean
  hasExports: boolean
  complexity: number
  codeQuality: "valid" | "empty"
}

export function typescriptSemanticAnalyzer(input: string): TypescriptSemanticAnalysis {
  const tokens = typescriptTokenizer(input)

  const analysis: TypescriptSemanticAnalysis = {
    hasTypeAnnotations: tokens.some((t) => ["string", "number", "boolean", "any"].includes(t)),
    hasInterfaces: tokens.includes("interface"),
    hasClasses: tokens.includes("class"),
    hasFunctions: tokens.includes("function"),
    hasAsyncCode: tokens.includes("async") || tokens.includes("await"),
    hasImports: tokens.includes("import"),
    hasExports: tokens.includes("export"),
    complexity: tokens.length,
    codeQuality: tokens.length > 0 ? "valid" : "empty",
  }

  return analysis
}
