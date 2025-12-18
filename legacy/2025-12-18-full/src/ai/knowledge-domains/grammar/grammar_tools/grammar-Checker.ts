/**
 * Grammar Domain Tool: Grammar Checker
 * Checks grammar and suggests corrections
 */

import { normalizeText, splitSentences } from "../grammar_utils"

type GrammarIssue = {
  position: number
  message: string
  suggestions: string[]
}

type GrammarCheckResult = {
  errors: GrammarIssue[]
  score: number
}

const START_OF_SENTENCE_REGEX = /^[a-z]/
const MULTIPLE_SPACES_REGEX = /\s{2,}/

export class GrammarChecker {
  check(text: string): GrammarCheckResult {
    const normalized = normalizeText(text)
    if (!normalized) {
      return { errors: [], score: 1 }
    }

    const sentences = splitSentences(text)
    const issues = [
      ...this.detectSentenceCapitalization(sentences),
      ...this.detectMultipleSpaces(text),
    ]

    const score = Math.max(0, 1 - issues.length * 0.05)

    return {
      errors: issues,
      score,
    }
  }

  private detectSentenceCapitalization(sentences: string[]): GrammarIssue[] {
    return sentences
      .map((sentence, index) => {
        if (!START_OF_SENTENCE_REGEX.test(sentence)) {
          return {
            position: index,
            message: "Sentence should start with a capital letter.",
            suggestions: ["Capitalize the first character of the sentence."],
          }
        }
        return null
      })
      .filter((issue): issue is GrammarIssue => issue !== null)
  }

  private detectMultipleSpaces(text: string): GrammarIssue[] {
    const issues: GrammarIssue[] = []
    let match: RegExpExecArray | null
    const regex = new RegExp(MULTIPLE_SPACES_REGEX, "g")
    while ((match = regex.exec(text)) !== null) {
      issues.push({
        position: match.index,
        message: "Detected repeated whitespace.",
        suggestions: ["Replace multiple spaces with a single space."],
      })
    }
    return issues
  }
}

export default GrammarChecker
