/**
 * File: src/ai/data/react/react_tokenizer.ts
 * Purpose: Tokenize React-specific code and text into domain tokens
 * Depends on: react_tokenMap.ts, react_tokens.ts
 * Depended on by: react_parser.ts, react_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { reactTokenMap } from "./react_tokenMap"
import { REACT_SPECIAL_TOKENS } from "./react_tokens"

export interface TokenizedReactInput {
  tokens: string[]
  tokenIds: number[]
  originalText: string
}

export function tokenizeReactInput(input: string): TokenizedReactInput {
  const normalized = input.toLowerCase().trim()

  // Split on whitespace and common delimiters
  const rawTokens = normalized.split(/[\s,;.(){}[\]<>]+/).filter((t) => t.length > 0)

  const tokens: string[] = []
  const tokenIds: number[] = [REACT_SPECIAL_TOKENS.BOS]

  for (const rawToken of rawTokens) {
    tokens.push(rawToken)
    tokenIds.push(reactTokenMap.getTokenId(rawToken))
  }

  tokenIds.push(REACT_SPECIAL_TOKENS.EOS)

  return {
    tokens,
    tokenIds,
    originalText: input,
  }
}

export function detokenizeReactOutput(tokenIds: number[]): string {
  const tokens: string[] = []

  for (const id of tokenIds) {
    if (id === REACT_SPECIAL_TOKENS.PAD || id === REACT_SPECIAL_TOKENS.BOS || id === REACT_SPECIAL_TOKENS.EOS) {
      continue
    }

    const token = reactTokenMap.getToken(id)
    if (token) {
      tokens.push(token.text)
    }
  }

  return tokens.join(" ")
}
