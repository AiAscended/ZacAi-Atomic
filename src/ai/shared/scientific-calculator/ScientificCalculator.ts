/**
 * File: src/ai/scientific-calculator/ScientificCalculator.ts
 * Purpose: Main calculator class that provides a unified interface to all calculator functions
 * Depends on: All calculator function modules
 * Depended on by: src/ai/orchestration/aiOrchestrator.ts, all domain modules
 * Creator: Vercel v0 Coding Assistant
 */

import * as calc from "./index";

/**
 * ScientificCalculator class provides a unified interface to all calculator functions
 * Can be instantiated and used across all AI domains and modules
 */
export class ScientificCalculator {
  // Arithmetic operations
  add = calc.add;
  subtract = calc.subtract;
  multiply = calc.multiply;
  divide = calc.divide;
  modulo = calc.modulo;
  power = calc.power;
  sqrt = calc.sqrt;
  nthRoot = calc.nthRoot;
  abs = calc.abs;

  // Trigonometric operations
  sin = calc.sin;
  cos = calc.cos;
  tan = calc.tan;
  asin = calc.asin;
  acos = calc.acos;
  atan = calc.atan;
  sinh = calc.sinh;
  cosh = calc.cosh;
  tanh = calc.tanh;

  // Logarithmic operations
  ln = calc.ln;
  log10 = calc.log10;
  log2 = calc.log2;
  logBase = calc.logBase;

  // Exponential operations
  exp = calc.exp;
  pow10 = calc.pow10;
  pow2 = calc.pow2;

  // Statistical operations
  mean = calc.mean;
  median = calc.median;
  mode = calc.mode;
  stdDev = calc.stdDev;
  variance = calc.variance;

  // Constants
  readonly PI = calc.PI;
  readonly E = calc.E;
  readonly PHI = calc.PHI;
  readonly TAU = calc.TAU;

  /**
   * Evaluates a mathematical expression string
   * @param expression - Mathematical expression (e.g., "2 + 3 * 4")
   * @returns Result of the expression
   */
  evaluate(expression: string): number {
    try {
      // Remove any non-mathematical characters for safety
      const sanitized = expression.replace(/[^0-9+\-*/().√πe\s]/g, "");
      // Replace mathematical symbols with JavaScript equivalents
      const jsExpression = sanitized
        .replace(/π/g, String(Math.PI))
        .replace(/e/g, String(Math.E))
        .replace(/√/g, "Math.sqrt");

      // Use Function constructor for safe evaluation
      return new Function(`return ${jsExpression}`)();
    } catch (error) {
      throw new Error(`Invalid mathematical expression: ${expression}`);
    }
  }
}

// Export singleton instance for convenience
export const calculator = new ScientificCalculator();
