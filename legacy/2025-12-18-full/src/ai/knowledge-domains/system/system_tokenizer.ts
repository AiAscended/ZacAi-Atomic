/**
 * System Domain Tokenizer
 * Tokenizes text for system-level operations, configuration, and management
 */

import { DOMAIN_NAME } from "./system_constants";

export interface TokenizeOptions {
  includePunctuation?: boolean;
  lowercase?: boolean;
  includeSystemTokens?: boolean;
}

/**
 * Tokenize text for system operations analysis
 */
export const systemTokenizer = (
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

  // Add system tokens for system operations concepts
  const systemTokens: string[] = [];

  if (opts.includeSystemTokens) {
    const systemKeywords = [
      "system",
      "config",
      "time",
      "date",
      "location",
      "settings",
    ];
    const hasSystemKeywords = systemKeywords.some((kw) =>
      processedText.includes(kw),
    );

    if (hasSystemKeywords) {
      systemTokens.push(`<DOMAIN:${DOMAIN_NAME}>`);
    }
  }

  return [...systemTokens, ...tokens];
};

/**
 * Count tokens in text
 */
export const countTokens = (text: string): number => {
  return systemTokenizer(text).length;
};

/**
 * Extract system operation keywords from text
 */
export const extractKeywords = (text: string): string[] => {
  const tokens = systemTokenizer(text, { lowercase: true });

  const keywords = [
    "system",
    "config",
    "configuration",
    "settings",
    "time",
    "date",
    "timezone",
    "location",
    "environment",
    "variable",
    "path",
    "version",
    "platform",
    "architecture",
    "os",
    "operating",
    "process",
    "thread",
    "memory",
    "cpu",
    "disk",
    "network",
  ];

  return tokens.filter((token) => keywords.includes(token));
};

export default systemTokenizer;
