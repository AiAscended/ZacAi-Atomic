/**
 * File: src/ai/scientific-calculator/arithmetic/modulo.ts
 * Purpose: Atomic module for modulo operation
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Performs modulo operation (remainder after division)
 * @param dividend - Number to be divided
 * @param divisor - Number to divide by
 * @returns Remainder
 * @throws Error if divisor is zero
 * @example modulo(10, 3) // returns 1
 */
export function modulo(dividend: number, divisor: number): number {
  if (divisor === 0) {
    throw new Error("Modulo by zero is undefined")
  }
  return dividend % divisor
}

/**
 * Performs Euclidean modulo (always returns positive result)
 * @param dividend - Number to be divided
 * @param divisor - Number to divide by
 * @returns Positive remainder
 */
export function euclideanModulo(dividend: number, divisor: number): number {
  if (divisor === 0) {
    throw new Error("Modulo by zero is undefined")
  }
  return ((dividend % divisor) + divisor) % divisor
}
