/**
 * File: src/ai/data/nextjs/nextjs_utils.ts
 * Purpose: Utility functions for Next.js domain operations
 * Depends on: nextjs_constants.ts
 * Depended on by: All nextjs domain modules
 * Creator: Vercel v0 Coding Assistant
 */

import { NEXTJS_CONCEPTS, NEXTJS_FEATURES } from "./nextjs_constants"

export function isNextjsConcept(term: string): boolean {
  return NEXTJS_CONCEPTS.includes(term as any)
}

export function isNextjsFeature(term: string): boolean {
  return NEXTJS_FEATURES.includes(term as any)
}

export function extractNextjsTerms(text: string): string[] {
  const lowerText = text.toLowerCase()
  const terms: string[] = []

  for (const concept of NEXTJS_CONCEPTS) {
    if (lowerText.includes(concept)) {
      terms.push(concept)
    }
  }

  for (const feature of NEXTJS_FEATURES) {
    if (lowerText.includes(feature)) {
      terms.push(feature)
    }
  }

  return [...new Set(terms)]
}

export function calculateNextjsRelevance(text: string): number {
  const terms = extractNextjsTerms(text)
  const lowerText = text.toLowerCase()

  let score = 0

  score += terms.length * 0.1

  if (lowerText.includes("next.js") || lowerText.includes("nextjs")) score += 0.4

  if (lowerText.includes("app router") || lowerText.includes("pages router")) score += 0.2

  if (lowerText.includes("server component") || lowerText.includes("server action")) score += 0.2

  return Math.min(score, 1.0)
}
