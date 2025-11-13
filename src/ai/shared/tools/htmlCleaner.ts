/**
 * File: src/ai/shared/tools/htmlCleaner.ts
 * Purpose: Clean and extract text from HTML content
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Remove HTML tags and extract clean text
 */
export function stripHtmlTags(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "") // Remove styles
    .replace(/<[^>]+>/g, "") // Remove all HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp;
    .replace(/&amp;/g, "&") // Replace &amp;
    .replace(/&lt;/g, "<") // Replace &lt;
    .replace(/&gt;/g, ">") // Replace &gt;
    .replace(/&quot;/g, '"') // Replace &quot;
    .replace(/&#39;/g, "'") // Replace &#39;
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

/**
 * Extract main content from HTML (remove navigation, ads, etc.)
 */
export function extractMainContent(html: string): string {
  // Try to find main content areas
  const mainPatterns = [
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ]

  for (const pattern of mainPatterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      return stripHtmlTags(match[1])
    }
  }

  // Fallback: strip all HTML
  return stripHtmlTags(html)
}

/**
 * Summarize text to a maximum length
 */
export function summarizeText(text: string, maxLength = 500): string {
  if (text.length <= maxLength) {
    return text
  }

  // Try to cut at sentence boundary
  const truncated = text.substring(0, maxLength)
  const lastPeriod = truncated.lastIndexOf(".")
  const lastQuestion = truncated.lastIndexOf("?")
  const lastExclamation = truncated.lastIndexOf("!")

  const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation)

  if (lastSentenceEnd > maxLength * 0.7) {
    return truncated.substring(0, lastSentenceEnd + 1) + "..."
  }

  // Cut at word boundary
  const lastSpace = truncated.lastIndexOf(" ")
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + "..."
  }

  return truncated + "..."
}
