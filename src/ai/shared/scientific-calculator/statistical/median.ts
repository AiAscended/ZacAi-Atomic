/**
 * File: src/ai/scientific-calculator/statistical/median.ts
 * Purpose: Atomic module for calculating median
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Calculates median (middle value) of numbers
 * @param numbers - Array of numbers
 * @returns Median value
 * @throws Error if array is empty
 * @example median(1, 2, 3, 4, 5) // returns 3
 */
export function median(...numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error("Cannot calculate median of empty array")
  }

  const sorted = [...numbers].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}
