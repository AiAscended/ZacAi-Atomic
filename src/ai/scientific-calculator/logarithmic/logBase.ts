/**
 * File: src/ai/scientific-calculator/logarithmic/logBase.ts
 * Purpose: Atomic module for logarithm with arbitrary base
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Calculates logarithm with arbitrary base
 * @param x - Positive number
 * @param base - Positive base (not equal to 1)
 * @returns log_base(x)
 * @throws Error if x or base is invalid
 * @example logBase(8, 2) // returns 3
 */
export function logBase(x: number, base: number): number {
  if (x <= 0) {
    throw new Error("Logarithm of non-positive number is undefined")
  }
  if (base <= 0 || base === 1) {
    throw new Error("Invalid logarithm base")
  }
  return Math.log(x) / Math.log(base)
}
