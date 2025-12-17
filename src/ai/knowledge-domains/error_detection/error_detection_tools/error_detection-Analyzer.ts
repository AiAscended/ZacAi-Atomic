/**
 * Error Detection Domain Tool: Analyzer
 * Detects and analyzes errors in code
 */

import { detectSyntaxErrors, normalizeText } from "../error_detection_utils"

type ErrorDetectionIssue = {
  line: number
  message: string
  severity: "error" | "warning"
}

type ErrorDetectionAnalysis = {
  errors: ErrorDetectionIssue[]
  suggestions: string[]
}

const SYNTAX_MESSAGES: Record<string, { message: string; severity: ErrorDetectionIssue["severity"] }> = {
  UNCLOSED_BRACKET: {
    message: "Detected unbalanced brackets; ensure every opening token has a closing pair.",
    severity: "error",
  },
  MISSING_FUNCTION_BODY: {
    message: "Function declaration appears to be missing an implementation block.",
    severity: "warning",
  },
}

const LONG_LINE_THRESHOLD = 140

export class ErrorDetectionAnalyzer {
  analyze(_code: string): {
    errors: Array<{
      line: number;
      message: string;
      severity: "error" | "warning";
    }>;
    suggestions: string[];
  } {
    // Placeholder implementation
    return {
      errors,
      suggestions,
    }
  }

  private detectStructuralIssues(code: string): ErrorDetectionIssue[] {
    const lines = code.split(/\r?\n/)
    return detectSyntaxErrors(code).map((errorCode) => {
      const metadata = SYNTAX_MESSAGES[errorCode] ?? {
        message: `Detected parser warning: ${errorCode}`,
        severity: "warning" as const,
      }

      return {
        line: this.resolveLineNumber(lines, errorCode),
        message: metadata.message,
        severity: metadata.severity,
      }
    })
  }

  private resolveLineNumber(lines: string[], errorCode: string): number {
    if (errorCode === "MISSING_FUNCTION_BODY") {
      const idx = lines.findIndex((line) => /function\s+\w+\s*\([^)]*\)\s*$/.test(line.trim()))
      if (idx >= 0) return idx + 1
    }
    return 1
  }

  private buildSuggestions(code: string, sanitized: string): string[] {
    if (!sanitized) return ["Provide source code to analyze."]

    const suggestions: string[] = []
    if (/TODO|FIXME/i.test(code)) {
      suggestions.push("Resolve TODO or FIXME annotations before release.")
    }
    if (/\bconsole\.log\(/.test(code)) {
      suggestions.push("Remove console.log statements from production code paths.")
    }

    const longLineIndex = code.split(/\r?\n/).findIndex((line) => line.length > LONG_LINE_THRESHOLD)
    if (longLineIndex >= 0) {
      suggestions.push(`Line ${longLineIndex + 1} exceeds ${LONG_LINE_THRESHOLD} characters; consider refactoring.`)
    }

    if (!/try\s*{/.test(code) && /catch\s*\(/.test(code)) {
      suggestions.push("Detected catch block without corresponding try; verify control flow.")
    }

    return suggestions
  }
}

export default ErrorDetectionAnalyzer
