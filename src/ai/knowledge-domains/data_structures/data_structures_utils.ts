/**
 * File: src/ai/data/data_structures/data_structures_utils.ts
 * Purpose: Shared utility functions for data_structures domain
 * Depends on: None
 * Depended on by: All data_structures domain files
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Normalize text for data structure analysis
 * Handles: whitespace, special characters, code formatting
 */
export const normalizeText = (text: string): string => {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
};

/**
 * Detect data structure patterns in code
 * Returns: array of detected structure types
 */
export const detectDataStructurePatterns = (code: string) => {
  const patterns = {
    array: /\[\]|Array<|new Array/gi,
    linkedList: /LinkedList|\.next|\.prev/gi,
    tree: /TreeNode|\.left|\.right|BinaryTree/gi,
    graph: /Graph|adjacency|vertex|edge/gi,
    hashMap: /Map<|HashMap|new Map/gi,
    set: /Set<|HashSet|new Set/gi,
    stack: /Stack|\.push|\.pop/gi,
    queue: /Queue|\.enqueue|\.dequeue/gi,
    heap: /Heap|PriorityQueue/gi,
  };

  const detected: string[] = [];
  for (const [structure, pattern] of Object.entries(patterns)) {
    if (pattern.test(code)) {
      detected.push(structure);
    }
  }
  return detected;
};

/**
 * Safe JSON parsing with fallback
 */
export const safeParseJSON = (text: string, fallback: unknown = {}) => {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
};
