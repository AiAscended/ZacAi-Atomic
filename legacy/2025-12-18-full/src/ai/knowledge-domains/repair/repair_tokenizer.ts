/**
 * Repair Domain Tokenizer
 * Tokenizes text for debugging, error detection, and code repair analysis
 */

import { DOMAIN_NAME } from "./repair_constants";

export interface TokenizeOptions {
  includePunctuation?: boolean;
  lowercase?: boolean;
  includeSystemTokens?: boolean;
}

/**
 * Tokenize text for repair and debugging analysis
 */
export const repairTokenizer = (
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

  // Add system tokens for repair concepts
  const systemTokens: string[] = [];

  if (opts.includeSystemTokens) {
    const repairKeywords = ["error", "bug", "fix", "debug", "repair", "broken"];
    const hasRepairKeywords = repairKeywords.some((kw) =>
      processedText.includes(kw),
    );

    if (hasRepairKeywords) {
      systemTokens.push(`<DOMAIN:${DOMAIN_NAME}>`);
    }
  }

  return [...systemTokens, ...tokens];
};

/**
 * Count tokens in text
 */
export const countTokens = (text: string): number => {
  return repairTokenizer(text).length;
};

/**
 * Extract repair/debugging keywords from text
 */
export const extractKeywords = (text: string): string[] => {
  const tokens = repairTokenizer(text, { lowercase: true });

  const keywords = [
    "error",
    "bug",
    "fix",
    "debug",
    "debugging",
    "repair",
    "broken",
    "crash",
    "exception",
    "failure",
    "issue",
    "troubleshoot",
    "diagnose",
    "resolve",
    "patch",
    "workaround",
    "stack",
    "trace",
    "backtrace",
    "undefined",
    "null",
    "reference",
  ];

  return tokens.filter((token) => keywords.includes(token));
};

export default repairTokenizer;
