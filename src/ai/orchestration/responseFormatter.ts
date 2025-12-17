/**
 * File: src/ai/orchestration/responseFormatter.ts
 * Formats raw AI responses combining clean text and formatted code blocks
 * into structured output for UI consumption.
 *
 * Depends on:
 * - src/ai/shared/tools/textFormatting/textFormatter.ts (clean, correct, summarize text)
 * - src/ai/shared/tools/codeFormatting/codeFormatter.ts (format and language detect code)
 *
 * Used by:
 * - src/ai/output_generation/responseSynthesizer.ts
 */

import { cleanText, summarizeText } from "../shared/tools/textFormatting/textFormatter"
import { formatCode, detectLanguage } from "../shared/tools/codeFormatting/codeFormatter"

export interface CodeBlock {
  id: string
  language: string
  code: string
  filename?: string
}

export interface TextBlock {
  id: string
  content: string
  type: "paragraph" | "heading" | "list"
}

export interface FormattedResponse {
  text: string
  codeBlocks: CodeBlock[]
  textBlocks: TextBlock[]
  metadata: {
    totalCodeBlocks: number
    languages: string[]
    hasFormatting: boolean
  }
}

/**
 * Parses raw AI response text into cleaned, summarized text blocks and formatted code blocks.
 * Returns structured, ready-for-UI rendering response object.
 * @param rawResponse - raw AI-generated text including code blocks
 */
export async function formatResponse(rawResponse: string): Promise<FormattedResponse> {
  const codeBlocks: CodeBlock[] = []
  const textBlocks: TextBlock[] = []
  const languages = new Set<string>()
  const orderedSegments: OrderedSegment[] = []

  // Fixed regex to properly match code blocks with 3 backticks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  let match,
    lastIndex = 0,
    blockId = 0

  while ((match = codeBlockRegex.exec(rawResponse)) !== null) {
    if (match.index > lastIndex) {
      appendTextBlock(rawResponse.substring(lastIndex, match.index))
    }

    const language = match[1] || detectLanguage(match[2])
    const code = match[2].trim()
    
    // Format code, fallback to original if formatting fails
    let formattedCode = code
    try {
  const formatted = await formatCode(code, { language })
      if (formatted && typeof formatted === 'string') {
        formattedCode = formatted
      }
    } catch (error) {
      console.warn('[ResponseFormatter] Code formatting failed, using original:', error)
    }

    languages.add(normalizedLanguage)
    const codeBlock: CodeBlock = {
      id: `code-${codeBlockCount++}`,
      language: normalizedLanguage,
      code: formattedCode,
    }

    codeBlocks.push(codeBlock)
    orderedSegments.push({ kind: "code", language: normalizedLanguage, code: formattedCode })
    lastIndex = codeBlockRegex.lastIndex
  }

  if (lastIndex < rawResponse.length) {
    appendTextBlock(rawResponse.substring(lastIndex))
  }

  if (codeBlocks.length === 0 && textBlocks.length === 0) {
    appendTextBlock(rawResponse)
  }

  const combinedText = orderedSegments
    .map((segment) =>
      segment.kind === "text"
        ? segment.content
        : `\`\`\`${segment.language}\n${segment.code}\n\`\`\``,
    )
    .filter(Boolean)
    .join("\n\n")
    .trim()

  return {
    text: combinedText,
    codeBlocks,
    textBlocks,
    metadata: {
      totalCodeBlocks: codeBlocks.length,
      languages: Array.from(languages),
      hasFormatting: codeBlocks.length > 0,
    },
  }
}

function normalizeLanguage(language?: string): string {
  if (!language) return "javascript"
  const normalized = language.toLowerCase()
  if (["ts", "tsx", "typescript"].includes(normalized)) return "typescript"
  if (["js", "jsx", "javascript"].includes(normalized)) return "javascript"
  return normalized
}

type OrderedSegment =
  | { kind: "text"; content: string }
  | { kind: "code"; language: string; code: string }

function buildTextBlock(content: string): Pick<TextBlock, "content" | "type"> | null {
  const trimmed = content.trim()
  if (!trimmed) {
    return null
  }

  const inferredType = inferTextBlockType(trimmed)

  if (inferredType === "list") {
    const normalizedList = normalizeListContent(trimmed)
    return normalizedList
      ? {
          content: normalizedList,
          type: "list",
        }
      : null
  }

  const cleaned = inferredType === "heading" ? cleanText(trimmed.replace(/^#+\s*/, "")) : cleanText(trimmed)
  const condensed = summarizeIfNeeded(cleaned)

  if (!condensed) {
    return null
  }

  return {
    content: condensed,
    type: inferredType,
  }
}

function inferTextBlockType(content: string): TextBlock["type"] {
  const trimmed = content.trim()
  if (/^#{1,6}\s+/.test(trimmed)) {
    return "heading"
  }

  const lines = trimmed.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const hasMultipleLines = lines.length > 1
  const looksLikeList =
    hasMultipleLines &&
    lines.every((line) => /^[-*+]\s+/.test(line) || /^\d+[\.)]\s+/.test(line))

  if (looksLikeList) {
    return "list"
  }

  return "paragraph"
}

function normalizeListContent(content: string): string {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (!lines.length) {
    return ""
  }

  const normalized = lines
    .map((line) => line.replace(/^([-*+]\s+|\d+[\.)]\s+)/, ""))
    .map((line) => cleanText(line))
    .filter(Boolean)

  return normalized.map((line) => `- ${line}`).join("\n")
}

function summarizeIfNeeded(text: string, threshold = 4000): string {
  if (text.length <= threshold) {
    return text
  }
  return summarizeText(text, threshold)
}
