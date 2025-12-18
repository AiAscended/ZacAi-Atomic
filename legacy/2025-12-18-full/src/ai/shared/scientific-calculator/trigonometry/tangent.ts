/**
 * File: src/ai/scientific-calculator/trigonometry/tangent.ts
 * Purpose: Atomic module for tangent trigonometric function
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Calculates tangent of an angle in radians
 * @param angleRadians - Angle in radians
 * @returns Tangent of the angle
 * @example tan(Math.PI / 4) // returns 1
 */
export function tan(angleRadians: number): number {
  return Math.tan(angleRadians);
}

/**
 * Calculates tangent of an angle in degrees
 * @param angleDegrees - Angle in degrees
 * @returns Tangent of the angle
 * @example tanDeg(45) // returns 1
 */
export function tanDeg(angleDegrees: number): number {
  return Math.tan((angleDegrees * Math.PI) / 180);
}
