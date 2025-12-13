/**
 * File: src/ai/shared/tools/codeFormatting/codeFormatter.ts
 * Utilities to detect code language and perform code formatting.
 */

import prettier from "prettier/standalone"
import parserTypescript from "prettier/parser-typescript"
import parserBabel from "prettier/parser-babel"

export function detectLanguage(code: string): string {
  // Simple heuristic based on common keywords
  if (/^\s*import|export|from\s+/m.test(code)) return "typescript"
  if (/def\s+\w+\(/.test(code)) return "python"
  if (/^\s*<\w+/.test(code)) return "html"
  return "javascript"
}

/**
 * Format code using Prettier with appropriate parser.
 * Falls back to unformatted code on errors.
 */
export async function formatCode(code: string, options?: { language: string }): Promise<string> {
  try {
    const parser = options?.language === "typescript" ? "typescript" : "babel"
    return await prettier.format(code, {
      parser,
      plugins: [parserTypescript, parserBabel],
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      printWidth: 80,
    })
  } catch (err) {
    // Return unformatted code if error encountered
    console.warn("[codeFormatter] Failed to format code:", err)
    return code
  }
}
