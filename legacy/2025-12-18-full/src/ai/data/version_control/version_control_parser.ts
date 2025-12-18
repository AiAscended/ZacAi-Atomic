/**
 * File: src/ai/data/version_control/version_control_parser.ts
 * Purpose: Version control parser for git command analysis
 * Depends on: version_control_utils.ts
 * Depended on by: version_control_semanticAnalyzer.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { detectGitPatterns } from "./version_control_utils"

export const versionControlParser = (code: string) => {
  const operations = detectGitPatterns(code)
  return {
    operations,
    complexity: operations.length > 3 ? "high" : operations.length > 1 ? "medium" : "low",
    raw: code,
  }
}
