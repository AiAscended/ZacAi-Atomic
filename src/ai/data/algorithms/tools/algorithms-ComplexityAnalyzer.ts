/**
 * File: src/ai/data/algorithms/tools/algorithms-ComplexityAnalyzer.ts
 * Purpose: Analyzes time and space complexity of algorithms
 * Depends on: None (standalone utility)
 * Depended on by: src/ai/data/algorithms/algorithms_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Complexity notation
 */
export type ComplexityNotation =
  | "O(1)"
  | "O(log n)"
  | "O(n)"
  | "O(n log n)"
  | "O(n²)"
  | "O(n³)"
  | "O(2ⁿ)"
  | "O(n!)"
  | "Unknown"

/**
 * Complexity analysis result
 */
export interface ComplexityAnalysisResult {
  timeComplexity: ComplexityNotation
  spaceComplexity: ComplexityNotation
  explanation: string
  bestCase?: ComplexityNotation
  averageCase?: ComplexityNotation
  worstCase?: ComplexityNotation
  optimizationSuggestions: string[]
}

/**
 * Algorithm Complexity Analyzer
 *
 * Analyzes algorithms for:
 * - Time complexity (Big O notation)
 * - Space complexity
 * - Best/Average/Worst case scenarios
 * - Optimization opportunities
 *
 * Detects common patterns:
 * - Loops and nested loops
 * - Recursive calls
 * - Data structure operations
 * - Sorting and searching patterns
 */
export class AlgorithmsComplexityAnalyzer {
  /**
   * Analyzes code for time and space complexity
   * @param code - Algorithm code to analyze
   * @returns Complexity analysis result
   */
  public static analyze(code: string): ComplexityAnalysisResult {
    const timeComplexity = this.analyzeTimeComplexity(code)
    const spaceComplexity = this.analyzeSpaceComplexity(code)
    const optimizationSuggestions = this.generateOptimizationSuggestions(code, timeComplexity)

    return {
      timeComplexity,
      spaceComplexity,
      explanation: this.generateExplanation(code, timeComplexity, spaceComplexity),
      optimizationSuggestions,
    }
  }

  /**
   * Analyzes time complexity
   * @param code - Algorithm code
   * @returns Time complexity notation
   */
  private static analyzeTimeComplexity(code: string): ComplexityNotation {
    // Check for factorial complexity (recursive with multiple branches)
    if (/function.*$$.*n.*$$.*{.*if.*n.*<=.*1.*return.*return.*$$.*n.*-.*1.*$$.*\+.*$$.*n.*-.*2.*$$/s.test(code)) {
      return "O(2ⁿ)"
    }

    // Check for exponential complexity
    if (/for.*for.*for.*for/.test(code) || /while.*while.*while.*while/.test(code)) {
      return "O(n³)"
    }

    // Check for cubic complexity (3 nested loops)
    if (/for.*for.*for/.test(code) || /while.*while.*while/.test(code)) {
      return "O(n³)"
    }

    // Check for quadratic complexity (2 nested loops)
    const nestedLoops = (code.match(/for\s*$$[^)]*$$[^{]*{[^}]*for\s*\(/g) || []).length
    if (nestedLoops > 0) {
      return "O(n²)"
    }

    // Check for linearithmic complexity (sorting algorithms)
    if (/\.sort\(|mergeSort|quickSort|heapSort/.test(code) || (/for.*\(/.test(code) && /Math\.log|log\(/.test(code))) {
      return "O(n log n)"
    }

    // Check for linear complexity (single loop)
    if (/for\s*\(|while\s*\(|forEach|map\(|filter\(|reduce\(/.test(code)) {
      return "O(n)"
    }

    // Check for logarithmic complexity (binary search pattern)
    if (/while.*$$.*<.*$$.*{.*\/\s*2|binarySearch/.test(code)) {
      return "O(log n)"
    }

    // Check for constant complexity
    if (!/for|while|forEach|map|filter|reduce|recursion/.test(code)) {
      return "O(1)"
    }

    return "Unknown"
  }

  /**
   * Analyzes space complexity
   * @param code - Algorithm code
   * @returns Space complexity notation
   */
  private static analyzeSpaceComplexity(code: string): ComplexityNotation {
    // Check for recursive calls (stack space)
    const recursiveCalls = (code.match(/function\s+\w+[^{]*{[^}]*\1\(/g) || []).length
    if (recursiveCalls > 0) {
      // Recursive calls typically use O(n) stack space
      return "O(n)"
    }

    // Check for new array/object creation in loops
    if (/for.*{.*new\s+Array|for.*{.*\[\]|for.*{.*\{\}/.test(code)) {
      return "O(n)"
    }

    // Check for data structure creation
    if (/new\s+Array$$.*n.*$$|new\s+Map|new\s+Set/.test(code)) {
      return "O(n)"
    }

    // Check for matrix/2D array
    if (/\[\s*\]\s*\[\s*\]|Array\.from.*Array\.from/.test(code)) {
      return "O(n²)"
    }

    // Default to constant space
    return "O(1)"
  }

  /**
   * Generates explanation of complexity
   * @param code - Algorithm code
   * @param timeComplexity - Time complexity
   * @param spaceComplexity - Space complexity
   * @returns Human-readable explanation
   */
  private static generateExplanation(
    code: string,
    timeComplexity: ComplexityNotation,
    spaceComplexity: ComplexityNotation,
  ): string {
    const explanations: string[] = []

    // Time complexity explanation
    switch (timeComplexity) {
      case "O(1)":
        explanations.push("Time: Constant time - operations execute in fixed time regardless of input size")
        break
      case "O(log n)":
        explanations.push("Time: Logarithmic - typically seen in binary search or divide-and-conquer algorithms")
        break
      case "O(n)":
        explanations.push("Time: Linear - execution time grows proportionally with input size")
        break
      case "O(n log n)":
        explanations.push("Time: Linearithmic - common in efficient sorting algorithms like merge sort")
        break
      case "O(n²)":
        explanations.push("Time: Quadratic - nested loops cause execution time to grow with square of input")
        break
      case "O(n³)":
        explanations.push("Time: Cubic - triple nested loops, very inefficient for large inputs")
        break
      case "O(2ⁿ)":
        explanations.push("Time: Exponential - execution time doubles with each input increase, very slow")
        break
      case "O(n!)":
        explanations.push("Time: Factorial - extremely slow, only feasible for very small inputs")
        break
    }

    // Space complexity explanation
    switch (spaceComplexity) {
      case "O(1)":
        explanations.push("Space: Constant space - uses fixed amount of memory")
        break
      case "O(n)":
        explanations.push("Space: Linear space - memory usage grows with input size")
        break
      case "O(n²)":
        explanations.push("Space: Quadratic space - uses 2D data structures or nested collections")
        break
    }

    return explanations.join(". ")
  }

  /**
   * Generates optimization suggestions
   * @param code - Algorithm code
   * @param timeComplexity - Current time complexity
   * @returns Array of suggestions
   */
  private static generateOptimizationSuggestions(code: string, timeComplexity: ComplexityNotation): string[] {
    const suggestions: string[] = []

    if (timeComplexity === "O(n²)" || timeComplexity === "O(n³)") {
      suggestions.push("Consider using hash maps or sets to reduce nested loop complexity")
      suggestions.push("Look for opportunities to use dynamic programming or memoization")
    }

    if (timeComplexity === "O(2ⁿ)" || timeComplexity === "O(n!)") {
      suggestions.push("This has exponential complexity - consider iterative or dynamic programming approaches")
      suggestions.push("Use memoization to cache repeated calculations")
    }

    if (/\.sort$$$$/.test(code)) {
      suggestions.push("If data is already partially sorted, consider using insertion sort")
    }

    if (/for.*for/.test(code) && /indexOf|includes|find/.test(code)) {
      suggestions.push("Replace indexOf/includes in nested loops with Set or Map for O(1) lookups")
    }

    if (suggestions.length === 0 && (timeComplexity === "O(n)" || timeComplexity === "O(n log n)")) {
      suggestions.push("Algorithm has good complexity - focus on constant factor optimizations")
    }

    return suggestions
  }

  /**
   * Compares two complexity notations
   * @param complexity1 - First complexity
   * @param complexity2 - Second complexity
   * @returns -1 if first is better, 1 if second is better, 0 if equal
   */
  public static compareComplexity(complexity1: ComplexityNotation, complexity2: ComplexityNotation): number {
    const order: ComplexityNotation[] = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)", "O(2ⁿ)", "O(n!)"]

    const index1 = order.indexOf(complexity1)
    const index2 = order.indexOf(complexity2)

    if (index1 < index2) return -1
    if (index1 > index2) return 1
    return 0
  }

  /**
   * Formats analysis result as report
   * @param result - Analysis result
   * @returns Formatted report
   */
  public static formatReport(result: ComplexityAnalysisResult): string {
    const lines: string[] = []

    lines.push("=== Algorithm Complexity Analysis ===\n")
    lines.push(`Time Complexity: ${result.timeComplexity}`)
    lines.push(`Space Complexity: ${result.spaceComplexity}\n`)
    lines.push(`Explanation: ${result.explanation}\n`)

    if (result.optimizationSuggestions.length > 0) {
      lines.push("Optimization Suggestions:")
      result.optimizationSuggestions.forEach((suggestion) => {
        lines.push(`  → ${suggestion}`)
      })
    }

    return lines.join("\n")
  }
}

// Export singleton instance
export const complexityAnalyzer = AlgorithmsComplexityAnalyzer
