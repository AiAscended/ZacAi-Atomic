/**
 * File: src/ai/data/programming/tools/programming-CodeAnalyzer.ts
 * Purpose: Analyze code structure, complexity, and patterns
 * Depends on: src/ai/shared/tools/shared-CodeLinter.ts
 * Depended on by: src/ai/data/programming/programming_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Analyzes code complexity and structure
 * @param code - Source code to analyze
 * @param language - Programming language
 * @returns Analysis results with metrics
 */
export function analyzeCodeComplexity(
  code: string,
  language: string,
): {
  linesOfCode: number;
  cyclomaticComplexity: number;
  functions: number;
  classes: number;
  comments: number;
} {
  const lines = code.split("\n");
  const linesOfCode = lines.filter((line) => line.trim().length > 0).length;

  // Count control flow statements for cyclomatic complexity
  const controlFlowKeywords =
    /\b(if|else|for|while|switch|case|catch|&&|\|\|)\b/g;
  const matches = code.match(controlFlowKeywords);
  const cyclomaticComplexity = matches ? matches.length + 1 : 1;

  // Count functions
  const functionPatterns =
    /\b(function|def|func|fn|=>|\bpublic\s+\w+\s+\w+\s*\()/g;
  const functionMatches = code.match(functionPatterns);
  const functions = functionMatches ? functionMatches.length : 0;

  // Count classes
  const classPatterns = /\b(class|interface|struct|enum)\s+\w+/g;
  const classMatches = code.match(classPatterns);
  const classes = classMatches ? classMatches.length : 0;

  // Count comments
  const commentPatterns = /(\/\/|\/\*|\*\/|#|<!--)/g;
  const commentMatches = code.match(commentPatterns);
  const comments = commentMatches ? commentMatches.length : 0;

  if (language) {
    console.log(`[Programming-CodeAnalyzer] Analyzing ${language} code sample`)
  }

  return {
    linesOfCode,
    cyclomaticComplexity,
    functions,
    classes,
    comments,
  };
}

/**
 * Detects code patterns and best practices
 * @param code - Source code to analyze
 * @returns Detected patterns and recommendations
 */
export function detectCodePatterns(code: string): {
  patterns: string[];
  recommendations: string[];
} {
  const patterns: string[] = [];
  const recommendations: string[] = [];

  // Detect design patterns
  if (code.includes("getInstance") || code.includes("private constructor")) {
    patterns.push("Singleton Pattern");
  }
  if (code.includes("extends") && code.includes("super(")) {
    patterns.push("Inheritance");
  }
  if (code.includes("interface") && code.includes("implements")) {
    patterns.push("Interface Implementation");
  }
  if (code.match(/\bfactory\b/i)) {
    patterns.push("Factory Pattern");
  }

  // Check for best practices
  if (!code.includes("try") && !code.includes("catch")) {
    recommendations.push(
      "Consider adding error handling with try-catch blocks",
    );
  }
  if (code.split("\n").some((line) => line.length > 120)) {
    recommendations.push(
      "Some lines exceed 120 characters - consider breaking them up",
    );
  }
  if (!code.includes("/**") && !code.includes("//")) {
    recommendations.push(
      "Add comments and documentation for better maintainability",
    );
  }

  return { patterns, recommendations };
}
