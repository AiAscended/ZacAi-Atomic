/**
 * Code Review Domain Tool: Code Analyzer
 * Reviews code for quality, best practices, and issues
 */

export class CodeReviewAnalyzer {
  review(code: string): {
    issues: string[];
    suggestions: string[];
    score: number;
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const trimmed = code.trim();

    if (!trimmed.length) {
      suggestions.push('Provide code for review.');
      return { issues, suggestions, score: 0 };
    }

    if (/console\.log/.test(code)) {
      issues.push('Remove debug logging before production.');
      suggestions.push('Use a structured logger or feature flagged debug helpers.');
    }

    if (!/unit|test/i.test(code) && /class|function/.test(code)) {
      suggestions.push('Consider adding automated tests to improve regressions coverage.');
    }

    return {
      issues,
      suggestions,
      score: Math.max(0.2, 1 - issues.length * 0.2),
    };
  }
}

export default CodeReviewAnalyzer;
