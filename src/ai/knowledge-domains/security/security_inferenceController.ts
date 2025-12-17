/**
 * File: src/ai/knowledge-domains/security/security_inferenceController.ts
 * Purpose: Security domain inference pipeline wrapper
 * Depends on: security_tokenizer.ts, security_semanticAnalyzer.ts
 * Depended on by: security_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { SECURITY_DOMAIN } from "./security_constants"
import { securityTokenizer, type SecurityTokenizerResult } from "./security_tokenizer"
import {
  securitySemanticAnalyzer,
  type SecuritySemanticAnalysis,
} from "./security_semanticAnalyzer"
import type { SecuritySeverity } from "./security_parser"

type SecurityInferenceType = "baseline" | "issue_focus"

interface SecurityInferenceMetadata {
  severity: SecuritySeverity
  issueCount: number
  hasAuthentication: boolean
  hasEncryption: boolean
  generatedAt: string
  tokensAnalyzed: number
  inferenceType: SecurityInferenceType
}

export interface SecurityInferenceResponse {
  domain: string
  response: string
  summary: string
  tokens: string[]
  tokenCount: number
  semantics: SecuritySemanticAnalysis
  metadata: SecurityInferenceMetadata
  confidence: number
  sources: string[]
}

const buildResponseMessage = (semantics: SecuritySemanticAnalysis): string => {
  const { issueCount, severity, recommendations } = semantics
  if (!issueCount) {
    return "Security analysis completed: no critical vulnerabilities detected. Maintain secure coding best practices."
  }

  const lines = recommendations.slice(0, 5).map((rec, index) => `${index + 1}. ${rec}`)
  return [
    `Security analysis detected ${issueCount} potential issue(s) with ${severity.toUpperCase()} severity.`,
    "Top recommendations:",
    ...lines,
  ].join("\n")
}

const summarizeSemantics = (semantics: SecuritySemanticAnalysis): string => {
  if (!semantics.issueCount) {
    return "No actionable vulnerabilities found."
  }

  return `${semantics.issueCount} issue(s) identified with ${semantics.severity} severity.`
}

const calculateConfidence = (issueCount: number): number => {
  if (issueCount === 0) return 0.68
  if (issueCount === 1) return 0.78
  if (issueCount === 2) return 0.86
  return 0.92
}

const toMetadata = (
  semantics: SecuritySemanticAnalysis,
  tokenizerResult: SecurityTokenizerResult
): SecurityInferenceMetadata => ({
  severity: semantics.severity,
  issueCount: semantics.issueCount,
  hasAuthentication: semantics.hasAuth,
  hasEncryption: semantics.hasEncryption,
  generatedAt: new Date().toISOString(),
  tokensAnalyzed: tokenizerResult.length,
  inferenceType: semantics.issueCount > 0 ? "issue_focus" : "baseline",
})

export const securityRunInference = async (
  input: string
): Promise<SecurityInferenceResponse> => {
  const tokenizerResult = securityTokenizer(input, { includeSystemTokens: true })
  const semantics = securitySemanticAnalyzer(input)

  return {
    domain: SECURITY_DOMAIN,
    response: buildResponseMessage(semantics),
    summary: summarizeSemantics(semantics),
    tokens: tokenizerResult.tokens,
    tokenCount: tokenizerResult.length,
    semantics,
    metadata: toMetadata(semantics, tokenizerResult),
    confidence: calculateConfidence(semantics.issueCount),
    sources: ["Security Semantic Analyzer", "Security Tokenizer"],
  }
}
