/**
 * File: src/ai/knowledge-domains/security/security_inferenceController.ts
 * Purpose: Security domain inference pipeline wrapper
 * Depends on: security_tokenizer.ts, security_semanticAnalyzer.ts
 * Depended on by: security_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { securityTokenizer } from "./security_tokenizer";
import { securitySemanticAnalyzer } from "./security_semanticAnalyzer";

export const securityRunInference = async (input: string) => {
  const t = securityTokenizer(input);
  const sem = securitySemanticAnalyzer(input);
  return {
    tokens: t.tokens,
    tokenCount: t.length,
    semantics: sem,
    response: `Security analysis: ${sem.issueCount} issues found, severity: ${sem.severity}.`,
  };
};
