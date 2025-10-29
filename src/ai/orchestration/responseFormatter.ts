/**
 * File: src/ai/orchestration/responseFormatter.ts
 * Purpose: Formats AI-generated responses with code highlighting and text formatting
 * Depends on: src/ai/shared/tools/codeFormatting/codeFormatter.ts, src/ai/shared/tools/textFormatting/textFormatter.ts
 * Depended on by: src/ai/orchestration/aiOrchestrator.ts, app/api/chat/route.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { formatCode, extractCodeBlocks, type SupportedLanguage } from "../shared/tools/codeFormatting/codeFormatter"
import { formatText, stripMarkdown } from "../shared/tools/textFormatting/textFormatter"

/**
 * Response section types
 */
export type ResponseSectionType = "text" | "code" | "heading" | "list" | "table"

/**
 * Individual response section
 */
export interface ResponseSection {
  type: ResponseSectionType
  content: string
  language?: SupportedLanguage
  metadata?: {
    lineCount?: number
    characterCount?: number
    formatted?: boolean
    snippetId?: string
  }
}

/**
 * Formatted response structure
 */
export interface FormattedResponse {
  sections: ResponseSection[]
  rawText: string
  formattedText: string
  codeBlockCount: number
  wordCount: number
  estimatedReadingTime: number // in seconds
}

/**
 * Response formatting options
 */
export interface ResponseFormattingOptions {
  formatCode?: boolean
  formatText?: boolean
  extractCodeBlocks?: boolean
  addSnippetIds?: boolean
  maxLineLength?: number
}

/**
 * Formats AI-generated response into structured sections
 *
 * @param rawResponse - Raw AI response text
 * @param options - Formatting options
 * @returns Structured formatted response
 *
 * @example
 * ```typescript
 * const formatted = await formatResponse(aiResponse, {
 *   formatCode: true,
 *   formatText: true,
 *   extractCodeBlocks: true
 * });
 * ```
 */
export async function formatResponse(
  rawResponse: string,
  options: ResponseFormattingOptions = {},
): Promise<FormattedResponse> {
  const sections: ResponseSection[] = []
  const formattedText = rawResponse

  // Extract and format code blocks
  if (options.extractCodeBlocks !== false) {
    const codeBlocks = extractCodeBlocks(rawResponse)

    for (const block of codeBlocks) {
      let codeContent = block.code
      let formatted = false

      // Format code if requested
      if (options.formatCode !== false) {
        try {
          const result = await formatCode(block.code, {
            language: block.language as SupportedLanguage,
          })
          codeContent = result.code
          formatted = result.formatted
        } catch (error) {
          console.error("[v0] Code formatting failed:", error)
        }
      }

      sections.push({
        type: "code",
        content: codeContent,
        language: block.language as SupportedLanguage,
        metadata: {
          lineCount: codeContent.split("\n").length,
          characterCount: codeContent.length,
          formatted,
          snippetId: options.addSnippetIds ? generateSnippetId() : undefined,
        },
      })
    }
  }

  // Extract text sections (everything that's not code)
  const textWithoutCode = rawResponse.replace(/```[\s\S]*?```/g, "[[CODE_BLOCK]]")
  const textParts = textWithoutCode.split("[[CODE_BLOCK]]")

  for (const part of textParts) {
    if (!part.trim()) continue

    // Format text if requested
    let textContent = part
    if (options.formatText !== false) {
      const result = formatText(part, {
        correctGrammar: true,
        fixPunctuation: true,
        capitalizeFirstLetter: true,
        removeExtraSpaces: true,
        normalizeLineBreaks: true,
        maxLineLength: options.maxLineLength,
      })
      textContent = result.text
    }

    // Detect section type
    const sectionType = detectSectionType(textContent)

    sections.push({
      type: sectionType,
      content: textContent,
      metadata: {
        characterCount: textContent.length,
      },
    })
  }

  // Calculate metadata
  const plainText = stripMarkdown(rawResponse)
  const wordCount = plainText.trim().split(/\s+/).length
  const estimatedReadingTime = Math.ceil(wordCount / 200) // Average reading speed: 200 words/minute

  return {
    sections,
    rawText: rawResponse,
    formattedText,
    codeBlockCount: sections.filter((s) => s.type === "code").length,
    wordCount,
    estimatedReadingTime,
  }
}

/**
 * Detects the type of text section
 */
function detectSectionType(text: string): ResponseSectionType {
  const trimmed = text.trim()

  // Check for headings
  if (/^#{1,6}\s+/.test(trimmed)) {
    return "heading"
  }

  // Check for lists
  if (/^[-*+]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
    return "list"
  }

  // Check for tables
  if (/\|.*\|/.test(trimmed) && trimmed.includes("---")) {
    return "table"
  }

  return "text"
}

/**
 * Generates a unique snippet ID
 */
function generateSnippetId(): string {
  return `snippet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Merges multiple domain responses into a single formatted response
 *
 * @param domainResponses - Array of responses from different domains
 * @param options - Formatting options
 * @returns Merged and formatted response
 */
export async function mergeDomainResponses(
  domainResponses: Array<{ domain: string; response: string; confidence: number }>,
  options: ResponseFormattingOptions = {},
): Promise<FormattedResponse> {
  // Sort by confidence (highest first)
  const sorted = domainResponses.sort((a, b) => b.confidence - a.confidence)

  // Take the highest confidence response as primary
  const primaryResponse = sorted[0]?.response || ""

  // Optionally merge additional context from other high-confidence responses
  let mergedResponse = primaryResponse

  if (sorted.length > 1) {
    const additionalContext = sorted
      .slice(1, 3) // Take up to 2 additional responses
      .filter((r) => r.confidence > 0.3) // Only include if confidence > 30%
      .map((r) => r.response)
      .join("\n\n")

    if (additionalContext) {
      mergedResponse += "\n\n---\n\n**Additional Context:**\n\n" + additionalContext
    }
  }

  return formatResponse(mergedResponse, options)
}
