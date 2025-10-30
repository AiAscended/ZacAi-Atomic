/**
 * File: src/ai/orchestration/responseFormatter.ts
 * Purpose: Formats AI responses with code blocks, text, and metadata
 * Depends on: src/ai/shared/tools/codeFormatting/codeFormatter.ts
 * Depended on by: src/ai/orchestration/aiOrchestrator.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { formatCode, detectLanguage } from "../shared/tools/codeFormatting/codeFormatter"

export interface CodeBlock {
  id: string
  language: string
  code: string
  filename?: string
  startLine?: number
  endLine?: number
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
 * Parses and formats AI response into structured output
 * @param rawResponse - Raw AI-generated response text
 * @returns Structured formatted response
 */
export function formatResponse(rawResponse: string): FormattedResponse {
  const codeBlocks: CodeBlock[] = []
  const textBlocks: TextBlock[] = []
  const languages = new Set<string>()

  // Extract code blocks using regex
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  let match
  let lastIndex = 0
  let blockId = 0

  while ((match = codeBlockRegex.exec(rawResponse)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textContent = rawResponse.substring(lastIndex, match.index).trim()
      if (textContent) {
        textBlocks.push({
          id: `text-${blockId}`,
          content: textContent,
          type: "paragraph",
        })
      }
    }

    // Add code block
    const language = match[1] || detectLanguage(match[2])
    const code = match[2].trim()

    languages.add(language)
    codeBlocks.push({
      id: `code-${blockId}`,
      language,
      code: formatCode(code, { language }),
    })

    lastIndex = match.index + match[0].length
    blockId++
  }

  // Add remaining text after last code block
  if (lastIndex < rawResponse.length) {
    const textContent = rawResponse.substring(lastIndex).trim()
    if (textContent) {
      textBlocks.push({
        id: `text-${blockId}`,
        content: textContent,
        type: "paragraph",
      })
    }
  }

  // If no code blocks found, treat entire response as text
  if (codeBlocks.length === 0 && textBlocks.length === 0) {
    textBlocks.push({
      id: "text-0",
      content: rawResponse.trim(),
      type: "paragraph",
    })
  }

  return {
    text: rawResponse,
    codeBlocks,
    textBlocks,
    metadata: {
      totalCodeBlocks: codeBlocks.length,
      languages: Array.from(languages),
      hasFormatting: codeBlocks.length > 0,
    },
  }
}

/**
 * Cleans and corrects grammar/punctuation in text
 * @param text - Raw text to clean
 * @returns Cleaned text
 */
export function cleanText(text: string): string {
  let cleaned = text.trim()

  // Fix common punctuation issues
  cleaned = cleaned.replace(/\s+([.,!?;:])/g, "$1") // Remove space before punctuation
  cleaned = cleaned.replace(/([.,!?;:])\s*([a-zA-Z])/g, "$1 $2") // Add space after punctuation
  cleaned = cleaned.replace(/\s+/g, " ") // Normalize whitespace
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n") // Limit consecutive newlines

  // Capitalize first letter of sentences
  cleaned = cleaned.replace(/(^|[.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())

  return cleaned
}
