/**
 * File: src/ai/shared/tools/codeFormatting/codeFormatter.ts
 * Purpose: Shared code formatting utility for all domains
 * Depends on: None
 * Depended on by: All domain inference controllers
 * Creator: Vercel v0 Coding Assistant
 */

export interface FormatOptions {
  language: string;
  tabSize?: number;
  useTabs?: boolean;
  semicolons?: boolean;
  singleQuote?: boolean;
  trailingComma?: "none" | "es5" | "all";
  printWidth?: number;
}

/**
 * Formats code according to language-specific rules
 * @param code - Raw code string to format
 * @param options - Formatting options
 * @returns Formatted code string
 */
export function formatCode(code: string, options: FormatOptions): string {
  const { language, tabSize = 2, useTabs = false, printWidth = 80 } = options;

  // Basic formatting logic - in production, integrate with Prettier or similar
  let formatted = code.trim();

  // Normalize line endings
  formatted = formatted.replace(/\r\n/g, "\n");

  // Handle indentation
  const indent = useTabs ? "\t" : " ".repeat(tabSize);
  const lines = formatted.split("\n");
  let indentLevel = 0;
  const formattedLines: string[] = [];

  for (let line of lines) {
    line = line.trim();

    // Decrease indent for closing brackets
    if (line.startsWith("}") || line.startsWith("]") || line.startsWith(")")) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Add indentation
    if (line.length > 0) {
      formattedLines.push(indent.repeat(indentLevel) + line);
    } else {
      formattedLines.push("");
    }

    // Increase indent for opening brackets
    if (line.endsWith("{") || line.endsWith("[") || line.endsWith("(")) {
      indentLevel++;
    }
  }

  formatted = formattedLines.join("\n");

  // Language-specific formatting
  switch (language.toLowerCase()) {
    case "typescript":
    case "javascript":
    case "tsx":
    case "jsx":
      formatted = formatJavaScript(formatted, options);
      break;
    case "python":
      formatted = formatPython(formatted, options);
      break;
    case "json":
      try {
        formatted = JSON.stringify(JSON.parse(formatted), null, tabSize);
      } catch {
        // Keep original if invalid JSON
      }
      break;
  }

  return formatted;
}

function formatJavaScript(code: string, options: FormatOptions): string {
  let formatted = code;

  // Add semicolons if required
  if (options.semicolons !== false) {
    formatted = formatted.replace(/([^;{}\s])\s*\n/g, "$1;\n");
  }

  // Handle quotes
  if (options.singleQuote) {
    formatted = formatted.replace(/"([^"]*)"/g, "'$1'");
  }

  return formatted;
}

function formatPython(code: string): string {
  // Python-specific formatting (PEP 8 style)
  let formatted = code;

  // Ensure proper spacing around operators
  formatted = formatted.replace(/([^=!<>])=([^=])/g, "$1 = $2");
  formatted = formatted.replace(/([^=!<>])==([^=])/g, "$1 == $2");

  return formatted;
}

function wrapLine(line: string, maxWidth: number, indentPrefix: string): string[] {
  if (line.length <= maxWidth) {
    return [line]
  }

  const content = line.startsWith(indentPrefix) ? line.slice(indentPrefix.length) : line
  const words = content.split(/\s+/).filter(Boolean)
  const wrapped: string[] = []
  let current = ""

  const flush = () => {
    if (!current.length) return
    wrapped.push(`${indentPrefix}${current}`)
    current = ""
  }

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if ((indentPrefix.length + candidate.length) > maxWidth && current) {
      flush()
      current = word
    } else {
      current = candidate
    }

    if ((indentPrefix.length + current.length) > maxWidth && !current.includes(" ")) {
      flush()
    }
  }

  flush()
  return wrapped.length ? wrapped : [line]
}

/**
 * Detects the programming language from code content
 * @param code - Code string to analyze
 * @returns Detected language identifier
 */
export function detectLanguage(code: string): string {
  const trimmed = code.trim();

  // Check for common patterns
  if (
    trimmed.includes("import React") ||
    trimmed.includes("export default function")
  ) {
    return trimmed.includes("<") ? "tsx" : "typescript";
  }
  if (trimmed.includes("def ") || trimmed.includes("import ")) {
    return "python";
  }
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return "json";
  }
  if (
    trimmed.includes("function") ||
    trimmed.includes("const ") ||
    trimmed.includes("let ")
  ) {
    return "javascript";
  }

  return "text";
}
