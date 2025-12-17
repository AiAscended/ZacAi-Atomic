/**
 * File: src/ai/scientific-calculator/statistical/mode.ts
 * Purpose: Atomic module for calculating mode
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Calculates mode (most frequent value) of numbers
 * @param numbers - Array of numbers
 * @returns Mode value(s)
 * @throws Error if array is empty
 * @example mode(1, 2, 2, 3, 4) // returns [2]
 */
export function mode(...numbers: number[]): number[] {
  if (numbers.length === 0) {
    throw new Error("Cannot calculate mode of empty array")
  }

  const frequency = new Map<number, number>()
  let maxFreq = 0

  for (const num of numbers) {
    const freq = (frequency.get(num) || 0) + 1
    frequency.set(num, freq)
    maxFreq = Math.max(maxFreq, freq)
  }

  return Array.from(frequency.entries())
    .filter(([, freq]) => freq === maxFreq)
    .map(([num]) => num)
}
