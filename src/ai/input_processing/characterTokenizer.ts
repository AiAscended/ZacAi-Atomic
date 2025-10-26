/**
 * File: src/ai/input_processing/characterTokenizer.ts
 * Description: Simple character-level tokenizer for small-scale tokenization needs.
 * Dependencies: none
 * Dependents: higher-level tokenizers, embedding modules
 * Role: Breaks a string into a sequence of characters, used for debugging, character models
 * How it works: Splits string into characters; can return numeric ids via simple map.
 */

export const charToIdMap = (input: string): Record<string, number> => {
  const map: Record<string, number> = {};
  let next = 1;
  for (const ch of input) {
    if (!map[ch]) map[ch] = next++;
  }
  return map;
};

export const characterTokenizer = (text: string): string[] => {
  return text.split('');
};

export const characterIds = (text: string): number[] => {
  const map = charToIdMap(text);
  return text.split('').map((c) => map[c]);
};
