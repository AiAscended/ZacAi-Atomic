/**
 * File: src/ai/data/security/security_parser.ts
 * Purpose: Security parser for vulnerability analysis
 * Depends on: security_utils.ts
 * Depended on by: security_semanticAnalyzer.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { detectSecurityIssues } from "./security_utils"

export const securityParser = (code: string) => {
  const issues = detectSecurityIssues(code)
  const hasAuth = /authenticate|authorize|login|jwt|token/i.test(code)
  const hasEncryption = /encrypt|decrypt|hash|bcrypt|crypto/i.test(code)

  return {
    issues,
    issueCount: issues.length,
    hasAuth,
    hasEncryption,
    severity: issues.length > 2 ? "critical" : issues.length > 0 ? "high" : "low",
  }
}
