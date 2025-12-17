/**
 * File: src/ai/scientific-calculator/arithmetic/nthRoot.ts
 * Purpose: Atomic module for nth root operation
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Calculates nth root of a number
 * @param n - Number to find root of
 * @param root - Which root to calculate
 * @returns nth root of n
 * @example nthRoot(27, 3) // returns 3 (cube root of 27)
 */
export function nthRoot(n: number, root: number): number {
  if (root === 0) {
    throw new Error("Root cannot be zero");
  }
  if (n < 0 && root % 2 === 0) {
    throw new Error("Even root of negative number is not real");
  }

  const sign = n < 0 ? -1 : 1;
  return sign * Math.pow(Math.abs(n), 1 / root);
}

/**
 * Calculates cube root of a number
 * @param n - Number to find cube root of
 * @returns Cube root of n
 */
export function cbrt(n: number): number {
  return Math.cbrt(n);
}
