/**
 * File: src/ai/data/grammar/grammar_parser.ts
 * Purpose: Grammar-specific parser for sentence structure analysis
 * Depends on: grammar_utils.ts
 * Depended on by: grammar_semanticAnalyzer.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { splitSentences } from "./grammar_utils"

/**
 * Parse text for grammatical structure
 * - Detects sentence types (declarative, interrogative, imperative, exclamatory)
 * - Identifies basic clause structure
 */
export const grammarParser = (text: string) => {
  const sentences = splitSentences(text)
  const analysis = sentences.map((s) => {
    const trimmed = s.trim()
    const isQuestion = trimmed.endsWith("?")
    const isExclamation = trimmed.endsWith("!")
    const isImperative = /^[A-Z][a-z]+/.test(trimmed) && !isQuestion && trimmed.split(" ").length < 8

    return {
      text: trimmed,
      type: isQuestion ? "interrogative" : isExclamation ? "exclamatory" : isImperative ? "imperative" : "declarative",
      wordCount: trimmed.split(/\s+/).length,
    };
  })

  return { sentences: analysis, count: sentences.length }
}
