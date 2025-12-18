/**
 * File: src/ai/scientific-calculator/trigonometry/arccosine.ts
 * Purpose: Atomic module for arccosine (inverse cosine) function
 * Depends on: None
 * Depended on by: src/ai/scientific-calculator/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Calculates arccosine (inverse cosine) in radians
 * @param value - Value between -1 and 1
 * @returns Angle in radians
 * @throws Error if value is outside [-1, 1]
 * @example acos(1) // returns 0
 */
export function acos(value: number): number {
  if (value < -1 || value > 1) {
    throw new Error("Arccosine input must be between -1 and 1");
  }
  return Math.acos(value);
}

/**
 * Calculates arccosine in degrees
 * @param value - Value between -1 and 1
 * @returns Angle in degrees
 */
export function acosDeg(value: number): number {
  if (value < -1 || value > 1) {
    throw new Error("Arccosine input must be between -1 and 1");
  }
  return (Math.acos(value) * 180) / Math.PI;
}
