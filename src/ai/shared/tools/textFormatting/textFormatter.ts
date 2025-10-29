/**
 * File: src/ai/shared/tools/textFormatting/textFormatter.ts
 * Purpose: Text formatting, grammar correction, and punctuation utilities
 * Depends on: None (standalone utility)
 * Depended on by: src/ai/orchestration/responseFormatter.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Text formatting options
 */
export interface TextFormattingOptions {
  correctGrammar?: boolean
  fixPunctuation?: boolean
  capitalizeFirstLetter?: boolean
  removeExtraSpaces?: boolean
  normalizeLineBreaks?: boolean
  maxLineLength?: number
}

/**
 * Formatted text result with metadata
 */
export interface FormattedTextResult {
  text: string
  formatted: boolean
  changes: string[]
  wordCount: number
  characterCount: number
}

/**
 * Formats and corrects text according to specified options
 *
 * @param text - Raw text to format
 * @param options - Formatting options
 * @returns Formatted text with metadata
 */
export function formatText(text: string, options: TextFormattingOptions = {}): FormattedTextResult {
  const changes: string[] = []
  let formatted = text

  // Remove extra spaces
  if (options.removeExtraSpaces !== false) {
    const before = formatted
    formatted = formatted.replace(/\s+/g, " ").trim()
    if (before !== formatted) {
      changes.push("Removed extra spaces")
    }
  }

  // Normalize line breaks
  if (options.normalizeLineBreaks !== false) {
    const before = formatted
    formatted = formatted.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
    // Remove multiple consecutive line breaks (max 2)
    formatted = formatted.replace(/\n{3,}/g, "\n\n")
    if (before !== formatted) {
      changes.push("Normalized line breaks")
    }
  }

  // Fix punctuation
  if (options.fixPunctuation !== false) {
    const before = formatted
    formatted = fixPunctuation(formatted)
    if (before !== formatted) {
      changes.push("Fixed punctuation")
    }
  }

  // Capitalize first letter of sentences
  if (options.capitalizeFirstLetter !== false) {
    const before = formatted
    formatted = capitalizeSentences(formatted)
    if (before !== formatted) {
      changes.push("Capitalized sentences")
    }
  }

  // Wrap long lines
  if (options.maxLineLength && options.maxLineLength > 0) {
    const before = formatted
    formatted = wrapText(formatted, options.maxLineLength)
    if (before !== formatted) {
      changes.push(`Wrapped lines at ${options.maxLineLength} characters`)
    }
  }

  return {
    text: formatted,
    formatted: changes.length > 0,
    changes,
    wordCount: countWords(formatted),
    characterCount: formatted.length,
  }
}

/**
 * Fixes common punctuation issues
 */
function fixPunctuation(text: string): string {
  let fixed = text

  // Add space after punctuation if missing
  fixed = fixed.replace(/([.!?,;:])([A-Za-z])/g, "$1 $2")

  // Remove space before punctuation
  fixed = fixed.replace(/\s+([.!?,;:])/g, "$1")

  // Fix multiple punctuation marks
  fixed = fixed.replace(/\.{2,}/g, "...")
  fixed = fixed.replace(/!{2,}/g, "!")
  fixed = fixed.replace(/\?{2,}/g, "?")

  // Ensure sentences end with punctuation
  fixed = fixed.replace(/([a-z])\n/gi, "$1.\n")

  return fixed
}

/**
 * Capitalizes the first letter of each sentence
 */
function capitalizeSentences(text: string): string {
  return text.replace(/(^|[.!?]\s+)([a-z])/g, (match, separator, letter) => {
    return separator + letter.toUpperCase()
  })
}

/**
 * Wraps text at specified line length
 */
function wrapText(text: string, maxLength: number): string {
  const paragraphs = text.split("\n\n")

  return paragraphs
    .map((paragraph) => {
      const words = paragraph.split(/\s+/)
      const lines: string[] = []
      let currentLine = ""

      for (const word of words) {
        if (currentLine.length + word.length + 1 <= maxLength) {
          currentLine += (currentLine ? " " : "") + word
        } else {
          if (currentLine) lines.push(currentLine)
          currentLine = word
        }
      }

      if (currentLine) lines.push(currentLine)
      return lines.join("\n")
    })
    .join("\n\n")
}

/**
 * Counts words in text
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Removes markdown formatting from text
 */
export function stripMarkdown(text: string): string {
  let stripped = text

  // Remove code blocks
  stripped = stripped.replace(/```[\s\S]*?```/g, "")
  stripped = stripped.replace(/`[^`]+`/g, "")

  // Remove headers
  stripped = stripped.replace(/^#{1,6}\s+/gm, "")

  // Remove bold and italic
  stripped = stripped.replace(/\*\*([^*]+)\*\*/g, "$1")
  stripped = stripped.replace(/\*([^*]+)\*/g, "$1")
  stripped = stripped.replace(/__([^_]+)__/g, "$1")
  stripped = stripped.replace(/_([^_]+)_/g, "$1")

  // Remove links
  stripped = stripped.replace(/\[([^\]]+)\]$$[^)]+$$/g, "$1")

  // Remove images
  stripped = stripped.replace(/!\[([^\]]*)\]$$[^)]+$$/g, "")

  return stripped.trim()
}

/**
 * Converts text to title case
 */
export function toTitleCase(text: string): string {
  const smallWords = new Set([
    "a",
    "an",
    "and",
    "as",
    "at",
    "but",
    "by",
    "for",
    "in",
    "of",
    "on",
    "or",
    "the",
    "to",
    "up",
  ])

  return text
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (index === 0 || !smallWords.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1)
      }
      return word
    })
    .join(" ")
}
