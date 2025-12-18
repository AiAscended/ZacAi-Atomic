/**
 * File: src/ai/output_generation/dialogueConsistencyValidator.ts
 * Purpose: Simple validator that checks for contradictions across recent messages (MVP heuristic).
 */

export const isConsistent = (history: string[]) => {
  // naive heuristic: if exact negation words appear in later messages relative to earlier ones, flag
  const joined = history.join(" ").toLowerCase();
  if (joined.includes("i am") && joined.includes("i am not")) return false;
  return true;
};
