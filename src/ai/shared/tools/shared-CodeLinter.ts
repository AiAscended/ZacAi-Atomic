/**
 * File: src/ai/shared/tools/shared-CodeLinter.ts
 * Purpose: Provides code linting and quality analysis across programming domains
 * Depends on: None (standalone linting logic)
 * Depended on by: src/ai/data/typescript/*, src/ai/data/code_review/*
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Severity level for lint issues
 */
export enum LintSeverity {
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

/**
 * Represents a single lint issue
 */
export interface LintIssue {
  line: number
  column: number
  severity: LintSeverity
  message: string
  rule: string
  suggestion?: string
}

/**
 * Result of linting operation
 */
export interface LintResult {
  issues: LintIssue[]
  errorCount: number
  warningCount: number
  infoCount: number
  score: number // 0-100, higher is better
  summary: string
}

/**
 * Code Linter - Analyzes code quality and style
 * Supports TypeScript, JavaScript, and general programming patterns
 */
export class CodeLinter {
  private static readonly RULES = {
    // Naming conventions
    CAMEL_CASE_VARS: /^[a-z][a-zA-Z0-9]*$/,
    PASCAL_CASE_CLASSES: /^[A-Z][a-zA-Z0-9]*$/,
    UPPER_CASE_CONSTANTS: /^[A-Z][A-Z0-9_]*$/,

    // Code patterns
    MAX_LINE_LENGTH: 120,
    MAX_FUNCTION_LENGTH: 50,
    MAX_COMPLEXITY: 10,
  }

  /**
   * Lint TypeScript/JavaScript code
   */
  public static lintCode(code: string, language: "typescript" | "javascript" = "typescript"): LintResult {
    const issues: LintIssue[] = []
    const lines = code.split("\n")

    // Check each line
    lines.forEach((line, index) => {
      const lineNumber = index + 1

      // Check line length
      if (line.length > this.RULES.MAX_LINE_LENGTH) {
        issues.push({
          line: lineNumber,
          column: this.RULES.MAX_LINE_LENGTH,
          severity: LintSeverity.WARNING,
          message: `Line exceeds maximum length of ${this.RULES.MAX_LINE_LENGTH} characters`,
          rule: "max-line-length",
          suggestion: "Consider breaking this line into multiple lines",
        })
      }

      // Check for console.log (should use proper logging)
      if (line.includes("console.log") && !line.includes("[v0]")) {
        issues.push({
          line: lineNumber,
          column: line.indexOf("console.log"),
          severity: LintSeverity.INFO,
          message: "Consider using a proper logging library instead of console.log",
          rule: "no-console",
          suggestion: 'Use logger.info() or add "[v0]" prefix for debugging',
        })
      }

      // Check for var usage (should use let/const)
      if (/\bvar\s+/.test(line)) {
        issues.push({
          line: lineNumber,
          column: line.indexOf("var"),
          severity: LintSeverity.ERROR,
          message: "Use 'let' or 'const' instead of 'var'",
          rule: "no-var",
          suggestion: "Replace 'var' with 'const' for immutable values or 'let' for mutable values",
        })
      }

      // Check for == instead of ===
      if (/[^=!]==[^=]/.test(line)) {
        issues.push({
          line: lineNumber,
          column: line.indexOf("=="),
          severity: LintSeverity.ERROR,
          message: "Use '===' instead of '=='",
          rule: "eqeqeq",
          suggestion: "Use strict equality (===) to avoid type coercion issues",
        })
      }

      // Check for trailing whitespace
      if (/\s+$/.test(line)) {
        issues.push({
          line: lineNumber,
          column: line.length,
          severity: LintSeverity.INFO,
          message: "Trailing whitespace detected",
          rule: "no-trailing-spaces",
          suggestion: "Remove trailing whitespace",
        })
      }

      // Check for missing semicolons (TypeScript)
      if (
        language === "typescript" &&
        /^[^/]*[a-zA-Z0-9)\]}"]$/.test(line.trim()) &&
        !line.trim().endsWith("{") &&
        !line.trim().endsWith(",")
      ) {
        const trimmed = line.trim()
        if (
          !trimmed.startsWith("//") &&
          !trimmed.startsWith("*") &&
          !trimmed.startsWith("if") &&
          !trimmed.startsWith("for") &&
          !trimmed.startsWith("while") &&
          !trimmed.startsWith("function") &&
          !trimmed.startsWith("class") &&
          !trimmed.startsWith("interface") &&
          !trimmed.startsWith("type") &&
          !trimmed.startsWith("export") &&
          !trimmed.startsWith("import")
        ) {
          issues.push({
            line: lineNumber,
            column: line.length,
            severity: LintSeverity.WARNING,
            message: "Missing semicolon",
            rule: "semi",
            suggestion: "Add semicolon at end of statement",
          })
        }
      }

      // Check for TODO/FIXME comments
      if (/\/\/\s*(TODO|FIXME)/i.test(line)) {
        issues.push({
          line: lineNumber,
          column: line.indexOf("//"),
          severity: LintSeverity.INFO,
          message: "TODO/FIXME comment found",
          rule: "no-warning-comments",
          suggestion: "Address this comment or create a tracking issue",
        })
      }
    })

    // Check for missing JSDoc on exported functions
    this.checkMissingDocumentation(code, issues)

    // Check function complexity
    this.checkFunctionComplexity(code, issues)

    // Calculate counts
    const errorCount = issues.filter((i) => i.severity === LintSeverity.ERROR).length
    const warningCount = issues.filter((i) => i.severity === LintSeverity.WARNING).length
    const infoCount = issues.filter((i) => i.severity === LintSeverity.INFO).length

    // Calculate quality score (0-100)
    const totalIssues = errorCount * 3 + warningCount * 2 + infoCount
    const maxPenalty = lines.length * 2 // Assume max 2 points penalty per line
    const score = Math.max(0, Math.min(100, 100 - (totalIssues / maxPenalty) * 100))

    return {
      issues,
      errorCount,
      warningCount,
      infoCount,
      score: Math.round(score),
      summary: this.generateSummary(errorCount, warningCount, infoCount, score),
    }
  }

  /**
   * Check for missing documentation on exported functions/classes
   */
  private static checkMissingDocumentation(code: string, issues: LintIssue[]): void {
    const lines = code.split("\n")
    let previousLineWasDoc = false

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // Check if this line is a JSDoc comment
      if (trimmed.startsWith("/**") || trimmed.startsWith("*") || trimmed.endsWith("*/")) {
        previousLineWasDoc = true
        return
      }

      // Check if this is an exported function/class without documentation
      if (/^export\s+(function|class|interface|type|const|let)/.test(trimmed)) {
        if (!previousLineWasDoc) {
          issues.push({
            line: index + 1,
            column: 0,
            severity: LintSeverity.WARNING,
            message: "Exported declaration missing JSDoc documentation",
            rule: "require-jsdoc",
            suggestion: "Add JSDoc comment describing purpose, parameters, and return value",
          })
        }
      }

      previousLineWasDoc = false
    })
  }

  /**
   * Check function complexity (cyclomatic complexity)
   */
  private static checkFunctionComplexity(code: string, issues: LintIssue[]): void {
    const functionRegex = /function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?$$[^)]*$$\s*=>/g
    let match

    while ((match = functionRegex.exec(code)) !== null) {
      const functionName = match[1] || match[2]
      const startIndex = match.index
      const lineNumber = code.substring(0, startIndex).split("\n").length

      // Find function body
      const afterFunction = code.substring(startIndex)
      const braceIndex = afterFunction.indexOf("{")
      if (braceIndex === -1) continue

      // Count complexity indicators
      const functionBody = this.extractFunctionBody(afterFunction.substring(braceIndex))
      const complexity = this.calculateComplexity(functionBody)

      if (complexity > this.RULES.MAX_COMPLEXITY) {
        issues.push({
          line: lineNumber,
          column: 0,
          severity: LintSeverity.WARNING,
          message: `Function '${functionName}' has complexity of ${complexity} (max: ${this.RULES.MAX_COMPLEXITY})`,
          rule: "complexity",
          suggestion: "Consider breaking this function into smaller functions",
        })
      }

      // Check function length
      const functionLines = functionBody.split("\n").length
      if (functionLines > this.RULES.MAX_FUNCTION_LENGTH) {
        issues.push({
          line: lineNumber,
          column: 0,
          severity: LintSeverity.INFO,
          message: `Function '${functionName}' is ${functionLines} lines (max: ${this.RULES.MAX_FUNCTION_LENGTH})`,
          rule: "max-lines-per-function",
          suggestion: "Consider breaking this function into smaller functions",
        })
      }
    }
  }

  /**
   * Extract function body from code
   */
  private static extractFunctionBody(code: string): string {
    let braceCount = 0
    let inString = false
    let stringChar = ""

    for (let i = 0; i < code.length; i++) {
      const char = code[i]

      if ((char === '"' || char === "'" || char === "`") && code[i - 1] !== "\\") {
        if (!inString) {
          inString = true
          stringChar = char
        } else if (char === stringChar) {
          inString = false
        }
      }

      if (!inString) {
        if (char === "{") braceCount++
        if (char === "}") braceCount--
        if (braceCount === 0 && char === "}") {
          return code.substring(0, i + 1)
        }
      }
    }

    return code
  }

  /**
   * Calculate cyclomatic complexity
   */
  private static calculateComplexity(code: string): number {
    let complexity = 1 // Base complexity

    // Count decision points
    const patterns = [
      /\bif\b/g,
      /\belse\s+if\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /&&/g,
      /\|\|/g,
      /\?/g, // Ternary operator
    ]

    patterns.forEach((pattern) => {
      const matches = code.match(pattern)
      if (matches) complexity += matches.length
    })

    return complexity
  }

  /**
   * Generate summary message
   */
  private static generateSummary(errors: number, warnings: number, info: number, score: number): string {
    const parts: string[] = []

    if (errors > 0) parts.push(`${errors} error${errors !== 1 ? "s" : ""}`)
    if (warnings > 0) parts.push(`${warnings} warning${warnings !== 1 ? "s" : ""}`)
    if (info > 0) parts.push(`${info} info`)

    const issueText = parts.length > 0 ? parts.join(", ") : "No issues found"
    const scoreText = score >= 90 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : "Needs improvement"

    return `${issueText}. Code quality: ${scoreText} (${score}/100)`
  }
}

/**
 * Convenience function for quick linting
 */
export function lintCode(code: string, language: "typescript" | "javascript" = "typescript"): LintResult {
  return CodeLinter.lintCode(code, language)
}

/**
 * Export linter instance
 */
export const linter = CodeLinter
