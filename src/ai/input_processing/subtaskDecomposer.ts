/**
 * File: src/ai/input_processing/subtaskDecomposer.ts
 * Decomposes prompts into atomic subtasks based on domain logic.
 * Designed for extensibility with NLP parsing or rule-based decomposition.
 *
 * Usage:
 * - decompose(promptText): returns array of subtasks.
 */

export class SubtaskDecomposer {
  /**
   * Decompose input prompt into subtasks.
   * @param prompt user prompt string
   * @returns array of subtask prompts
   */
  async decompose(prompt: string): Promise<string[]> {
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Invalid prompt to decompose");
    }
    // Basic split, extend for NLP parse for complex prompts
    return prompt.split(/[.!?]\s/).filter(Boolean);
  }
}
