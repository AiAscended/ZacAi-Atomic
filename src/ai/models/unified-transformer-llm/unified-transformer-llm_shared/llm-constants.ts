/**
 * LLM Constants
 * Model constants and special tokens
 */

export const LLM_SPECIAL_TOKENS = {
  PAD: "<PAD>",
  BOS: "<BOS>",
  EOS: "<EOS>",
  UNK: "<UNK>",
  MASK: "<MASK>",
  SEP: "<SEP>",
  CLS: "<CLS>",
} as const;

export const LLM_TOKEN_IDS = {
  PAD: 0,
  BOS: 1,
  EOS: 2,
  UNK: 3,
  MASK: 4,
  SEP: 5,
  CLS: 6,
} as const;

export const LLM_MODEL_VERSIONS = {
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
  XL: "xl",
} as const;

export const LLM_MAX_SEQUENCE_LENGTHS = {
  [LLM_MODEL_VERSIONS.SMALL]: 512,
  [LLM_MODEL_VERSIONS.MEDIUM]: 1024,
  [LLM_MODEL_VERSIONS.LARGE]: 2048,
  [LLM_MODEL_VERSIONS.XL]: 4096,
} as const;

export const llmConstants = {
  SPECIAL_TOKENS: LLM_SPECIAL_TOKENS,
  TOKEN_IDS: LLM_TOKEN_IDS,
  MODEL_VERSIONS: LLM_MODEL_VERSIONS,
  MAX_SEQUENCE_LENGTHS: LLM_MAX_SEQUENCE_LENGTHS,
}; 

export default llmConstants;
