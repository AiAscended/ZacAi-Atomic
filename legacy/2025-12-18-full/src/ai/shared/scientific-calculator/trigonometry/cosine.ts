/**
 * File: src/ai/scientific-calculator/trigonometry/cosine.ts
 * Purpose: Atomic module for cosine trigonometric function
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Calculates cosine of an angle in radians
 * @param angleRadians - Angle in radians
 * @returns Cosine of the angle
 * @example cos(0) // returns 1
 */
export function cos(angleRadians: number): number {
  return Math.cos(angleRadians);
}

/**
 * Calculates cosine of an angle in degrees
 * @param angleDegrees - Angle in degrees
 * @returns Cosine of the angle
 * @example cosDeg(0) // returns 1
 */
export function cosDeg(angleDegrees: number): number {
  return Math.cos((angleDegrees * Math.PI) / 180);
}
