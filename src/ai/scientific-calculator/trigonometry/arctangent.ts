/**
 * File: src/ai/scientific-calculator/trigonometry/arctangent.ts
 * Purpose: Atomic module for arctangent (inverse tangent) function
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Calculates arctangent (inverse tangent) in radians
 * @param value - Any number
 * @returns Angle in radians
 * @example atan(1) // returns Math.PI / 4
 */
export function atan(value: number): number {
  return Math.atan(value)
}

/**
 * Calculates arctangent in degrees
 * @param value - Any number
 * @returns Angle in degrees
 */
export function atanDeg(value: number): number {
  return (Math.atan(value) * 180) / Math.PI
}

/**
 * Calculates arctangent of y/x with proper quadrant handling
 * @param y - Y coordinate
 * @param x - X coordinate
 * @returns Angle in radians
 */
export function atan2(y: number, x: number): number {
  return Math.atan2(y, x)
}
