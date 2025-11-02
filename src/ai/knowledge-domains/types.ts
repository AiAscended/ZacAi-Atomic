/**
 * File: src/ai/data/types.ts
 * Purpose: Shared types for domain inference controllers
 */

export interface InferenceContext {
  context?: string[]
  searchResults?: string[]
  intent?: string
  tokens?: string[]
  sentences?: string[]
  inferenceResults?: {
    domain: string
    confidence: number
    logits: number[][]
  }
  sentiment?: {
    sentiment: string
    score: number
  }
  slots?: Record<string, unknown>
  userProfile?: Record<string, unknown>
  dialogueState?: {
    status: string
    nextAction?: string
  }
}
