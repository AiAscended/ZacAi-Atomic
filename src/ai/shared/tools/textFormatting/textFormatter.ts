/**
 * File: src/ai/shared/tools/textFormatting/textFormatter.ts
 * Contains utilities for cleaning, normalizing, and summarizing text.
 */

export function cleanText(text: string): string {
  if (!text) return ""

  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function summarizeText(text: string, maxLength = 4000): string {
  if (text.length <= maxLength) {
    return text
  }

  const sentences = text.split(/(?<=[.!?])\s+/)
  let summary = ""

  for (const sentence of sentences) {
    const candidate = summary ? `${summary} ${sentence}` : sentence
    if (candidate.length > maxLength) {
      break
    }
    summary = candidate
  }

  if (!summary) {
    summary = text.slice(0, maxLength)
  }

  return summary.trimEnd() + " …"
}
