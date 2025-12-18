/**
 * File: src/ai/data/code_review/code_review_tokens.ts
 * Purpose: Domain-specific core tokens for code review (quality metrics, patterns, anti-patterns)
 * Depends on: None
 * Depended on by: code_review_tokenizer.ts, code_review_tokenMap.ts
 * Creator: Vercel v0 Coding Assistant
 */

export const CODE_REVIEW_CORE_TOKENS = [
  // reserved special tokens
  "[PAD]",
  "[UNK]",
  "[CLS]",
  "[SEP]",
  "[MASK]",

  // code quality markers
  "COMPLEXITY",
  "READABILITY",
  "MAINTAINABILITY",
  "PERFORMANCE",
  "SCALABILITY",
  "TESTABILITY",

  // code smells
  "LONG_METHOD",
  "LARGE_CLASS",
  "DUPLICATE_CODE",
  "DEAD_CODE",
  "MAGIC_NUMBER",
  "GOD_OBJECT",
  "TIGHT_COUPLING",

  // best practices
  "DRY",
  "SOLID",
  "KISS",
  "YAGNI",
  "SEPARATION_OF_CONCERNS",
  "SINGLE_RESPONSIBILITY",

  // review actions
  "REFACTOR",
  "OPTIMIZE",
  "SIMPLIFY",
  "EXTRACT",
  "INLINE",
  "RENAME",

  // severity levels
  "CRITICAL",
  "MAJOR",
  "MINOR",
  "INFO",
  "SUGGESTION",

  // system/domain base tokens
  "<SYS_CODE_REVIEW>",
  "CODE_REVIEW_BASE",
  "CODE_REVIEW_SYS_TOKEN",

  // numeric tokens
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",

  // additional numbered tokens
  "TOKEN_10",
  "TOKEN_11",
  "TOKEN_12",
  "TOKEN_13",
  "TOKEN_14",
  "TOKEN_15",
  "TOKEN_16",
  "TOKEN_17",
  "TOKEN_18",
  "TOKEN_19",
  "TOKEN_20",
];

export default CODE_REVIEW_CORE_TOKENS;
