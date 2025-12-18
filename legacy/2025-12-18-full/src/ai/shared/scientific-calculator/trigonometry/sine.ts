/**
 * File: src/ai/scientific-calculator/trigonometry/sine.ts
 * Purpose: Atomic module for sine trigonometric function
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Calculates sine of an angle in radians
 * @param angleRadians - Angle in radians
 * @returns Sine of the angle
 * @example sin(Math.PI / 2) // returns 1
 */
export function sin(angleRadians: number): number {
  return Math.sin(angleRadians);
}

/**
 * Calculates sine of an angle in degrees
 * @param angleDegrees - Angle in degrees
 * @returns Sine of the angle
 * @example sinDeg(90) // returns 1
 */
export function sinDeg(angleDegrees: number): number {
  return Math.sin((angleDegrees * Math.PI) / 180);
}
