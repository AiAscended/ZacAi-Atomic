/**
 * File: src/ai/data/code_review/tools/code_review-QualityAnalyzer.ts
 * Purpose: Analyzes code quality, complexity, and maintainability
 * Depends on: src/ai/shared/tools/shared-CodeLinter.ts
 * Depended on by: src/ai/data/code_review/code_review_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { CodeLinter, type LintResult } from "../../../shared/tools/shared-CodeLinter"

/**
 * Code quality metrics
 */
export interface QualityMetrics {
  complexity: number
  maintainability: number
  readability: number
  testability: number
  overallScore: number
}

/**
 * Code quality analysis result
 */
export interface QualityAnalysisResult {
  metrics: QualityMetrics
  issues: string[]
  suggestions: string[]
  strengths: string[]
  lintResult: LintResult
  grade: "A" | "B" | "C" | "D" | "F"
}

/**
 * Code Review Quality Analyzer
 *
 * Analyzes code for:
 * - Cyclomatic complexity
 * - Code maintainability
 * - Readability metrics
 * - Testability assessment
 * - Best practices adherence
 *
 * Provides actionable suggestions for improvement.
 */
export class CodeReviewQualityAnalyzer {
  /**
   * Analyzes code quality and returns comprehensive metrics
   * @param code - Source code to analyze
   * @param language - Programming language
   * @returns Quality analysis result
   */
  public static analyze(
    code: string,
    language: "typescript" | "javascript" | "python" = "typescript",
  ): QualityAnalysisResult {
    const lintResult = language === "python" ? CodeLinter.lintPython(code) : CodeLinter.lintTypeScript(code, language)

    const metrics = this.calculateMetrics(code, language)
    const issues: string[] = []
    const suggestions: string[] = []
    const strengths: string[] = []

    // Analyze complexity
    if (metrics.complexity > 15) {
      issues.push("High cyclomatic complexity detected")
      suggestions.push("Consider breaking down complex functions into smaller, more focused functions")
    } else if (metrics.complexity < 5) {
      strengths.push("Low complexity - code is easy to understand")
    }

    // Analyze maintainability
    if (metrics.maintainability < 50) {
      issues.push("Low maintainability score")
      suggestions.push("Add comments, improve naming, and reduce function length")
    } else if (metrics.maintainability > 80) {
      strengths.push("High maintainability - well-structured code")
    }

    // Analyze readability
    if (metrics.readability < 60) {
      issues.push("Readability could be improved")
      suggestions.push("Use descriptive variable names and add whitespace for clarity")
    } else if (metrics.readability > 85) {
      strengths.push("Excellent readability")
    }

    // Check for common anti-patterns
    this.detectAntiPatterns(code, issues, suggestions)

    // Add lint issues
    lintResult.issues.forEach((issue) => {
      if (issue.severity === "error") {
        issues.push(`Line ${issue.line}: ${issue.message}`)
      }
    })

    // Determine grade
    const grade = this.calculateGrade(metrics.overallScore)

    return {
      metrics,
      issues,
      suggestions,
      strengths,
      lintResult,
      grade,
    }
  }

  /**
   * Calculates quality metrics for code
   * @param code - Source code
   * @param language - Programming language
   * @returns Quality metrics
   */
  private static calculateMetrics(code: string, language: string): QualityMetrics {
    const lines = code.split("\n")
    const nonEmptyLines = lines.filter((line) => line.trim().length > 0)

    // Calculate cyclomatic complexity (simplified)
    const complexity = this.calculateComplexity(code)

    // Calculate maintainability index (simplified)
    const maintainability = this.calculateMaintainability(code, complexity)

    // Calculate readability score
    const readability = this.calculateReadability(code)

    // Calculate testability score
    const testability = this.calculateTestability(code)

    // Overall score (weighted average)
    const overallScore = complexity * 0.25 + maintainability * 0.35 + readability * 0.25 + testability * 0.15

    return {
      complexity,
      maintainability,
      readability,
      testability,
      overallScore,
    }
  }

  /**
   * Calculates cyclomatic complexity
   * @param code - Source code
   * @returns Complexity score (lower is better, inverted for scoring)
   */
  private static calculateComplexity(code: string): number {
    // Count decision points
    const ifCount = (code.match(/\bif\s*\(/g) || []).length
    const forCount = (code.match(/\bfor\s*\(/g) || []).length
    const whileCount = (code.match(/\bwhile\s*\(/g) || []).length
    const caseCount = (code.match(/\bcase\s+/g) || []).length
    const catchCount = (code.match(/\bcatch\s*\(/g) || []).length
    const ternaryCount = (code.match(/\?[^:]*:/g) || []).length
    const andOrCount = (code.match(/&&|\|\|/g) || []).length

    const totalComplexity = ifCount + forCount + whileCount + caseCount + catchCount + ternaryCount + andOrCount

    // Invert and normalize to 0-100 scale (lower complexity = higher score)
    return Math.max(0, 100 - totalComplexity * 5)
  }

  /**
   * Calculates maintainability index
   * @param code - Source code
   * @param complexity - Complexity score
   * @returns Maintainability score (0-100)
   */
  private static calculateMaintainability(code: string, complexity: number): number {
    const lines = code.split("\n")
    const nonEmptyLines = lines.filter((line) => line.trim().length > 0)

    // Count comments
    const commentLines = lines.filter((line) => line.trim().startsWith("//") || line.trim().startsWith("*"))
    const commentRatio = commentLines.length / Math.max(nonEmptyLines.length, 1)

    // Average line length
    const avgLineLength = nonEmptyLines.reduce((sum, line) => sum + line.length, 0) / Math.max(nonEmptyLines.length, 1)

    // Function count (more smaller functions = better)
    const functionCount = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length

    // Calculate maintainability
    let score = 50 // Base score

    // Bonus for comments
    score += commentRatio * 30

    // Penalty for long lines
    if (avgLineLength > 80) {
      score -= (avgLineLength - 80) * 0.2
    }

    // Bonus for modular code
    score += Math.min(functionCount * 2, 20)

    // Factor in complexity
    score = (score + complexity) / 2

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Calculates readability score
   * @param code - Source code
   * @returns Readability score (0-100)
   */
  private static calculateReadability(code: string): number {
    const lines = code.split("\n")
    let score = 70 // Base score

    // Check for descriptive naming
    const shortVarNames = (code.match(/\b[a-z]\b/g) || []).length
    score -= shortVarNames * 2

    // Check for whitespace
    const emptyLines = lines.filter((line) => line.trim().length === 0).length
    const whitespaceRatio = emptyLines / Math.max(lines.length, 1)
    score += whitespaceRatio * 30

    // Check for consistent indentation
    const indentationConsistent = this.checkIndentation(lines)
    if (indentationConsistent) {
      score += 10
    }

    // Check for magic numbers
    const magicNumbers = (code.match(/\b\d{2,}\b/g) || []).length
    score -= magicNumbers * 1

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Calculates testability score
   * @param code - Source code
   * @returns Testability score (0-100)
   */
  private static calculateTestability(code: string): number {
    let score = 60 // Base score

    // Check for pure functions (no side effects indicators)
    const globalVarAccess = (code.match(/window\.|document\.|global\./g) || []).length
    score -= globalVarAccess * 5

    // Check for dependency injection patterns
    const hasConstructorParams = /constructor\s*$$[^)]+$$/.test(code)
    if (hasConstructorParams) {
      score += 10
    }

    // Check for small functions
    const functions = code.match(/function\s+\w+[^{]*\{[^}]*\}/g) || []
    const avgFunctionSize = functions.reduce((sum, fn) => sum + fn.length, 0) / Math.max(functions.length, 1)
    if (avgFunctionSize < 200) {
      score += 15
    }

    // Check for interfaces/types (TypeScript)
    const hasTypes = /interface\s+\w+|type\s+\w+/.test(code)
    if (hasTypes) {
      score += 15
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Checks if indentation is consistent
   * @param lines - Code lines
   * @returns True if consistent
   */
  private static checkIndentation(lines: string[]): boolean {
    const indents = lines.filter((line) => line.trim().length > 0).map((line) => line.length - line.trimStart().length)

    // Check if all indents are multiples of 2 or 4
    const allMultiplesOf2 = indents.every((indent) => indent % 2 === 0)
    const allMultiplesOf4 = indents.every((indent) => indent % 4 === 0)

    return allMultiplesOf2 || allMultiplesOf4
  }

  /**
   * Detects common anti-patterns in code
   * @param code - Source code
   * @param issues - Issues array to populate
   * @param suggestions - Suggestions array to populate
   */
  private static detectAntiPatterns(code: string, issues: string[], suggestions: string[]): void {
    // God object / Large class
    if (code.length > 1000) {
      issues.push("Large code block detected (possible God Object)")
      suggestions.push("Consider splitting into smaller, focused modules")
    }

    // Nested callbacks (callback hell)
    const nestedCallbacks = (code.match(/\)\s*\{[^}]*$$[^)]*$$\s*\{/g) || []).length
    if (nestedCallbacks > 3) {
      issues.push("Deep callback nesting detected")
      suggestions.push("Consider using async/await or Promise chains")
    }

    // Long parameter lists
    const longParams = (code.match(/$$[^)]{80,}$$/g) || []).length
    if (longParams > 0) {
      issues.push("Long parameter lists detected")
      suggestions.push("Consider using parameter objects or builder pattern")
    }

    // Duplicate code
    const lines = code.split("\n").filter((line) => line.trim().length > 10)
    const uniqueLines = new Set(lines)
    const duplicationRatio = 1 - uniqueLines.size / Math.max(lines.length, 1)
    if (duplicationRatio > 0.3) {
      issues.push("High code duplication detected")
      suggestions.push("Extract common code into reusable functions")
    }

    // Missing error handling
    const tryBlocks = (code.match(/\btry\s*\{/g) || []).length
    const asyncFunctions = (code.match(/async\s+function|async\s+\(/g) || []).length
    if (asyncFunctions > 0 && tryBlocks === 0) {
      issues.push("Async code without error handling")
      suggestions.push("Add try-catch blocks for async operations")
    }
  }

  /**
   * Calculates letter grade from score
   * @param score - Overall score (0-100)
   * @returns Letter grade
   */
  private static calculateGrade(score: number): "A" | "B" | "C" | "D" | "F" {
    if (score >= 90) return "A"
    if (score >= 80) return "B"
    if (score >= 70) return "C"
    if (score >= 60) return "D"
    return "F"
  }

  /**
   * Formats analysis result as human-readable report
   * @param result - Analysis result
   * @returns Formatted report string
   */
  public static formatReport(result: QualityAnalysisResult): string {
    const lines: string[] = []

    lines.push("=== Code Quality Analysis Report ===\n")
    lines.push(`Overall Grade: ${result.grade}`)
    lines.push(`Overall Score: ${result.metrics.overallScore.toFixed(1)}/100\n`)

    lines.push("Metrics:")
    lines.push(`  Complexity: ${result.metrics.complexity.toFixed(1)}/100`)
    lines.push(`  Maintainability: ${result.metrics.maintainability.toFixed(1)}/100`)
    lines.push(`  Readability: ${result.metrics.readability.toFixed(1)}/100`)
    lines.push(`  Testability: ${result.metrics.testability.toFixed(1)}/100\n`)

    if (result.strengths.length > 0) {
      lines.push("Strengths:")
      result.strengths.forEach((strength) => lines.push(`  + ${strength}`))
      lines.push("")
    }

    if (result.issues.length > 0) {
      lines.push("Issues:")
      result.issues.forEach((issue) => lines.push(`  - ${issue}`))
      lines.push("")
    }

    if (result.suggestions.length > 0) {
      lines.push("Suggestions:")
      result.suggestions.forEach((suggestion) => lines.push(`  → ${suggestion}`))
      lines.push("")
    }

    lines.push(
      `Lint Summary: ${result.lintResult.summary.errors} errors, ${result.lintResult.summary.warnings} warnings`,
    )

    return lines.join("\n")
  }
}

// Export singleton instance
export const qualityAnalyzer = CodeReviewQualityAnalyzer
