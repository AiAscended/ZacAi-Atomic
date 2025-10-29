/**
 * File: src/ai/data/programming/tools/programming-CodeAnalyzer.ts
 * Purpose: Analyze code structure, complexity, and patterns
 * Depends on: None (standalone tool)
 * Depended on by: src/ai/data/programming/programming_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Analyze code complexity (cyclomatic complexity approximation)
 * @param code - Source code to analyze
 * @returns Complexity score and analysis
 */
export function analyzeComplexity(code: string): {
  score: number
  level: "low" | "medium" | "high" | "very high"
  details: string
} {
  // Count decision points: if, else, for, while, case, catch, &&, ||, ?
  const decisionPoints = (code.match(/\b(if|else|for|while|case|catch)\b|&&|\|\||\?/g) || []).length

  const score = decisionPoints + 1 // Base complexity is 1

  let level: "low" | "medium" | "high" | "very high"
  if (score <= 5) level = "low"
  else if (score <= 10) level = "medium"
  else if (score <= 20) level = "high"
  else level = "very high"

  return {
    score,
    level,
    details: `Found ${decisionPoints} decision points. Cyclomatic complexity: ${score}`,
  }
}

/**
 * Detect code patterns and anti-patterns
 * @param code - Source code to analyze
 * @returns Detected patterns
 */
export function detectPatterns(code: string): {
  patterns: string[]
  antiPatterns: string[]
} {
  const patterns: string[] = []
  const antiPatterns: string[] = []

  // Detect patterns
  if (code.includes("class") && code.includes("extends")) {
    patterns.push("Inheritance")
  }
  if (code.match(/function\s+\w+\s*$$[^)]*$$\s*\{[^}]*return/)) {
    patterns.push("Pure Functions")
  }
  if (code.includes("async") && code.includes("await")) {
    patterns.push("Async/Await")
  }
  if (code.match(/\btry\s*\{[\s\S]*\}\s*catch/)) {
    patterns.push("Error Handling")
  }

  // Detect anti-patterns
  if (code.match(/var\s+\w+/)) {
    antiPatterns.push("Using var instead of let/const")
  }
  if (code.match(/==(?!=)/g)?.length || 0 > 0) {
    antiPatterns.push("Using == instead of ===")
  }
  if (code.match(/console\.log/g)?.length || 0 > 3) {
    antiPatterns.push("Excessive console.log statements")
  }
  if (code.match(/function\s+\w+\s*$$[^)]{50,}$$/)) {
    antiPatterns.push("Functions with too many parameters")
  }

  return { patterns, antiPatterns }
}

/**
 * Extract function signatures from code
 * @param code - Source code to analyze
 * @returns Array of function signatures
 */
export function extractFunctions(code: string): Array<{
  name: string
  params: string[]
  isAsync: boolean
}> {
  const functions: Array<{ name: string; params: string[]; isAsync: boolean }> = []

  // Match function declarations and expressions
  const functionRegex = /(async\s+)?function\s+(\w+)\s*$$([^)]*)$$/g
  const arrowRegex = /(async\s+)?(?:const|let|var)\s+(\w+)\s*=\s*$$([^)]*)$$\s*=>/g

  let match
  while ((match = functionRegex.exec(code)) !== null) {
    functions.push({
      name: match[2],
      params: match[3]
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      isAsync: !!match[1],
    })
  }

  while ((match = arrowRegex.exec(code)) !== null) {
    functions.push({
      name: match[2],
      params: match[3]
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      isAsync: !!match[1],
    })
  }

  return functions
}
