/**
 * File: src/ai/data/react/react_parser.ts
 * Purpose: Parse React code and queries into structured representations
 * Depends on: react_tokenizer.ts
 * Depended on by: react_semanticAnalyzer.ts, react_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { tokenizeReactInput, type TokenizedReactInput } from "./react_tokenizer"

export interface ReactParseResult {
  type: "component" | "hook" | "pattern" | "question" | "code" | "general"
  tokens: TokenizedReactInput
  metadata: {
    hasJSX: boolean
    hasHooks: boolean
    hasProps: boolean
    hasState: boolean
    componentType?: "functional" | "class"
    hookTypes?: string[]
  }
}

export function parseReactInput(input: string): ReactParseResult {
  const tokens = tokenizeReactInput(input)
  const lowerInput = input.toLowerCase()

  const metadata = {
    hasJSX: /<[a-z]+/i.test(input) || lowerInput.includes("jsx") || lowerInput.includes("tsx"),
    hasHooks: /use[A-Z]/.test(input) || lowerInput.includes("hook"),
    hasProps: lowerInput.includes("props") || lowerInput.includes("properties"),
    hasState: lowerInput.includes("state") || lowerInput.includes("usestate"),
    componentType: undefined as "functional" | "class" | undefined,
    hookTypes: [] as string[],
  }

  // Detect component type
  if (lowerInput.includes("function") || lowerInput.includes("const") || lowerInput.includes("=>")) {
    metadata.componentType = "functional"
  } else if (lowerInput.includes("class") && lowerInput.includes("extends")) {
    metadata.componentType = "class"
  }

  // Detect hook types
  const hookMatches = input.match(/use[A-Z][a-zA-Z]*/g)
  if (hookMatches) {
    metadata.hookTypes = [...new Set(hookMatches)]
  }

  // Determine parse type
  let type: ReactParseResult["type"] = "general"

  if (lowerInput.includes("component") || metadata.hasJSX) {
    type = "component"
  } else if (metadata.hasHooks || metadata.hookTypes.length > 0) {
    type = "hook"
  } else if (lowerInput.includes("pattern") || lowerInput.includes("best practice")) {
    type = "pattern"
  } else if (lowerInput.includes("?") || lowerInput.includes("how") || lowerInput.includes("what")) {
    type = "question"
  } else if (lowerInput.includes("code") || lowerInput.includes("example")) {
    type = "code"
  }

  return {
    type,
    tokens,
    metadata,
  }
}
