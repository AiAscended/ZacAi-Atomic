/**
 * File: src/ai/scientific-calculator/arithmetic/addition.ts
 * Purpose: Atomic module for addition operation
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Performs addition of two or more numbers
 * @param numbers - Array of numbers to add
 * @returns Sum of all numbers
 * @example add(2, 3, 4) // returns 9
 */
export function add(...numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error("Addition requires at least one number")
  }
  return numbers.reduce((sum, num) => sum + num, 0)
}

/**
 * Performs addition with precision handling for floating point
 * @param a - First number
 * @param b - Second number
 * @param precision - Number of decimal places (default: 10)
 * @returns Sum with specified precision
 */
export function addPrecise(a: number, b: number, precision = 10): number {
  const multiplier = Math.pow(10, precision)
  return Math.round((a + b) * multiplier) / multiplier
}
