/**
 * File: src/ai/scientific-calculator/arithmetic/squareRoot.ts
 * Purpose: Atomic module for square root operation
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Calculates square root of a number
 * @param n - Number to find square root of
 * @returns Square root of n
 * @throws Error if n is negative
 * @example sqrt(9) // returns 3
 */
export function sqrt(n: number): number {
  if (n < 0) {
    throw new Error("Square root of negative number is not real")
  }
  return Math.sqrt(n)
}

/**
 * Calculates square root using Newton's method (for educational purposes)
 * @param n - Number to find square root of
 * @param precision - Desired precision (default: 0.0001)
 * @returns Approximate square root
 */
export function sqrtNewton(n: number, precision = 0.0001): number {
  if (n < 0) {
    throw new Error("Square root of negative number is not real")
  }
  if (n === 0) return 0

  let guess = n / 2
  while (Math.abs(guess * guess - n) > precision) {
    guess = (guess + n / guess) / 2
  }
  return guess
}
