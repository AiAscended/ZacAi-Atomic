/**
 * File: src/ai/data/algorithms/algorithms_utils.ts
 * Purpose: Shared utility functions for algorithms domain
 * Depends on: None
 * Depended on by: All algorithms domain files
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Normalize text for algorithm analysis
 */
export const normalizeText = (text: string): string => {
  return text.trim().replace(/\s+/g, " ").toLowerCase()
}

/**
 * Detect algorithm patterns in code
 */
export const detectAlgorithmPatterns = (code: string) => {
  const patterns = {
    sorting: /sort|quicksort|mergesort|heapsort|bubblesort/gi,
    searching: /search|binarySearch|linearSearch|bfs|dfs/gi,
    dynamicProgramming: /dp\[|memo\[|tabulation|fibonacci|knapsack/gi,
    greedy: /greedy|optimal|maxProfit|minCost/gi,
    divideConquer: /divide|conquer|merge|partition/gi,
    backtracking: /backtrack|permutation|combination|nQueens/gi,
  }

  const detected: string[] = []
  for (const [algorithm, pattern] of Object.entries(patterns)) {
    if (pattern.test(code)) {
      detected.push(algorithm)
    }
  }
  return detected
}

/**
 * Safe JSON parsing with fallback
 */
export const safeParseJSON = (text: string, fallback: unknown = {}) => {
  try {
    return JSON.parse(text)
  } catch {
    return fallback
  }
}
