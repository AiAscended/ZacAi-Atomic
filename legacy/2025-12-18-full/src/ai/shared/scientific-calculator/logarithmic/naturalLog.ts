/**
 * File: src/ai/scientific-calculator/logarithmic/naturalLog.ts
 * Purpose: Atomic module for natural logarithm (base e)
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Calculates natural logarithm (base e)
 * @param x - Positive number
 * @returns ln(x)
 * @throws Error if x is not positive
 * @example ln(Math.E) // returns 1
 */
export function ln(x: number): number {
  if (x <= 0) {
    throw new Error("Logarithm of non-positive number is undefined");
  }
  return Math.log(x);
}
