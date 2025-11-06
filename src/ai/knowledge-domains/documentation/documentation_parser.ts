/**
 * File: src/ai/data/documentation/documentation_parser.ts
 * Purpose: Documentation parser for comment analysis
 * Depends on: documentation_utils.ts
 * Depended on by: documentation_semanticAnalyzer.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { extractDocComments } from "./documentation_utils"

export const documentationParser = (code: string) => {
  const comments = extractDocComments(code)
  const hasJSDoc = comments.some((c) => c.startsWith("/**"))
  const hasTODO = /TODO|FIXME/i.test(code)

  return {
    comments,
    commentCount: comments.length,
    hasJSDoc,
    hasTODO,
    coverage: comments.length > 0 ? "partial" : "none",
  }
}
