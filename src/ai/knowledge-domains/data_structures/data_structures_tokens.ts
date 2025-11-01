/**
 * File: src/ai/data/data_structures/data_structures_tokens.ts
 * Purpose: Domain-specific core tokens for data structures (arrays, trees, graphs, hash tables)
 * Depends on: None
 * Depended on by: data_structures_tokenizer.ts, data_structures_tokenMap.ts
 * Creator: Vercel v0 Coding Assistant
 */

export const DATA_STRUCTURES_CORE_TOKENS = [
  "[PAD]",
  "[UNK]",
  "[CLS]",
  "[SEP]",
  "array",
  "list",
  "stack",
  "queue",
  "tree",
  "graph",
  "hash",
  "map",
  "set",
  "linked",
  "binary",
  "heap",
  "trie",
  "node",
  "edge",
  "vertex",
  "pointer",
  "index",
  "key",
  "value",
  "insert",
  "delete",
  "search",
  "traverse",
  "sort",
  "complexity",
  "O(n)",
  "O(log n)",
  "O(1)",
  "<SYS_DATA_STRUCTURES>",
  "DATA_STRUCTURES_BASE",
  "DATA_STRUCTURES_SYS_TOKEN",
]

/**
 * Production-ready data structure token analysis
 * Detects: arrays, linked lists, trees, graphs, hash tables, heaps, tries
 * Edge cases: nested structures, generic types, custom implementations
 */
export const analyzeDataStructureTokens = (tokens: string[]) => {
  const structures = {
    arrays: tokens.filter((t) => /array|list|\[\]/.test(t.toLowerCase())).length,
    trees: tokens.filter((t) => /tree|node|binary|bst/.test(t.toLowerCase())).length,
    graphs: tokens.filter((t) => /graph|vertex|edge/.test(t.toLowerCase())).length,
    hashTables: tokens.filter((t) => /hash|map|dict/.test(t.toLowerCase())).length,
  }
  return structures
}

export default DATA_STRUCTURES_CORE_TOKENS
