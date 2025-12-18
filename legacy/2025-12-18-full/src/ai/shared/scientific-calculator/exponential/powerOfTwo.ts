/**
 * File: src/ai/scientific-calculator/exponential/powerOfTwo.ts
 * Purpose: Atomic module for 2^x calculation
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Calculates 2 raised to the power of x
 * @param x - Exponent
 * @returns 2^x
 * @example pow2(10) // returns 1024
 */
export function pow2(x: number): number {
  return Math.pow(2, x);
}
