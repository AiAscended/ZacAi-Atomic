/**
 * File: src/ai/data/environment/environment_parser.ts
 * Purpose: Environment parser for DevOps configuration analysis
 * Depends on: environment_utils.ts
 * Depended on by: environment_semanticAnalyzer.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { detectDevOpsPatterns } from "./environment_utils";

export const environmentParser = (code: string) => {
  const tools = detectDevOpsPatterns(code);
  return {
    tools,
    complexity: tools.length > 3 ? "high" : tools.length > 1 ? "medium" : "low",
    raw: code,
  };
};
