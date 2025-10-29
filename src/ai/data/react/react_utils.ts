/**
 * File: src/ai/data/react/react_utils.ts
 * Purpose: Utility functions for React domain operations
 * Depends on: react_constants.ts
 * Depended on by: All react domain modules
 * Creator: Vercel v0 Coding Assistant
 */

import { REACT_CONCEPTS, REACT_PATTERNS } from "./react_constants"

export function isReactConcept(term: string): boolean {
  return REACT_CONCEPTS.includes(term as any)
}

export function isReactPattern(term: string): boolean {
  return REACT_PATTERNS.includes(term as any)
}

export function extractReactTerms(text: string): string[] {
  const lowerText = text.toLowerCase()
  const terms: string[] = []

  for (const concept of REACT_CONCEPTS) {
    if (lowerText.includes(concept)) {
      terms.push(concept)
    }
  }

  for (const pattern of REACT_PATTERNS) {
    if (lowerText.includes(pattern)) {
      terms.push(pattern)
    }
  }

  return [...new Set(terms)]
}

export function calculateReactRelevance(text: string): number {
  const terms = extractReactTerms(text)
  const lowerText = text.toLowerCase()

  let score = 0

  // Base score from extracted terms
  score += terms.length * 0.1

  // Bonus for explicit React mention
  if (lowerText.includes("react")) score += 0.3

  // Bonus for JSX/TSX
  if (lowerText.includes("jsx") || lowerText.includes("tsx")) score += 0.2

  // Bonus for hooks
  if (/use[A-Z]/.test(text)) score += 0.2

  return Math.min(score, 1.0)
}
