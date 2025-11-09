/**
 * File: src/ai/data/security/security_utils.ts
 * Purpose: Shared utility functions for security domain
 * Depends on: None
 * Depended on by: All security domain files
 * Creator: Vercel v0 Coding Assistant
 */

export const safeParseJSON = <T = unknown>(s: string, fallback: T): T => {
  try {
    return JSON.parse(s) as T;
  } catch (e) {
    return fallback;
  }
};

export const normalizeText = (t: string) => t.replace(/\s+/g, " ").trim();

export const detectSecurityIssues = (code: string): string[] => {
  const issues: string[] = [];
  if (/eval\(|innerHTML|dangerouslySetInnerHTML/.test(code)) issues.push("XSS");
  if (
    /SELECT.*FROM.*WHERE/i.test(code) &&
    !/prepared|parameterized/i.test(code)
  )
    issues.push("SQL_INJECTION");
  if (/password|secret|api_key/i.test(code) && /=\s*["'][^"']+["']/.test(code))
    issues.push("HARDCODED_SECRET");
  return issues;
};
