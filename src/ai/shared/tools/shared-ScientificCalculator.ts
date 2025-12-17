/**
 * File: src/ai/shared/tools/shared-ScientificCalculator.ts
 * Purpose: Provides scientific calculation capabilities across all domains
 * Depends on: None (pure mathematical operations)
 * Depended on by: src/ai/data/mathematics/*, src/ai/data/science/*
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Result of a calculation operation
 */
export interface CalculationResult {
  value: number
  expression: string
  steps?: string[]
  error?: string
}

/**
 * Scientific Calculator - Provides advanced mathematical operations
 * Used across multiple domains for numerical computations
 */
export class ScientificCalculator {
  private static readonly CONSTANTS = {
    PI: Math.PI,
    E: Math.E,
    PHI: (1 + Math.sqrt(5)) / 2, // Golden ratio
    SQRT2: Math.SQRT2,
    SQRT1_2: Math.SQRT1_2,
    LN2: Math.LN2,
    LN10: Math.LN10,
    LOG2E: Math.LOG2E,
    LOG10E: Math.LOG10E,
  }

  /**
   * Evaluate a mathematical expression safely
   * Supports: +, -, *, /, ^, sqrt, sin, cos, tan, log, ln, abs, etc.
   */
  public static evaluate(expression: string): CalculationResult {
    try {
      const normalized = this.normalizeExpression(expression)
      const steps: string[] = [`Original: ${expression}`, `Normalized: ${normalized}`]

      // Replace constants
      let processed = normalized
      for (const [name, value] of Object.entries(this.CONSTANTS)) {
        processed = processed.replace(new RegExp(`\\b${name}\\b`, "gi"), value.toString())
      }
      steps.push(`Constants replaced: ${processed}`)

      // Handle functions
      processed = this.processFunctions(processed, steps)

      // Evaluate using safe evaluation
      const value = this.safeEval(processed)

      return {
        value,
        expression,
        steps,
      }
    } catch (error) {
      return {
        value: Number.NaN,
        expression,
        error: error instanceof Error ? error.message : "Calculation error",
      }
    }
  }

  /**
   * Calculate factorial of a number
   */
  public static factorial(n: number): number {
    if (n < 0 || !Number.isInteger(n)) {
      throw new Error("Factorial requires non-negative integer")
    }
    if (n === 0 || n === 1) return 1
    let result = 1
    for (let i = 2; i <= n; i++) {
      result *= i
    }
    return result
  }

  /**
   * Calculate permutations: nPr = n! / (n-r)!
   */
  public static permutation(n: number, r: number): number {
    if (r > n) return 0
    return this.factorial(n) / this.factorial(n - r)
  }

  /**
   * Calculate combinations: nCr = n! / (r! * (n-r)!)
   */
  public static combination(n: number, r: number): number {
    if (r > n) return 0
    return this.factorial(n) / (this.factorial(r) * this.factorial(n - r))
  }

  /**
   * Calculate power: base^exponent
   */
  public static power(base: number, exponent: number): number {
    return Math.pow(base, exponent)
  }

  /**
   * Calculate nth root
   */
  public static root(value: number, n: number): number {
    if (n === 0) throw new Error("Root degree cannot be zero")
    return Math.pow(value, 1 / n)
  }

  /**
   * Calculate logarithm with custom base
   */
  public static log(value: number, base = 10): number {
    if (value <= 0) throw new Error("Logarithm requires positive value")
    if (base <= 0 || base === 1) throw new Error("Invalid logarithm base")
    return Math.log(value) / Math.log(base)
  }

  /**
   * Convert degrees to radians
   */
  public static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180
  }

  /**
   * Convert radians to degrees
   */
  public static toDegrees(radians: number): number {
    return (radians * 180) / Math.PI
  }

  /**
   * Calculate greatest common divisor using Euclidean algorithm
   */
  public static gcd(a: number, b: number): number {
    a = Math.abs(Math.floor(a))
    b = Math.abs(Math.floor(b))
    while (b !== 0) {
      const temp = b
      b = a % b
      a = temp
    }
    return a
  }

  /**
   * Calculate least common multiple
   */
  public static lcm(a: number, b: number): number {
    return Math.abs(a * b) / this.gcd(a, b)
  }

  /**
   * Check if a number is prime
   */
  public static isPrime(n: number): boolean {
    if (n < 2 || !Number.isInteger(n)) return false
    if (n === 2) return true
    if (n % 2 === 0) return false
    const sqrt = Math.sqrt(n)
    for (let i = 3; i <= sqrt; i += 2) {
      if (n % i === 0) return false
    }
    return true
  }

  /**
   * Normalize mathematical expression for evaluation
   */
  private static normalizeExpression(expr: string): string {
    return expr.trim().replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/\^/g, "**");
  }

  /**
   * Process mathematical functions in expression
   */
  private static processFunctions(expr: string, steps: string[]): string {
    let processed = expr

    // Handle sqrt
    processed = processed.replace(/sqrt$$([^)]+)$$/g, (_, arg) => {
      const value = this.safeEval(arg)
      return Math.sqrt(value).toString()
    })

    // Handle trigonometric functions
    processed = processed.replace(/sin$$([^)]+)$$/g, (_, arg) => {
      const value = this.safeEval(arg)
      return Math.sin(value).toString()
    })
    processed = processed.replace(/cos$$([^)]+)$$/g, (_, arg) => {
      const value = this.safeEval(arg)
      return Math.cos(value).toString()
    })
    processed = processed.replace(/tan$$([^)]+)$$/g, (_, arg) => {
      const value = this.safeEval(arg)
      return Math.tan(value).toString()
    })

    // Handle logarithms
    processed = processed.replace(/log$$([^)]+)$$/g, (_, arg) => {
      const value = this.safeEval(arg)
      return Math.log10(value).toString()
    })
    processed = processed.replace(/ln$$([^)]+)$$/g, (_, arg) => {
      const value = this.safeEval(arg)
      return Math.log(value).toString()
    })

    // Handle absolute value
    processed = processed.replace(/abs$$([^)]+)$$/g, (_, arg) => {
      const value = this.safeEval(arg)
      return Math.abs(value).toString()
    })

    if (processed !== expr) {
      steps.push(`Functions processed: ${processed}`)
    }

    return processed
  }

  /**
   * Safely evaluate a mathematical expression
   * Only allows numbers and basic operators
   */
  private static safeEval(expr: string): number {
    // Validate expression contains only safe characters
    if (!/^[\d+\-*/.%()e\s]+$/.test(expr)) {
      throw new Error("Invalid characters in expression")
    }

    // Use Function constructor for safe evaluation
    try {
      return new Function(`"use strict"; return (${expr})`)() as number
    } catch (error) {
      throw new Error(`Evaluation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}

/**
 * Convenience function for quick calculations
 */
export function calculate(expression: string): CalculationResult {
  return ScientificCalculator.evaluate(expression)
}

/**
 * Export calculator instance for direct use
 */
export const calculator = ScientificCalculator
