/**
 * File: src/ai/data/security/security_semanticAnalyzer.ts
 * Purpose: Security semantic analyzer
 * Depends on: security_tokenizer.ts, security_parser.ts
 * Depended on by: security_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { securityParser, type SecurityParserResult } from "./security_parser"

export interface SecuritySemanticAnalysis extends SecurityParserResult {
  recommendations: string[]
}

export const securitySemanticAnalyzer = (code: string): SecuritySemanticAnalysis => {
  const parsed = securityParser(code)

  return {
    issues: parsed.issues,
    issueCount: parsed.issueCount,
    severity: parsed.severity,
    hasAuth: parsed.hasAuth,
    hasEncryption: parsed.hasEncryption,
    recommendations: parsed.issues.map((issue) => `Fix ${issue} vulnerability`),
  }
}
