/**
 * File: src/ai/shared/tools/textFormatting/summarizer.ts
 * Implements a simple extractive summarization utility.
 */

export function extractiveSummarize(
  paragraphs: string[],
  maxSentences = 3,
): string {
  if (!paragraphs || paragraphs.length === 0) return "";
  return paragraphs.slice(0, maxSentences).join(" ");
}
