/**
 * File: src/ai/data/grammar/tools/grammar-SpellChecker.ts
 * Purpose: Spell checking and correction for English text
 * Depends on: None (standalone utility)
 * Depended on by: src/ai/data/grammar/grammar_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Spelling error with suggestions
 */
export interface SpellingError {
  word: string
  position: number
  suggestions: string[]
  context: string
}

/**
 * Spell check result
 */
export interface SpellCheckResult {
  hasErrors: boolean
  errors: SpellingError[]
  correctedText?: string
}

/**
 * Grammar Spell Checker
 *
 * Features:
 * - Common misspelling detection
 * - Suggestion generation
 * - Context-aware corrections
 * - Auto-correction capability
 *
 * Uses a dictionary of common words and misspellings.
 */
export class GrammarSpellChecker {
  // Common misspellings and their corrections
  private static readonly COMMON_MISSPELLINGS: Record<string, string> = {
    teh: "the",
    recieve: "receive",
    occured: "occurred",
    seperate: "separate",
    definately: "definitely",
    goverment: "government",
    enviroment: "environment",
    accomodate: "accommodate",
    acheive: "achieve",
    beleive: "believe",
    calender: "calendar",
    cemetary: "cemetery",
    concious: "conscious",
    existance: "existence",
    foriegn: "foreign",
    guage: "gauge",
    harrass: "harass",
    independant: "independent",
    judgement: "judgment",
    liason: "liaison",
    maintainance: "maintenance",
    neccessary: "necessary",
    occassion: "occasion",
    persistant: "persistent",
    priviledge: "privilege",
    publically: "publicly",
    reccomend: "recommend",
    refered: "referred",
    relevent: "relevant",
    succesful: "successful",
    untill: "until",
    wierd: "weird",
  }

  // Common English words (subset for validation)
  private static readonly COMMON_WORDS = new Set([
    "the",
    "be",
    "to",
    "of",
    "and",
    "a",
    "in",
    "that",
    "have",
    "i",
    "it",
    "for",
    "not",
    "on",
    "with",
    "he",
    "as",
    "you",
    "do",
    "at",
    "this",
    "but",
    "his",
    "by",
    "from",
    "they",
    "we",
    "say",
    "her",
    "she",
    "or",
    "an",
    "will",
    "my",
    "one",
    "all",
    "would",
    "there",
    "their",
    "what",
    "so",
    "up",
    "out",
    "if",
    "about",
    "who",
    "get",
    "which",
    "go",
    "me",
    "when",
    "make",
    "can",
    "like",
    "time",
    "no",
    "just",
    "him",
    "know",
    "take",
    "people",
    "into",
    "year",
    "your",
    "good",
    "some",
    "could",
    "them",
    "see",
    "other",
    "than",
    "then",
    "now",
    "look",
    "only",
    "come",
    "its",
    "over",
    "think",
    "also",
    "back",
    "after",
    "use",
    "two",
    "how",
    "our",
    "work",
    "first",
    "well",
    "way",
    "even",
    "new",
    "want",
    "because",
    "any",
    "these",
    "give",
    "day",
    "most",
    "us",
    "is",
    "was",
    "are",
    "been",
    "has",
    "had",
    "were",
    "said",
    "did",
    "having",
    "may",
    "should",
    "could",
    "would",
    "might",
    "must",
    "shall",
    "can",
    "will",
  ])

  /**
   * Checks text for spelling errors
   * @param text - Text to check
   * @returns Spell check result with errors and suggestions
   */
  public static check(text: string): SpellCheckResult {
    const errors: SpellingError[] = []
    const words = text.split(/\b/)
    let position = 0

    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "")

      if (cleanWord.length > 0) {
        // Check if it's a known misspelling
        if (cleanWord in this.COMMON_MISSPELLINGS) {
          errors.push({
            word,
            position,
            suggestions: [this.COMMON_MISSPELLINGS[cleanWord]],
            context: this.getContext(text, position, word.length),
          })
        }
        // Check if it's not in common words (simple check)
        else if (!this.COMMON_WORDS.has(cleanWord) && cleanWord.length > 3) {
          // Generate suggestions using edit distance
          const suggestions = this.generateSuggestions(cleanWord)
          if (suggestions.length > 0) {
            errors.push({
              word,
              position,
              suggestions,
              context: this.getContext(text, position, word.length),
            })
          }
        }
      }

      position += word.length
    }

    return {
      hasErrors: errors.length > 0,
      errors,
      correctedText: errors.length > 0 ? this.autoCorrect(text, errors) : undefined,
    }
  }

  /**
   * Automatically corrects text using first suggestion for each error
   * @param text - Original text
   * @param errors - Detected errors
   * @returns Corrected text
   */
  private static autoCorrect(text: string, errors: SpellingError[]): string {
    let corrected = text

    // Sort errors by position (descending) to avoid offset issues
    const sortedErrors = [...errors].sort((a, b) => b.position - a.position)

    for (const error of sortedErrors) {
      if (error.suggestions.length > 0) {
        const before = corrected.substring(0, error.position)
        const after = corrected.substring(error.position + error.word.length)
        corrected = before + error.suggestions[0] + after
      }
    }

    return corrected
  }

  /**
   * Generates spelling suggestions for a word
   * @param word - Misspelled word
   * @returns Array of suggestions
   */
  private static generateSuggestions(word: string): string[] {
    const suggestions: string[] = []

    // Check common misspellings first
    for (const [misspelling, correction] of Object.entries(this.COMMON_MISSPELLINGS)) {
      if (this.editDistance(word, misspelling) <= 1) {
        suggestions.push(correction)
      }
    }

    // Check common words with small edit distance
    for (const commonWord of this.COMMON_WORDS) {
      if (this.editDistance(word, commonWord) <= 2) {
        suggestions.push(commonWord)
      }
    }

    return suggestions.slice(0, 5) // Return top 5 suggestions
  }

  /**
   * Calculates Levenshtein edit distance between two words
   * @param word1 - First word
   * @param word2 - Second word
   * @returns Edit distance
   */
  private static editDistance(word1: string, word2: string): number {
    const len1 = word1.length
    const len2 = word2.length
    const matrix: number[][] = []

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = word1[i - 1] === word2[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost, // substitution
        )
      }
    }

    return matrix[len1][len2]
  }

  /**
   * Gets context around a word for display
   * @param text - Full text
   * @param position - Word position
   * @param length - Word length
   * @returns Context string
   */
  private static getContext(text: string, position: number, length: number): string {
    const start = Math.max(0, position - 20)
    const end = Math.min(text.length, position + length + 20)
    return text.substring(start, end)
  }

  /**
   * Checks if a word is spelled correctly
   * @param word - Word to check
   * @returns True if spelled correctly
   */
  public static isCorrect(word: string): boolean {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "")
    return this.COMMON_WORDS.has(cleanWord) && !(cleanWord in this.COMMON_MISSPELLINGS)
  }
}

// Export singleton instance
export const spellChecker = GrammarSpellChecker
