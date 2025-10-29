/**
 * File: src/ai/scientific-calculator/arithmetic/absolute.ts
 * Purpose: Atomic module for absolute value operation
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Calculates absolute value of a number
 * @param n - Number
 * @returns Absolute value of n
 * @example abs(-5) // returns 5
 */
export function abs(n: number): number {
  return Math.abs(n)
}

/**
 * Returns the sign of a number
 * @param n - Number
 * @returns 1 if positive, -1 if negative, 0 if zero
 */
export function sign(n: number): number {
  return Math.sign(n)
}
