/**
 * File: src/ai/data/programming/programming_constants.ts
 * Purpose: Constants and configuration for the general Programming knowledge domain
 * Depends on: None
 * Depended on by: All programming domain modules
 * Creator: Vercel v0 Coding Assistant
 */

export const PROGRAMMING_DOMAIN = "programming"
export const PROGRAMMING_VOCAB_PATH = "/src/ai/knowledge-domains/programming/programming_seeds/programming_seedVocabulary.json"
export const PROGRAMMING_LEARNED_DATA_PATH = "/src/ai/knowledge-domains/programming/programming_learned/programming_learnedData.json"
export const PROGRAMMING_WEIGHTS_PATH = "/src/ai/knowledge-domains/programming/programming_weights/programming_pretrained_weights.json"
export const PROGRAMMING_TRAINING_WEIGHTS_PATH = "/src/ai/knowledge-domains/programming/programming_weights/programming_trainingWeights.bin"

// Programming concepts
export const PROGRAMMING_CONCEPTS = [
  "variable",
  "function",
  "class",
  "object",
  "array",
  "loop",
  "conditional",
  "recursion",
  "algorithm",
  "data-structure",
  "api",
  "database",
  "framework",
  "library",
  "module",
  "package",
  "dependency",
  "version-control",
  "git",
  "testing",
  "debugging",
  "refactoring",
  "optimization",
  "design-pattern",
  "architecture",
] as const

export const PROGRAMMING_PARADIGMS = [
  "object-oriented",
  "functional",
  "procedural",
  "declarative",
  "imperative",
  "event-driven",
  "reactive",
] as const

export const PROGRAMMING_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "ruby",
  "php",
  "swift",
  "kotlin",
] as const
