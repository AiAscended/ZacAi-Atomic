/**
 * File: src/ai/data/security/security_semanticAnalyzer.ts
 * Purpose: Security semantic analyzer
 * Depends on: security_tokenizer.ts, security_parser.ts
 * Depended on by: security_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { securityTokenizer } from "./security_tokenizer"
import { securityParser } from "./security_parser"

export const securitySemanticAnalyzer = (code: string) => {
  const { tokens } = securityTokenizer(code)
  const parsed = securityParser(code)

  return {
    issues: parsed.issues,
    issueCount: parsed.issueCount,
    severity: parsed.severity,
    hasAuth: parsed.hasAuth,
    hasEncryption: parsed.hasEncryption,
    recommendations: parsed.issues.map((i) => `Fix ${i} vulnerability`),
  }
}
