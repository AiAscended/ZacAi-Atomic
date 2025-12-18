/**
 * Observability Domain Tokenizer
 * Tokenizes text for logging, monitoring, and metrics analysis
 */

import { DOMAIN_NAME } from "./observability_constants";

export interface TokenizeOptions {
  includePunctuation?: boolean;
  lowercase?: boolean;
  includeSystemTokens?: boolean;
}

/**
 * Tokenize text for observability analysis
 */
export const observabilityTokenizer = (
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

  // Add system tokens for observability concepts
  const systemTokens: string[] = [];

  if (opts.includeSystemTokens) {
    const observabilityKeywords = [
      "log",
      "monitor",
      "metric",
      "trace",
      "alert",
      "observability",
    ];
    const hasObservabilityKeywords = observabilityKeywords.some((kw) =>
      processedText.includes(kw),
    );

    if (hasObservabilityKeywords) {
      systemTokens.push(`<DOMAIN:${DOMAIN_NAME}>`);
    }
  }

  return [...systemTokens, ...tokens];
};

/**
 * Count tokens in text
 */
export const countTokens = (text: string): number => {
  return observabilityTokenizer(text).length;
};

/**
 * Extract observability keywords from text
 */
export const extractKeywords = (text: string): string[] => {
  const tokens = observabilityTokenizer(text, { lowercase: true });

  const keywords = [
    "log",
    "logging",
    "monitor",
    "monitoring",
    "metric",
    "metrics",
    "trace",
    "tracing",
    "span",
    "alert",
    "alerting",
    "observability",
    "telemetry",
    "dashboard",
    "performance",
    "latency",
    "throughput",
    "error",
    "warning",
    "debug",
    "info",
    "fatal",
    "anomaly",
  ];

  return tokens.filter((token) => keywords.includes(token));
};

export default observabilityTokenizer;
