/**
 * File: src/ai/scientific-calculator/statistical/standardDeviation.ts
 * Purpose: Atomic module for calculating standard deviation
 * Depends on: src/ai/scientific-calculator/statistical/mean.ts
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { mean } from "./mean"

/**
 * Calculates standard deviation of numbers
 * @param numbers - Array of numbers
 * @param sample - If true, calculates sample standard deviation (default: false for population)
 * @returns Standard deviation
 * @throws Error if array is empty or has only one element for sample calculation
 * @example stdDev(2, 4, 4, 4, 5, 5, 7, 9) // returns 2
 */
export function stdDev(...numbers: number[]): number
export function stdDev(sample: boolean, ...numbers: number[]): number
export function stdDev(...args: (number | boolean)[]): number {
  let sample = false
  let numbers: number[]

  if (typeof args[0] === "boolean") {
    sample = args[0]
    numbers = args.slice(1) as number[]
  } else {
    numbers = args as number[]
  }

  if (numbers.length === 0) {
    throw new Error("Cannot calculate standard deviation of empty array")
  }
  if (sample && numbers.length === 1) {
    throw new Error("Cannot calculate sample standard deviation with only one value")
  }

  const avg = mean(...numbers)
  const squaredDiffs = numbers.map((num) => Math.pow(num - avg, 2))
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / (sample ? numbers.length - 1 : numbers.length)

  return Math.sqrt(variance)
}
