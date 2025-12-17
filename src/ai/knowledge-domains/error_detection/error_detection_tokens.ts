/**
 * File: src/ai/data/error_detection/error_detection_tokens.ts
 * Purpose: Domain-specific core tokens for error detection (syntax errors, runtime errors, logical errors)
 * Depends on: None
 * Depended on by: error_detection_tokenizer.ts, error_detection_tokenMap.ts
 * Creator: Vercel v0 Coding Assistant
 */

export const ERROR_DETECTION_CORE_TOKENS = [
  "[PAD]",
  "[UNK]",
  "[CLS]",
  "[SEP]",
  "[MASK]",
  "SYNTAX_ERROR",
  "RUNTIME_ERROR",
  "LOGICAL_ERROR",
  "TYPE_ERROR",
  "REFERENCE_ERROR",
  "NULL_POINTER",
  "UNDEFINED_VARIABLE",
  "MISSING_SEMICOLON",
  "UNCLOSED_BRACKET",
  "INVALID_SYNTAX",
  "STACK_OVERFLOW",
  "MEMORY_LEAK",
  "RACE_CONDITION",
  "DEADLOCK",
  "EXCEPTION",
  "WARNING",
  "CRITICAL",
  "ERROR",
  "INFO",
  "<SYS_ERROR_DETECTION>",
  "ERROR_DETECTION_BASE",
  "ERROR_DETECTION_SYS_TOKEN",
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
  "TOKEN_10",
  "TOKEN_11",
  "TOKEN_12",
  "TOKEN_13",
  "TOKEN_14",
  "TOKEN_15",
];

export default ERROR_DETECTION_CORE_TOKENS;
