/**
 * File: src/ai/data/grammar/grammar_semanticAnalyzer.ts
 * Purpose: Grammar semantic analyzer for parts of speech and syntax
 * Depends on: grammar_tokenizer.ts, grammar_parser.ts
 * Depended on by: grammar_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { grammarTokenizer } from "./grammar_tokenizer"
import { grammarParser } from "./grammar_parser"

/**
 * Analyze grammatical structure and parts of speech
 * - Identifies punctuation patterns
 * - Detects sentence complexity
 * - Provides basic POS tagging heuristics
 */
export const grammarSemanticAnalyzer = (text: string) => {
  const { tokens } = grammarTokenizer(text)
  const parsed = grammarParser(text)

  const punctuationTokens = tokens.filter((t) =>
    ["PERIOD", "COMMA", "SEMICOLON", "COLON", "QUESTION_MARK", "EXCLAMATION"].includes(t),
  )

  const capitalizedWords = text.split(/\s+/).filter((w) => /^[A-Z]/.test(w))

  return {
    sentenceStructure: parsed,
    punctuationCount: punctuationTokens.length,
    punctuationTypes: [...new Set(punctuationTokens)],
    capitalizedWords,
    complexity: parsed.sentences.reduce((sum, s) => sum + s.wordCount, 0) / parsed.count,
  }
}
