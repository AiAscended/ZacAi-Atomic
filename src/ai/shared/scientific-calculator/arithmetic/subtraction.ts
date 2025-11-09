/**
 * File: src/ai/scientific-calculator/arithmetic/subtraction.ts
 * Purpose: Atomic module for subtraction operation
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Performs subtraction of numbers
 * @param minuend - Number to subtract from
 * @param subtrahends - Numbers to subtract
 * @returns Result of subtraction
 * @example subtract(10, 3, 2) // returns 5
 */
export function subtract(minuend: number, ...subtrahends: number[]): number {
  if (subtrahends.length === 0) {
    throw new Error("Subtraction requires at least two numbers");
  }
  return subtrahends.reduce((result, num) => result - num, minuend);
}

/**
 * Performs subtraction with precision handling
 * @param a - First number
 * @param b - Second number
 * @param precision - Number of decimal places (default: 10)
 * @returns Difference with specified precision
 */
export function subtractPrecise(a: number, b: number, precision = 10): number {
  const multiplier = Math.pow(10, precision);
  return Math.round((a - b) * multiplier) / multiplier;
}
