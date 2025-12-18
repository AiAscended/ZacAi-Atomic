/**
 * File: src/ai/output_generation/responsePostProcessor.ts
 * Purpose: Post-processor for generated text - cleanup, formatting, HTML removal
 * Depends on: None
 * Depended on by: src/ai/orchestration/aiOrchestrator.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Remove HTML tags and clean up text
 */
function stripHTML(text: string): string {
  // Remove script and style tags with content
  let cleaned = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  cleaned = cleaned.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "");

  // Remove all HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  cleaned = cleaned.replace(/&nbsp;/g, " ");
  cleaned = cleaned.replace(/&amp;/g, "&");
  cleaned = cleaned.replace(/&lt;/g, "<");
  cleaned = cleaned.replace(/&gt;/g, ">");
  cleaned = cleaned.replace(/&quot;/g, '"');
  cleaned = cleaned.replace(/&#39;/g, "'");
  cleaned = cleaned.replace(/&apos;/g, "'");
  cleaned = cleaned.replace(/&#(\d+);/g, (match, dec) =>
    String.fromCharCode(dec),
  );
  cleaned = cleaned.replace(/&#x([0-9a-f]+);/gi, (match, hex) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  );

  return cleaned;
}

/**
 * Post-process generated text
 */
export const postProcess = (text: string): string => {
  // Strip HTML if present
  let cleaned = stripHTML(text);

  // Clean up excessive whitespace
  cleaned = cleaned.replace(/\s+/g, " ");

  // Clean up multiple newlines (keep max 2)
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Trim whitespace
  cleaned = cleaned.trim();

  // Remove any remaining control characters
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return cleaned;
};

/**
 * Format code blocks properly
 */
export function formatCodeBlock(code: string, language: string): string {
  return `\`\`\`${language}\n${code.trim()}\n\`\`\``;
}

/**
 * Format a list of items
 */
export function formatList(items: string[], ordered = false): string {
  return items
    .map((item, idx) => (ordered ? `${idx + 1}. ${item}` : `- ${item}`))
    .join("\n");
}

/**
 * Truncate text to a maximum length
 */
export function truncate(
  text: string,
  maxLength: number,
  suffix = "...",
): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}
