/**
 * File: src/ai/scientific-calculator/statistical/mean.ts
 * Purpose: Atomic module for calculating arithmetic mean
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Calculates arithmetic mean (average) of numbers
 * @param numbers - Array of numbers
 * @returns Mean value
 * @throws Error if array is empty
 * @example mean(1, 2, 3, 4, 5) // returns 3
 */
export function mean(...numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error("Cannot calculate mean of empty array")
  }
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
}
