/**
 * File: src/ai/context_management/contextWindowManager.ts
 * Purpose: Manage sliding window of conversational context tokens/messages.
 */

export class ContextWindowManager {
  private maxTokens: number;
  private window: string[] = [];

  constructor(maxTokens = 2048) {
    this.maxTokens = maxTokens;
  }

  add(text: string) {
    this.window.push(text);
    // naive token approximation: split on whitespace
    while (this.tokenCount() > this.maxTokens) {
      this.window.shift();
    }
  }

  getWindow() {
    return this.window.slice();
  }

  clear() {
    this.window = [];
  }

  private tokenCount() {
    return this.window.join(' ').split(/\s+/).length;
  }
}
