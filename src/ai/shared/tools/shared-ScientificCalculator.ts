/**
 * File: src/ai/shared/tools/shared-ScientificCalculator.ts
 * Purpose: Scientific calculator for advanced mathematical operations
 * Depends on: None (standalone utility)
 * Depended on by: src/ai/data/mathematics/mathematics_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Scientific Calculator - Provides advanced mathematical operations
 *
 * Features:
 * - Basic arithmetic (add, subtract, multiply, divide)
 * - Trigonometric functions (sin, cos, tan, etc.)
 * - Logarithmic and exponential functions
 * - Statistical operations
 * - Constants (PI, E, etc.)
 *
 * All angles are in radians unless otherwise specified.
 */
export class ScientificCalculator {
  // Mathematical constants
  public static readonly PI = Math.PI
  public static readonly E = Math.E
  public static readonly GOLDEN_RATIO = 1.618033988749895
  public static readonly SQRT2 = Math.SQRT2

  /**
   * Evaluates a mathematical expression string
   * @param expression - Mathematical expression (e.g., "2 + 3 * 4")
   * @returns Calculated result
   * @throws Error if expression is invalid
   */
  public static evaluate(expression: string): number {
    try {
      // Remove whitespace
      const cleaned = expression.replace(/\s+/g, "")

      // Security: Only allow numbers, operators, and math functions
      if (!/^[0-9+\-*/().^%\s]+$/.test(cleaned.replace(/sqrt|sin|cos|tan|log|ln|exp|abs|pow/g, ""))) {
        throw new Error("Invalid characters in expression")
      }

      // Replace common math notation
      const processed = cleaned
        .replace(/\^/g, "**") // Power operator
        .replace(/sqrt$$([^)]+)$$/g, "Math.sqrt($1)")
        .replace(/sin$$([^)]+)$$/g, "Math.sin($1)")
        .replace(/cos$$([^)]+)$$/g, "Math.cos($1)")
        .replace(/tan$$([^)]+)$$/g, "Math.tan($1)")
        .replace(/log$$([^)]+)$$/g, "Math.log10($1)")
        .replace(/ln$$([^)]+)$$/g, "Math.log($1)")
        .replace(/exp$$([^)]+)$$/g, "Math.exp($1)")
        .replace(/abs$$([^)]+)$$/g, "Math.abs($1)")

      // Evaluate using Function constructor (safer than eval)
      const result = new Function(`return ${processed}`)()

      if (typeof result !== "number" || !isFinite(result)) {
        throw new Error("Result is not a valid number")
      }

      return result
    } catch (error) {
      throw new Error(`Failed to evaluate expression: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Adds two or more numbers
   * @param numbers - Numbers to add
   * @returns Sum of all numbers
   */
  public static add(...numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0)
  }

  /**
   * Subtracts numbers sequentially
   * @param numbers - Numbers to subtract
   * @returns Result of subtraction
   */
  public static subtract(...numbers: number[]): number {
    if (numbers.length === 0) return 0
    return numbers.slice(1).reduce((diff, num) => diff - num, numbers[0])
  }

  /**
   * Multiplies two or more numbers
   * @param numbers - Numbers to multiply
   * @returns Product of all numbers
   */
  public static multiply(...numbers: number[]): number {
    return numbers.reduce((product, num) => product * num, 1)
  }

  /**
   * Divides numbers sequentially
   * @param numbers - Numbers to divide
   * @returns Result of division
   * @throws Error if division by zero
   */
  public static divide(...numbers: number[]): number {
    if (numbers.length === 0) return 0
    if (numbers.slice(1).some((num) => num === 0)) {
      throw new Error("Division by zero")
    }
    return numbers.slice(1).reduce((quotient, num) => quotient / num, numbers[0])
  }

  /**
   * Calculates power (base^exponent)
   * @param base - Base number
   * @param exponent - Exponent
   * @returns Result of base raised to exponent
   */
  public static power(base: number, exponent: number): number {
    return Math.pow(base, exponent)
  }

  /**
   * Calculates square root
   * @param value - Number to find square root of
   * @returns Square root
   * @throws Error if value is negative
   */
  public static sqrt(value: number): number {
    if (value < 0) {
      throw new Error("Cannot calculate square root of negative number")
    }
    return Math.sqrt(value)
  }

  /**
   * Calculates factorial of a number
   * @param n - Non-negative integer
   * @returns Factorial of n
   * @throws Error if n is negative or not an integer
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
   * Calculates sine of an angle (in radians)
   * @param angle - Angle in radians
   * @returns Sine value
   */
  public static sin(angle: number): number {
    return Math.sin(angle)
  }

  /**
   * Calculates cosine of an angle (in radians)
   * @param angle - Angle in radians
   * @returns Cosine value
   */
  public static cos(angle: number): number {
    return Math.cos(angle)
  }

  /**
   * Calculates tangent of an angle (in radians)
   * @param angle - Angle in radians
   * @returns Tangent value
   */
  public static tan(angle: number): number {
    return Math.tan(angle)
  }

  /**
   * Converts degrees to radians
   * @param degrees - Angle in degrees
   * @returns Angle in radians
   */
  public static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  /**
   * Converts radians to degrees
   * @param radians - Angle in radians
   * @returns Angle in degrees
   */
  public static radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI)
  }

  /**
   * Calculates natural logarithm (base e)
   * @param value - Positive number
   * @returns Natural logarithm
   * @throws Error if value is not positive
   */
  public static ln(value: number): number {
    if (value <= 0) {
      throw new Error("Logarithm requires positive number")
    }
    return Math.log(value)
  }

  /**
   * Calculates logarithm base 10
   * @param value - Positive number
   * @returns Logarithm base 10
   * @throws Error if value is not positive
   */
  public static log10(value: number): number {
    if (value <= 0) {
      throw new Error("Logarithm requires positive number")
    }
    return Math.log10(value)
  }

  /**
   * Calculates e raised to the power of x
   * @param x - Exponent
   * @returns e^x
   */
  public static exp(x: number): number {
    return Math.exp(x)
  }

  /**
   * Calculates absolute value
   * @param value - Number
   * @returns Absolute value
   */
  public static abs(value: number): number {
    return Math.abs(value)
  }

  /**
   * Rounds a number to specified decimal places
   * @param value - Number to round
   * @param decimals - Number of decimal places (default: 0)
   * @returns Rounded number
   */
  public static round(value: number, decimals = 0): number {
    const multiplier = Math.pow(10, decimals)
    return Math.round(value * multiplier) / multiplier
  }

  /**
   * Calculates the mean (average) of numbers
   * @param numbers - Array of numbers
   * @returns Mean value
   * @throws Error if array is empty
   */
  public static mean(numbers: number[]): number {
    if (numbers.length === 0) {
      throw new Error("Cannot calculate mean of empty array")
    }
    return this.add(...numbers) / numbers.length
  }

  /**
   * Calculates the median of numbers
   * @param numbers - Array of numbers
   * @returns Median value
   * @throws Error if array is empty
   */
  public static median(numbers: number[]): number {
    if (numbers.length === 0) {
      throw new Error("Cannot calculate median of empty array")
    }

    const sorted = [...numbers].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2
    }
    return sorted[mid]
  }

  /**
   * Calculates standard deviation
   * @param numbers - Array of numbers
   * @returns Standard deviation
   * @throws Error if array has less than 2 elements
   */
  public static standardDeviation(numbers: number[]): number {
    if (numbers.length < 2) {
      throw new Error("Standard deviation requires at least 2 numbers")
    }

    const avg = this.mean(numbers)
    const squaredDiffs = numbers.map((num) => Math.pow(num - avg, 2))
    const variance = this.mean(squaredDiffs)

    return Math.sqrt(variance)
  }

  /**
   * Finds the maximum value in an array
   * @param numbers - Array of numbers
   * @returns Maximum value
   * @throws Error if array is empty
   */
  public static max(numbers: number[]): number {
    if (numbers.length === 0) {
      throw new Error("Cannot find max of empty array")
    }
    return Math.max(...numbers)
  }

  /**
   * Finds the minimum value in an array
   * @param numbers - Array of numbers
   * @returns Minimum value
   * @throws Error if array is empty
   */
  public static min(numbers: number[]): number {
    if (numbers.length === 0) {
      throw new Error("Cannot find min of empty array")
    }
    return Math.min(...numbers)
  }

  /**
   * Calculates percentage
   * @param part - Part value
   * @param whole - Whole value
   * @returns Percentage (0-100)
   */
  public static percentage(part: number, whole: number): number {
    if (whole === 0) {
      throw new Error("Cannot calculate percentage with zero whole")
    }
    return (part / whole) * 100
  }

  /**
   * Calculates greatest common divisor (GCD)
   * @param a - First number
   * @param b - Second number
   * @returns GCD of a and b
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
   * Calculates least common multiple (LCM)
   * @param a - First number
   * @param b - Second number
   * @returns LCM of a and b
   */
  public static lcm(a: number, b: number): number {
    return Math.abs(a * b) / this.gcd(a, b)
  }
}

// Export singleton instance for convenience
export const calculator = ScientificCalculator
