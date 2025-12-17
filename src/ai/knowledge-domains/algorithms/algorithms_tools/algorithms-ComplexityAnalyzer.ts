/**
 * Algorithms Domain Tool: Complexity Analyzer
 * Analyzes algorithm complexity (time and space)
 */

export class AlgorithmsComplexityAnalyzer {
  analyze(code: string): {
    timeComplexity: string;
    spaceComplexity: string;
    confidence: number;
  } {
    const normalized = code.toLowerCase();
    const hasNestedLoop = /for\s*\([^)]*\)\s*{[^{}]*for\s*\(/.test(normalized);
    const hasRecursion = /function\s+\w+\s*\([^)]*\)\s*{[^}]*\n?\s*return\s+\w+\(/.test(normalized);

    if (hasNestedLoop) {
      return {
        timeComplexity: 'O(n^2)',
        spaceComplexity: 'O(1)',
        confidence: 0.4,
      };
    }

    if (hasRecursion) {
      return {
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(log n)',
        confidence: 0.4,
      };
    }

    return {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      confidence: 0.5,
    };
  }
}

export default AlgorithmsComplexityAnalyzer;
