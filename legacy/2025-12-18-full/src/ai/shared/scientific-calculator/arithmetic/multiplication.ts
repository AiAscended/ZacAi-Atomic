/**
 * File: src/ai/scientific-calculator/arithmetic/multiplication.ts
 * Purpose: Atomic module for multiplication operation
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Performs multiplication of two or more numbers
 * @param numbers - Array of numbers to multiply
 * @returns Product of all numbers
 * @example multiply(2, 3, 4) // returns 24
 */
export function multiply(...numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error("Multiplication requires at least one number");
  }
  return numbers.reduce((product, num) => product * num, 1);
}

/**
 * Performs multiplication with precision handling
 * @param a - First number
 * @param b - Second number
 * @param precision - Number of decimal places (default: 10)
 * @returns Product with specified precision
 */
export function multiplyPrecise(a: number, b: number, precision = 10): number {
  const multiplier = Math.pow(10, precision);
  return Math.round(a * b * multiplier) / multiplier;
}
