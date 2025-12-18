/**
 * File: src/ai/input_processing/promptProcessor.ts
 * Handles the initial processing of user prompts including cleaning,
 * tokenization, prompt decomposition, and sentiment detection.
 * Implements separation of concerns for maintainability.
 *
 * Dependencies:
 * - src/ai/shared/tools/textFormatting/textFormatter.ts
 * - src/ai/shared/tools/textFormatting/summarizer.ts
 *
 * Usage:
 * - process(rawPrompt): Cleans and preprocesses input.
 * - decomposeSubtasks(prompt): Decomposes complex prompts into atomic subtasks.
 */

// Import utilities for text processing
import { cleanText } from "../shared/tools/textFormatting/textFormatter";

// Define interface for processed prompt output
export interface ProcessedPrompt {
  cleanedText: string;
  tokens: number[];
}

// Class implements the processing logic
export class PromptProcessor {
  /**
   * Clean raw user prompt text for uniformity and safety.
   * @param prompt raw input string
   * @returns cleaned prompt string
   */
  process(prompt: string): string {
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Invalid prompt input");
    }
    const cleaned = cleanText(prompt);
    return cleaned;
  }

  /**
   * Decompose complex prompts into smaller subtasks for domain-specific processing.
   * Could be extended for prompt understanding, NLP parsing.
   * @param prompt cleaned prompt string
   * @returns Array of subtask prompts
   */
  async decomposeSubtasks(prompt: string): Promise<string[]> {
    // Example implementation: split by sentences or custom NLP
    const subtasks = prompt.split(/[.!?]\s/).filter((x) => x.length > 0);
    return subtasks;
  }
}
