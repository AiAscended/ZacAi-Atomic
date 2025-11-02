/**
 * File: src/ai/data/nextjs/nextjs_tokens.ts
 * Purpose: Token definitions and mappings for Next.js domain
 * Depends on: nextjs_constants.ts
 * Depended on by: nextjs_tokenizer.ts, nextjs_tokenMap.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { NEXTJS_CONCEPTS, NEXTJS_FEATURES } from "./nextjs_constants"

export type NextjsToken = {
  id: number
  text: string
  type: "concept" | "feature" | "keyword" | "file" | "identifier"
  category?: string
}

export const NEXTJS_SPECIAL_TOKENS = {
  PAD: 0,
  UNK: 1,
  BOS: 2,
  EOS: 3,
} as const

let tokenId = 4

export const NEXTJS_CONCEPT_TOKENS: NextjsToken[] = NEXTJS_CONCEPTS.map((concept) => ({
  id: tokenId++,
  text: concept,
  type: "concept" as const,
  category: "nextjs-core",
}))

export const NEXTJS_FEATURE_TOKENS: NextjsToken[] = NEXTJS_FEATURES.map((feature) => ({
  id: tokenId++,
  text: feature,
  type: "feature" as const,
  category: "nextjs-features",
}))

export const NEXTJS_FILE_TOKENS: NextjsToken[] = [
  "page.tsx",
  "layout.tsx",
  "loading.tsx",
  "error.tsx",
  "not-found.tsx",
  "route.ts",
  "middleware.ts",
  "next.config.js",
].map((file) => ({
  id: tokenId++,
  text: file,
  type: "file" as const,
  category: "nextjs-files",
}))

export const ALL_NEXTJS_TOKENS: NextjsToken[] = [
  ...NEXTJS_CONCEPT_TOKENS,
  ...NEXTJS_FEATURE_TOKENS,
  ...NEXTJS_FILE_TOKENS,
]

export function getNextjsTokenById(id: number): NextjsToken | null {
  return ALL_NEXTJS_TOKENS.find((token) => token.id === id) || null
}

export function getNextjsTokenByText(text: string): NextjsToken | null {
  return ALL_NEXTJS_TOKENS.find((token) => token.text.toLowerCase() === text.toLowerCase()) || null
}
