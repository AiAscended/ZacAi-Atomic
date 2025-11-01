/**
 * File: src/ai/domain/mathematics/tools/mathematics-FibonacciCalculator.ts
 * Purpose: Calculates Fibonacci numbers and sequences
 * Depends on: None (pure mathematical logic)
 * Depended on by: src/ai/data/mathematics/mathematics_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Fibonacci calculation result
 */
export interface FibonacciResult {
  n: number
  value: number
  sequence?: number[]
  method: "iterative" | "recursive" | "matrix" | "formula"
  computationTime: number
}

/**
 * Fibonacci Calculator - Domain-specific tool for mathematics
 * Provides multiple methods for calculating Fibonacci numbers
 */
export class FibonacciCalculator {
  /**
   * Calculate nth Fibonacci number using iterative method (most efficient)
   */
  public static calculate(n: number): FibonacciResult {
    const startTime = performance.now()

    if (n < 0) {
      throw new Error("Fibonacci number must be non-negative")
    }

    if (n === 0) {
      return {
        n,
        value: 0,
        method: "iterative",
        computationTime: performance.now() - startTime,
      }
    }

    if (n === 1) {
      return {
        n,
        value: 1,
        method: "iterative",
        computationTime: performance.now() - startTime,
      }
    }

    let prev = 0
    let curr = 1

    for (let i = 2; i <= n; i++) {
      const next = prev + curr
      prev = curr
      curr = next
    }

    return {
      n,
      value: curr,
      method: "iterative",
      computationTime: performance.now() - startTime,
    }
  }

  /**
   * Generate Fibonacci sequence up to n terms
   */
  public static generateSequence(n: number): FibonacciResult {
    const startTime = performance.now()

    if (n < 1) {
      throw new Error("Sequence length must be positive")
    }

    const sequence: number[] = []

    if (n >= 1) sequence.push(0)
    if (n >= 2) sequence.push(1)

    for (let i = 2; i < n; i++) {
      sequence.push(sequence[i - 1] + sequence[i - 2])
    }

    return {
      n,
      value: sequence[sequence.length - 1],
      sequence,
      method: "iterative",
      computationTime: performance.now() - startTime,
    }
  }

  /**
   * Calculate using Binet's formula (closed-form solution)
   * Less accurate for large n due to floating point precision
   */
  public static calculateUsingFormula(n: number): FibonacciResult {
    const startTime = performance.now()

    if (n < 0) {
      throw new Error("Fibonacci number must be non-negative")
    }

    const phi = (1 + Math.sqrt(5)) / 2 // Golden ratio
    const psi = (1 - Math.sqrt(5)) / 2

    const value = Math.round((Math.pow(phi, n) - Math.pow(psi, n)) / Math.sqrt(5))

    return {
      n,
      value,
      method: "formula",
      computationTime: performance.now() - startTime,
    }
  }

  /**
   * Calculate using matrix exponentiation (efficient for large n)
   */
  public static calculateUsingMatrix(n: number): FibonacciResult {
    const startTime = performance.now()

    if (n < 0) {
      throw new Error("Fibonacci number must be non-negative")
    }

    if (n === 0) {
      return {
        n,
        value: 0,
        method: "matrix",
        computationTime: performance.now() - startTime,
      }
    }

    // Matrix [[1,1],[1,0]]^n gives Fibonacci numbers
    const result = this.matrixPower(
      [
        [1, 1],
        [1, 0],
      ],
      n,
    )
    const value = result[0][1]

    return {
      n,
      value,
      method: "matrix",
      computationTime: performance.now() - startTime,
    }
  }

  /**
   * Matrix multiplication helper
   */
  private static matrixMultiply(a: number[][], b: number[][]): number[][] {
    return [
      [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
      [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
    ]
  }

  /**
   * Matrix exponentiation using binary exponentiation
   */
  private static matrixPower(matrix: number[][], n: number): number[][] {
    if (n === 1) return matrix

    if (n % 2 === 0) {
      const half = this.matrixPower(matrix, n / 2)
      return this.matrixMultiply(half, half)
    } else {
      return this.matrixMultiply(matrix, this.matrixPower(matrix, n - 1))
    }
  }

  /**
   * Check if a number is a Fibonacci number
   */
  public static isFibonacci(num: number): boolean {
    if (num < 0) return false

    // A number is Fibonacci if one of (5*n^2 + 4) or (5*n^2 - 4) is a perfect square
    const check1 = 5 * num * num + 4
    const check2 = 5 * num * num - 4

    return this.isPerfectSquare(check1) || this.isPerfectSquare(check2)
  }

  /**
   * Check if a number is a perfect square
   */
  private static isPerfectSquare(n: number): boolean {
    const sqrt = Math.sqrt(n)
    return sqrt === Math.floor(sqrt)
  }

  /**
   * Find the index of a Fibonacci number
   */
  public static findIndex(value: number): number | null {
    if (!this.isFibonacci(value)) return null

    let prev = 0
    let curr = 1
    let index = 1

    if (value === 0) return 0
    if (value === 1) return 1

    while (curr < value) {
      const next = prev + curr
      prev = curr
      curr = next
      index++
    }

    return curr === value ? index : null
  }
}

/**
 * Convenience function for quick Fibonacci calculation
 */
export function fibonacci(n: number): number {
  return FibonacciCalculator.calculate(n).value
}

/**
 * Export calculator instance
 */
export const fibonacciCalc = FibonacciCalculator
