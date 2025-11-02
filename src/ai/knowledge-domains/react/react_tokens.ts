/**
 * File: src/ai/data/react/react_tokens.ts
 * Purpose: Token definitions and mappings for React domain
 * Depends on: react_constants.ts
 * Depended on by: react_tokenizer.ts, react_tokenMap.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { REACT_CONCEPTS, REACT_PATTERNS } from "./react_constants"

export type ReactToken = {
  id: number
  text: string
  type: "concept" | "pattern" | "keyword" | "operator" | "identifier"
  category?: string
}

export const REACT_SPECIAL_TOKENS = {
  PAD: 0,
  UNK: 1,
  BOS: 2,
  EOS: 3,
} as const

let tokenId = 4

export const REACT_CONCEPT_TOKENS: ReactToken[] = REACT_CONCEPTS.map((concept) => ({
  id: tokenId++,
  text: concept,
  type: "concept" as const,
  category: "react-core",
}))

export const REACT_PATTERN_TOKENS: ReactToken[] = REACT_PATTERNS.map((pattern) => ({
  id: tokenId++,
  text: pattern,
  type: "pattern" as const,
  category: "react-patterns",
}))

export const REACT_KEYWORD_TOKENS: ReactToken[] = [
  "function",
  "const",
  "let",
  "return",
  "export",
  "import",
  "default",
  "from",
  "as",
].map((keyword) => ({
  id: tokenId++,
  text: keyword,
  type: "keyword" as const,
  category: "javascript",
}))

export const ALL_REACT_TOKENS: ReactToken[] = [
  ...REACT_CONCEPT_TOKENS,
  ...REACT_PATTERN_TOKENS,
  ...REACT_KEYWORD_TOKENS,
]

export function getTokenById(id: number): ReactToken | null {
  return ALL_REACT_TOKENS.find((token) => token.id === id) || null
}

export function getTokenByText(text: string): ReactToken | null {
  return ALL_REACT_TOKENS.find((token) => token.text.toLowerCase() === text.toLowerCase()) || null
}
