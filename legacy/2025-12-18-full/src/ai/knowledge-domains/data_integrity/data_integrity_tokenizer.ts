/**
 * Data Integrity Domain Tokenizer
 * Tokenizes text for data validation, consistency, and quality analysis
 */

import { DOMAIN_NAME } from "./data_integrity_constants";

export interface TokenizeOptions {
  includePunctuation?: boolean;
  lowercase?: boolean;
  includeSystemTokens?: boolean;
}

/**
 * Tokenize text for data integrity analysis
 */
export const dataIntegrityTokenizer = (
  text: string,
  options?: TokenizeOptions,
): string[] => {
  const opts = {
    includePunctuation: false,
    lowercase: true,
    includeSystemTokens: true,
    ...options,
  };

  let processedText = text;

  // Convert to lowercase if specified
  if (opts.lowercase) {
    processedText = processedText.toLowerCase();
  }

  // Split on whitespace and punctuation (except hyphens in words)
  const tokens = processedText
    .split(/[\s,;:.!?()[\]{}'"]+/)
    .filter((token) => token.length > 0);

  // Add system tokens for data integrity concepts
  const systemTokens: string[] = [];

  if (opts.includeSystemTokens) {
    const dataKeywords = [
      "data",
      "valid",
      "integrity",
      "consistency",
      "quality",
    ];
    const hasDataKeywords = dataKeywords.some((kw) =>
      processedText.includes(kw),
    );

    if (hasDataKeywords) {
      systemTokens.push(`<DOMAIN:${DOMAIN_NAME}>`);
    }
  }

  return [...systemTokens, ...tokens];
};

/**
 * Count tokens in text
 */
export const countTokens = (text: string): number => {
  return dataIntegrityTokenizer(text).length;
};

/**
 * Extract data integrity keywords from text
 */
export const extractKeywords = (text: string): string[] => {
  const tokens = dataIntegrityTokenizer(text, { lowercase: true });

  const keywords = [
    "data",
    "validation",
    "integrity",
    "consistency",
    "quality",
    "validate",
    "check",
    "verify",
    "sanitize",
    "clean",
    "schema",
    "constraint",
    "format",
    "type",
    "error",
    "corrupt",
    "incomplete",
    "accurate",
    "unique",
    "complete",
  ];

  return tokens.filter((token) => keywords.includes(token));
};

export default dataIntegrityTokenizer;
