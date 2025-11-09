/**
 * File: src/ai/scientific-calculator/exponential/powerOfTen.ts
 * Purpose: Atomic module for 10^x calculation
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Calculates 10 raised to the power of x
 * @param x - Exponent
 * @returns 10^x
 * @example pow10(3) // returns 1000
 */
export function pow10(x: number): number {
  return Math.pow(10, x);
}
