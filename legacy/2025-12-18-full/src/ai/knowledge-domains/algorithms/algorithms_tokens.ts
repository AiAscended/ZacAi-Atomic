/**
 * File: src/ai/data/algorithms/algorithms_tokens.ts
 * Purpose: Domain-specific core tokens for algorithms (sorting, searching, dynamic programming)
 * Depends on: None
 * Depended on by: algorithms_tokenizer.ts, algorithms_tokenMap.ts
 * Creator: Vercel v0 Coding Assistant
 */

export const ALGORITHMS_CORE_TOKENS = [
  "[PAD]",
  "[UNK]",
  "[CLS]",
  "[SEP]",
  "sort",
  "search",
  "binary",
  "linear",
  "quicksort",
  "mergesort",
  "heapsort",
  "bubblesort",
  "bfs",
  "dfs",
  "dijkstra",
  "dynamic",
  "greedy",
  "backtrack",
  "recursion",
  "iteration",
  "divide",
  "conquer",
  "memoization",
  "tabulation",
  "optimization",
  "complexity",
  "time",
  "space",
  "O(n)",
  "O(log n)",
  "O(n^2)",
  "O(1)",
  "<SYS_ALGORITHMS>",
  "ALGORITHMS_BASE",
  "ALGORITHMS_SYS_TOKEN",
];

/**
 * Production-ready algorithm token analysis
 * Detects: sorting, searching, graph algorithms, dynamic programming
 * Edge cases: hybrid algorithms, optimization techniques
 */
export const analyzeAlgorithmTokens = (tokens: string[]) => {
  const algorithms = {
    sorting: tokens.filter((t) =>
      /sort|quick|merge|heap|bubble/.test(t.toLowerCase()),
    ).length,
    searching: tokens.filter((t) =>
      /search|binary|linear|bfs|dfs/.test(t.toLowerCase()),
    ).length,
    dynamicProgramming: tokens.filter((t) =>
      /dynamic|memo|tabulation|dp/.test(t.toLowerCase()),
    ).length,
    greedy: tokens.filter((t) => /greedy|optimal/.test(t.toLowerCase())).length,
  };
  return algorithms;
};

export default ALGORITHMS_CORE_TOKENS;
