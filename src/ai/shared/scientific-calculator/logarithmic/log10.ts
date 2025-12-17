/**
 * File: src/ai/scientific-calculator/logarithmic/log10.ts
 * Purpose: Atomic module for base-10 logarithm
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Calculates base-10 logarithm
 * @param x - Positive number
 * @returns log10(x)
 * @throws Error if x is not positive
 * @example log10(100) // returns 2
 */
export function log10(x: number): number {
  if (x <= 0) {
    throw new Error("Logarithm of non-positive number is undefined");
  }
  return Math.log10(x);
}
