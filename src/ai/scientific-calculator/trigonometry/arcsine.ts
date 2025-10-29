/**
 * File: src/ai/scientific-calculator/trigonometry/arcsine.ts
 * Purpose: Atomic module for arcsine (inverse sine) function
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Calculates arcsine (inverse sine) in radians
 * @param value - Value between -1 and 1
 * @returns Angle in radians
 * @throws Error if value is outside [-1, 1]
 * @example asin(1) // returns Math.PI / 2
 */
export function asin(value: number): number {
  if (value < -1 || value > 1) {
    throw new Error("Arcsine input must be between -1 and 1")
  }
  return Math.asin(value)
}

/**
 * Calculates arcsine in degrees
 * @param value - Value between -1 and 1
 * @returns Angle in degrees
 */
export function asinDeg(value: number): number {
  if (value < -1 || value > 1) {
    throw new Error("Arcsine input must be between -1 and 1")
  }
  return (Math.asin(value) * 180) / Math.PI
}
