/**
 * File: src/ai/scientific-calculator/statistical/variance.ts
 * Purpose: Atomic module for calculating variance
 * Depends on: src/ai/scientific-calculator/statistical/mean.ts
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { mean } from "./mean";

/**
 * Calculates variance of numbers
 * @param numbers - Array of numbers
 * @param sample - If true, calculates sample variance (default: false for population)
 * @returns Variance
 * @throws Error if array is empty
 * @example variance(2, 4, 4, 4, 5, 5, 7, 9) // returns 4
 */
export function variance(...numbers: number[]): number;
export function variance(sample: boolean, ...numbers: number[]): number;
export function variance(...args: (number | boolean)[]): number {
  let sample = false;
  let numbers: number[];

  if (typeof args[0] === "boolean") {
    sample = args[0];
    numbers = args.slice(1) as number[];
  } else {
    numbers = args as number[];
  }

  if (numbers.length === 0) {
    throw new Error("Cannot calculate variance of empty array");
  }

  const avg = mean(...numbers);
  const squaredDiffs = numbers.map((num) => Math.pow(num - avg, 2));

  return (
    squaredDiffs.reduce((sum, diff) => sum + diff, 0) /
    (sample ? numbers.length - 1 : numbers.length)
  );
}
