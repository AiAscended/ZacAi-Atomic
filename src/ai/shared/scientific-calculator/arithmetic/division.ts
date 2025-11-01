/**
 * File: src/ai/scientific-calculator/arithmetic/division.ts
 * Purpose: Atomic module for division operation
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Performs division of two numbers
 * @param dividend - Number to be divided
 * @param divisor - Number to divide by
 * @returns Quotient
 * @throws Error if divisor is zero
 * @example divide(10, 2) // returns 5
 */
export function divide(dividend: number, divisor: number): number {
  if (divisor === 0) {
    throw new Error("Division by zero is undefined")
  }
  return dividend / divisor
}

/**
 * Performs division with precision handling
 * @param dividend - Number to be divided
 * @param divisor - Number to divide by
 * @param precision - Number of decimal places (default: 10)
 * @returns Quotient with specified precision
 */
export function dividePrecise(dividend: number, divisor: number, precision = 10): number {
  if (divisor === 0) {
    throw new Error("Division by zero is undefined")
  }
  const multiplier = Math.pow(10, precision)
  return Math.round((dividend / divisor) * multiplier) / multiplier
}
