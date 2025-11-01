/**
 * File: src/ai/shared/tools/shared-CodeFormatter.ts
 * Purpose: Provides code formatting capabilities across programming domains
 * Depends on: None (standalone formatting logic)
 * Depended on by: src/ai/data/typescript/*, src/ai/data/code_review/*
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Formatting options
 */
export interface FormatOptions {
  indentSize?: number
  useTabs?: boolean
  maxLineLength?: number
  semicolons?: boolean
  singleQuote?: boolean
  trailingComma?: "none" | "es5" | "all"
  bracketSpacing?: boolean
  arrowParens?: "avoid" | "always"
}

/**
 * Default formatting options following project guidelines
 */
const DEFAULT_OPTIONS: Required<FormatOptions> = {
  indentSize: 2,
  useTabs: false,
  maxLineLength: 120,
  semicolons: false,
  singleQuote: false,
  trailingComma: "es5",
  bracketSpacing: true,
  arrowParens: "always",
}

/**
 * Code Formatter - Formats code according to style guidelines
 * Implements basic formatting rules for TypeScript/JavaScript
 */
export class CodeFormatter {
  /**
   * Format TypeScript/JavaScript code
   */
  public static format(code: string, options: FormatOptions = {}): string {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    let formatted = code

    // Normalize line endings
    formatted = formatted.replace(/\r\n/g, "\n")

    // Remove trailing whitespace
    formatted = formatted
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")

    // Fix indentation
    formatted = this.fixIndentation(formatted, opts)

    // Add/remove semicolons
    if (opts.semicolons) {
      formatted = this.addSemicolons(formatted)
    } else {
      formatted = this.removeSemicolons(formatted)
    }

    // Fix spacing around operators
    formatted = this.fixOperatorSpacing(formatted)

    // Fix spacing in object literals
    formatted = this.fixObjectSpacing(formatted, opts.bracketSpacing)

    // Fix quote style
    formatted = this.fixQuotes(formatted, opts.singleQuote)

    // Ensure file ends with newline
    if (!formatted.endsWith("\n")) {
      formatted += "\n"
    }

    return formatted
  }

  /**
   * Fix indentation throughout the code
   */
  private static fixIndentation(code: string, options: Required<FormatOptions>): string {
    const lines = code.split("\n")
    const indent = options.useTabs ? "\t" : " ".repeat(options.indentSize)
    let indentLevel = 0
    const formatted: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Skip empty lines
      if (line === "") {
        formatted.push("")
        continue
      }

      // Decrease indent for closing braces
      if (line.startsWith("}") || line.startsWith("]") || line.startsWith(")")) {
        indentLevel = Math.max(0, indentLevel - 1)
      }

      // Apply indentation
      formatted.push(indent.repeat(indentLevel) + line)

      // Increase indent for opening braces
      if (line.endsWith("{") || line.endsWith("[") || line.endsWith("(")) {
        indentLevel++
      }

      // Handle single-line blocks
      if (line.includes("{") && line.includes("}")) {
        // Single-line object/block, don't change indent
      } else if (line.endsWith("{") || line.endsWith("[")) {
        // Opening brace, already handled
      } else if (line.startsWith("}") || line.startsWith("]")) {
        // Closing brace, already handled
      }
    }

    return formatted.join("\n")
  }

  /**
   * Add semicolons to statements
   */
  private static addSemicolons(code: string): string {
    const lines = code.split("\n")
    return lines
      .map((line) => {
        const trimmed = line.trim()

        // Skip if already has semicolon
        if (trimmed.endsWith(";")) return line

        // Skip comments, empty lines, and control structures
        if (
          trimmed === "" ||
          trimmed.startsWith("//") ||
          trimmed.startsWith("/*") ||
          trimmed.startsWith("*") ||
          trimmed.endsWith("*/") ||
          trimmed.endsWith("{") ||
          trimmed.endsWith("}") ||
          trimmed.endsWith(",") ||
          trimmed.startsWith("if") ||
          trimmed.startsWith("for") ||
          trimmed.startsWith("while") ||
          trimmed.startsWith("function") ||
          trimmed.startsWith("class") ||
          trimmed.startsWith("interface") ||
          trimmed.startsWith("type") ||
          trimmed.startsWith("export") ||
          trimmed.startsWith("import")
        ) {
          return line
        }

        // Add semicolon
        return line + ";"
      })
      .join("\n")
  }

  /**
   * Remove unnecessary semicolons
   */
  private static removeSemicolons(code: string): string {
    const lines = code.split("\n")
    return lines
      .map((line) => {
        // Only remove trailing semicolons, not those in for loops
        if (line.trim().endsWith(";") && !line.includes("for (")) {
          return line.replace(/;(\s*)$/, "$1")
        }
        return line
      })
      .join("\n")
  }

  /**
   * Fix spacing around operators
   */
  private static fixOperatorSpacing(code: string): string {
    let formatted = code

    // Add space around binary operators
    formatted = formatted.replace(/([a-zA-Z0-9_)])([+\-*/%=<>])([a-zA-Z0-9_(])/g, "$1 $2 $3")

    // Fix multiple spaces
    formatted = formatted.replace(/ {2,}/g, " ")

    // Fix spacing around colons in object literals
    formatted = formatted.replace(/(\w+)\s*:\s*/g, "$1: ")

    return formatted
  }

  /**
   * Fix spacing in object literals
   */
  private static fixObjectSpacing(code: string, bracketSpacing: boolean): string {
    if (bracketSpacing) {
      // Add space after { and before }
      code = code.replace(/\{([^\s])/g, "{ $1")
      code = code.replace(/([^\s])\}/g, "$1 }")
    } else {
      // Remove space after { and before }
      code = code.replace(/\{\s+/g, "{")
      code = code.replace(/\s+\}/g, "}")
    }

    return code
  }

  /**
   * Fix quote style (single vs double)
   */
  private static fixQuotes(code: string, useSingleQuote: boolean): string {
    if (useSingleQuote) {
      // Convert double quotes to single quotes (except in strings containing single quotes)
      return code.replace(/"([^"']*?)"/g, "'$1'")
    } else {
      // Convert single quotes to double quotes (except in strings containing double quotes)
      return code.replace(/'([^'"]*?)'/g, '"$1"')
    }
  }

  /**
   * Format a specific code block (function, class, etc.)
   */
  public static formatBlock(
    code: string,
    blockType: "function" | "class" | "interface",
    options?: FormatOptions,
  ): string {
    // Add appropriate wrapper and format
    const wrapped = `${blockType === "interface" ? "interface" : blockType === "class" ? "class" : "function"} Temp ${code}`
    const formatted = this.format(wrapped, options)

    // Remove wrapper
    const lines = formatted.split("\n")
    return lines.slice(1).join("\n")
  }

  /**
   * Format imports/exports
   */
  public static formatImports(code: string): string {
    const lines = code.split("\n")
    const imports: string[] = []
    const exports: string[] = []
    const other: string[] = []

    // Separate imports, exports, and other code
    lines.forEach((line) => {
      if (line.trim().startsWith("import ")) {
        imports.push(line)
      } else if (line.trim().startsWith("export ")) {
        exports.push(line)
      } else {
        other.push(line)
      }
    })

    // Sort imports alphabetically
    imports.sort()

    // Reconstruct code with organized imports
    return [...imports, "", ...other, "", ...exports].join("\n")
  }
}

/**
 * Convenience function for quick formatting
 */
export function formatCode(code: string, options?: FormatOptions): string {
  return CodeFormatter.format(code, options)
}

/**
 * Export formatter instance
 */
export const formatter = CodeFormatter
