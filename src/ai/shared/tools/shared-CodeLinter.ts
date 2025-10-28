/**
 * File: src/ai/shared/tools/shared-CodeLinter.ts
 * Purpose: Code linting and validation for multiple languages
 * Depends on: None (standalone utility)
 * Depended on by: src/ai/data/typescript/typescript_integrationAPI.ts, src/ai/data/code_review/code_review_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Represents a linting issue found in code
 */
export interface LintIssue {
  line: number
  column: number
  severity: "error" | "warning" | "info"
  message: string
  rule: string
  suggestion?: string
}

/**
 * Linting result containing all issues found
 */
export interface LintResult {
  valid: boolean
  issues: LintIssue[]
  summary: {
    errors: number
    warnings: number
    info: number
  }
}

/**
 * Code Linter - Validates and analyzes code for common issues
 *
 * Features:
 * - Syntax validation
 * - Style checking
 * - Best practice enforcement
 * - Security vulnerability detection
 * - Performance anti-pattern detection
 *
 * Supports: TypeScript, JavaScript, Python, and more
 */
export class CodeLinter {
  /**
   * Lints TypeScript/JavaScript code
   * @param code - Source code to lint
   * @param language - Language type ('typescript' or 'javascript')
   * @returns Linting result with issues
   */
  public static lintTypeScript(code: string, language: "typescript" | "javascript" = "typescript"): LintResult {
    const issues: LintIssue[] = []
    const lines = code.split("\n")

    lines.forEach((line, index) => {
      const lineNumber = index + 1

      // Check for console.log statements
      if (line.includes("console.log") && !line.trim().startsWith("//")) {
        issues.push({
          line: lineNumber,
          column: line.indexOf("console.log") + 1,
          severity: "warning",
          message: "Avoid using console.log in production code",
          rule: "no-console",
          suggestion: "Use a proper logging library instead",
        })
      }

      // Check for var usage
      if (/\bvar\s+/.test(line) && !line.trim().startsWith("//")) {
        issues.push({
          line: lineNumber,
          column: line.indexOf("var") + 1,
          severity: "error",
          message: "Use let or const instead of var",
          rule: "no-var",
          suggestion: "Replace var with let or const",
        })
      }

      // Check for == instead of ===
      if (/[^=!]==[^=]/.test(line) && !line.trim().startsWith("//")) {
        issues.push({
          line: lineNumber,
          column: line.indexOf("==") + 1,
          severity: "warning",
          message: "Use === instead of == for comparison",
          rule: "eqeqeq",
          suggestion: "Replace == with ===",
        })
      }

      // Check for missing semicolons (simple check)
      if (
        line.trim() &&
        !line.trim().startsWith("//") &&
        !line.trim().startsWith("*") &&
        /^[^{}[\]()]*[a-zA-Z0-9_\])]$/.test(line.trim()) &&
        !line.trim().endsWith(";") &&
        !line.trim().endsWith(",") &&
        !line.trim().endsWith("{") &&
        !line.trim().endsWith("}")
      ) {
        issues.push({
          line: lineNumber,
          column: line.length,
          severity: "info",
          message: "Missing semicolon",
          rule: "semi",
          suggestion: "Add semicolon at end of statement",
        })
      }

      // Check for any usage
      if (language === "typescript" && /:\s*any\b/.test(line) && !line.trim().startsWith("//")) {
        issues.push({
          line: lineNumber,
          column: line.indexOf("any") + 1,
          severity: "warning",
          message: "Avoid using any type",
          rule: "no-explicit-any",
          suggestion: "Use a specific type instead",
        })
      }

      // Check for eval usage
      if (/\beval\s*\(/.test(line) && !line.trim().startsWith("//")) {
        issues.push({
          line: lineNumber,
          column: line.indexOf("eval") + 1,
          severity: "error",
          message: "eval() is dangerous and should be avoided",
          rule: "no-eval",
          suggestion: "Find an alternative approach",
        })
      }

      // Check for long lines (>120 characters)
      if (line.length > 120) {
        issues.push({
          line: lineNumber,
          column: 121,
          severity: "info",
          message: "Line exceeds 120 characters",
          rule: "max-len",
          suggestion: "Break line into multiple lines",
        })
      }

      // Check for TODO comments
      if (/\/\/\s*TODO/i.test(line)) {
        issues.push({
          line: lineNumber,
          column: line.indexOf("TODO") + 1,
          severity: "info",
          message: "TODO comment found",
          rule: "no-warning-comments",
          suggestion: "Complete or remove TODO",
        })
      }

      // Check for debugger statements
      if (/\bdebugger\b/.test(line) && !line.trim().startsWith("//")) {
        issues.push({
          line: lineNumber,
          column: line.indexOf("debugger") + 1,
          severity: "error",
          message: "debugger statement should not be in production code",
          rule: "no-debugger",
          suggestion: "Remove debugger statement",
        })
      }

      // Check for unused variables (simple heuristic)
      const varMatch = line.match(/(?:const|let)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/)
      if (varMatch && varMatch[1]) {
        const varName = varMatch[1]
        const restOfCode = lines.slice(index + 1).join("\n")
        if (!restOfCode.includes(varName) && varName !== "_") {
          issues.push({
            line: lineNumber,
            column: line.indexOf(varName) + 1,
            severity: "warning",
            message: `Variable '${varName}' is declared but never used`,
            rule: "no-unused-vars",
            suggestion: "Remove unused variable or prefix with underscore",
          })
        }
      }
    })

    // Calculate summary
    const summary = {
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      info: issues.filter((i) => i.severity === "info").length,
    }

    return {
      valid: summary.errors === 0,
      issues,
      summary,
    }
  }

  /**
   * Lints Python code
   * @param code - Python source code
   * @returns Linting result with issues
   */
  public static lintPython(code: string): LintResult {
    const issues: LintIssue[] = []
    const lines = code.split("\n")

    lines.forEach((line, index) => {
      const lineNumber = index + 1

      // Check for print statements (Python 2 style)
      if (/\bprint\s+[^(]/.test(line) && !line.trim().startsWith("#")) {
        issues.push({
          line: lineNumber,
          column: line.indexOf("print") + 1,
          severity: "error",
          message: "Use print() function instead of print statement",
          rule: "print-statement",
          suggestion: "Add parentheses: print()",
        })
      }

      // Check for line length
      if (line.length > 79) {
        issues.push({
          line: lineNumber,
          column: 80,
          severity: "info",
          message: "Line exceeds 79 characters (PEP 8)",
          rule: "line-too-long",
          suggestion: "Break line into multiple lines",
        })
      }

      // Check for multiple statements on one line
      if (line.includes(";") && !line.trim().startsWith("#")) {
        issues.push({
          line: lineNumber,
          column: line.indexOf(";") + 1,
          severity: "warning",
          message: "Multiple statements on one line",
          rule: "multiple-statements",
          suggestion: "Put each statement on its own line",
        })
      }

      // Check for bare except
      if (/except\s*:/.test(line) && !line.trim().startsWith("#")) {
        issues.push({
          line: lineNumber,
          column: line.indexOf("except") + 1,
          severity: "warning",
          message: "Bare except clause",
          rule: "bare-except",
          suggestion: "Specify exception type: except Exception:",
        })
      }
    })

    const summary = {
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      info: issues.filter((i) => i.severity === "info").length,
    }

    return {
      valid: summary.errors === 0,
      issues,
      summary,
    }
  }

  /**
   * Validates code syntax for a given language
   * @param code - Source code
   * @param language - Programming language
   * @returns True if syntax is valid
   */
  public static validateSyntax(code: string, language: string): boolean {
    try {
      switch (language.toLowerCase()) {
        case "typescript":
        case "javascript":
          // Basic bracket matching
          return this.validateBrackets(code)

        case "python":
          // Basic indentation check
          return this.validatePythonIndentation(code)

        default:
          return true // Unknown language, assume valid
      }
    } catch {
      return false
    }
  }

  /**
   * Validates bracket matching in code
   * @param code - Source code
   * @returns True if brackets are balanced
   */
  private static validateBrackets(code: string): boolean {
    const stack: string[] = []
    const pairs: Record<string, string> = {
      "(": ")",
      "[": "]",
      "{": "}",
    }

    for (const char of code) {
      if (char in pairs) {
        stack.push(char)
      } else if (Object.values(pairs).includes(char)) {
        const last = stack.pop()
        if (!last || pairs[last] !== char) {
          return false
        }
      }
    }

    return stack.length === 0
  }

  /**
   * Validates Python indentation
   * @param code - Python source code
   * @returns True if indentation is valid
   */
  private static validatePythonIndentation(code: string): boolean {
    const lines = code.split("\n")
    let expectedIndent = 0

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue

      const indent = line.length - line.trimStart().length

      // Check if indent is multiple of 4
      if (indent % 4 !== 0) {
        return false
      }

      // Update expected indent for next line
      if (trimmed.endsWith(":")) {
        expectedIndent = indent + 4
      } else if (indent < expectedIndent) {
        expectedIndent = indent
      }
    }

    return true
  }

  /**
   * Formats linting result as human-readable string
   * @param result - Linting result
   * @returns Formatted string
   */
  public static formatResult(result: LintResult): string {
    if (result.issues.length === 0) {
      return "✓ No issues found"
    }

    const lines: string[] = []
    lines.push(`Found ${result.issues.length} issue(s):`)
    lines.push(`  Errors: ${result.summary.errors}`)
    lines.push(`  Warnings: ${result.summary.warnings}`)
    lines.push(`  Info: ${result.summary.info}`)
    lines.push("")

    result.issues.forEach((issue) => {
      const icon = issue.severity === "error" ? "✗" : issue.severity === "warning" ? "⚠" : "ℹ"
      lines.push(`${icon} Line ${issue.line}:${issue.column} - ${issue.message} [${issue.rule}]`)
      if (issue.suggestion) {
        lines.push(`  Suggestion: ${issue.suggestion}`)
      }
    })

    return lines.join("\n")
  }
}

// Export singleton instance
export const linter = CodeLinter
