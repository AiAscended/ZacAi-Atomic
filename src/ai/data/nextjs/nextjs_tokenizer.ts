/**
 * File: src/ai/data/nextjs/nextjs_tokenizer.ts
 * Purpose: Tokenize Next.js-specific code and text into domain tokens
 * Depends on: nextjs_tokenMap.ts, nextjs_tokens.ts
 * Depended on by: nextjs_parser.ts, nextjs_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { nextjsTokenMap } from "./nextjs_tokenMap"
import { NEXTJS_SPECIAL_TOKENS } from "./nextjs_tokens"

export interface TokenizedNextjsInput {
  tokens: string[]
  tokenIds: number[]
  originalText: string
}

export function tokenizeNextjsInput(input: string): TokenizedNextjsInput {
  const normalized = input.toLowerCase().trim()

  const rawTokens = normalized.split(/[\s,;.(){}[\]<>]+/).filter((t) => t.length > 0)

  const tokens: string[] = []
  const tokenIds: number[] = [NEXTJS_SPECIAL_TOKENS.BOS]

  for (const rawToken of rawTokens) {
    tokens.push(rawToken)
    tokenIds.push(nextjsTokenMap.getTokenId(rawToken))
  }

  tokenIds.push(NEXTJS_SPECIAL_TOKENS.EOS)

  return {
    tokens,
    tokenIds,
    originalText: input,
  }
}

export function detokenizeNextjsOutput(tokenIds: number[]): string {
  const tokens: string[] = []

  for (const id of tokenIds) {
    if (id === NEXTJS_SPECIAL_TOKENS.PAD || id === NEXTJS_SPECIAL_TOKENS.BOS || id === NEXTJS_SPECIAL_TOKENS.EOS) {
      continue
    }

    const token = nextjsTokenMap.getToken(id)
    if (token) {
      tokens.push(token.text)
    }
  }

  return tokens.join(" ")
}
