/**
 * File: src/ai/data/grammar/grammar_tokens.ts
 * Purpose: Domain-specific core tokens for grammar domain (parts of speech, punctuation, syntax markers)
 * Depends on: None
 * Depended on by: grammar_tokenizer.ts, grammar_tokenMap.ts
 * Creator: Vercel v0 Coding Assistant
 */

export const GRAMMAR_CORE_TOKENS = [
  // reserved special tokens
  "[PAD]",
  "[UNK]",
  "[CLS]",
  "[SEP]",
  "[MASK]",

  // parts of speech markers
  "NOUN",
  "VERB",
  "ADJECTIVE",
  "ADVERB",
  "PRONOUN",
  "PREPOSITION",
  "CONJUNCTION",
  "INTERJECTION",
  "ARTICLE",
  "DETERMINER",

  // punctuation tokens
  "PERIOD",
  "COMMA",
  "SEMICOLON",
  "COLON",
  "QUESTION_MARK",
  "EXCLAMATION",
  "APOSTROPHE",
  "QUOTATION",
  "HYPHEN",
  "DASH",

  // syntax structure markers
  "SUBJECT",
  "PREDICATE",
  "OBJECT",
  "CLAUSE",
  "PHRASE",
  "SENTENCE",

  // tense markers
  "PRESENT",
  "PAST",
  "FUTURE",
  "PERFECT",
  "PROGRESSIVE",

  // system/domain base tokens
  "<SYS_GRAMMAR>",
  "GRAMMAR_BASE",
  "GRAMMAR_SYS_TOKEN",

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
  "TOKEN_21",
  "TOKEN_22",
  "TOKEN_23",
  "TOKEN_24",
  "TOKEN_25",
  "TOKEN_26",
  "TOKEN_27",
  "TOKEN_28",
  "TOKEN_29",
  "TOKEN_30",
];

export default GRAMMAR_CORE_TOKENS;
