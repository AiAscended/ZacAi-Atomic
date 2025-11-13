/**
 * File: src/ai/shared/tools/textFormatting/textFormatter.ts
 * Contains utilities for cleaning, normalizing, and summarizing text.
 */

export function cleanText(text: string): string {
  if (!text) return ""
  // Basic cleanup: trim, normalize whitespace
  return text.replace(/\s+/g, " ").trim();
}

export function summarizeText(text: string, maxLength = 500): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}
