/**
 * File: src/ai/scientific-calculator/logarithmic/log2.ts
 * Purpose: Atomic module for base-2 logarithm
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Calculates base-2 logarithm
 * @param x - Positive number
 * @returns log2(x)
 * @throws Error if x is not positive
 * @example log2(8) // returns 3
 */
export function log2(x: number): number {
  if (x <= 0) {
    throw new Error("Logarithm of non-positive number is undefined")
  }
  return Math.log2(x)
}
