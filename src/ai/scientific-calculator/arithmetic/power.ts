/**
 * File: src/ai/scientific-calculator/arithmetic/power.ts
 * Purpose: Atomic module for power/exponentiation operation
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Raises a number to a power
 * @param base - Base number
 * @param exponent - Exponent
 * @returns Result of base^exponent
 * @example power(2, 3) // returns 8
 */
export function power(base: number, exponent: number): number {
  return Math.pow(base, exponent)
}

/**
 * Calculates square of a number
 * @param n - Number to square
 * @returns n^2
 */
export function square(n: number): number {
  return n * n
}

/**
 * Calculates cube of a number
 * @param n - Number to cube
 * @returns n^3
 */
export function cube(n: number): number {
  return n * n * n
}
