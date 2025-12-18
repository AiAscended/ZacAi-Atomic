/**
 * LLM Tokenizer
 * Handles tokenization and detokenization of input text
 * Now uses shared vocabulary manager for consistent tokenization across all models
 */

import { vocabularyManager } from "../../../shared/vocabulary/vocabularyManager";

export class LLMTokenizer {
  private vocabulary: Map<string, number>;
  private reverseVocabulary: Map<number, string>;
  private specialTokens: Record<string, string>;

  constructor(
    vocabulary?: Map<string, number>,
    specialTokens?: Record<string, string>,
  ) {
    // Use shared vocabulary if no custom vocabulary provided
    if (!vocabulary || vocabulary.size === 0) {
      this.vocabulary = vocabularyManager.getVocabulary();
      this.reverseVocabulary = vocabularyManager.getReverseVocabulary();
      console.log(
        `[LLMTokenizer] Loaded shared vocabulary with ${this.vocabulary.size} tokens`,
      );
    } else {
      this.vocabulary = vocabulary;
      this.reverseVocabulary = new Map();
      this.vocabulary.forEach((id, token) => {
        this.reverseVocabulary.set(id, token);
      });
    }

    this.specialTokens = specialTokens || {
      pad: "<PAD>",
      bos: "<BOS>",
      eos: "<EOS>",
      unk: "<UNK>",
    };
  }

  /**
   * Encode text into token IDs
   */
  encode(text: string): number[] {
    const tokens = this.tokenize(text);
    return tokens.map(
      (token) =>
        this.vocabulary.get(token) ??
        this.vocabulary.get(this.specialTokens.unk) ??
        3,
    );
  }

  /**
   * Decode token IDs back into text
   */
  decode(tokenIds: number[]): string {
    const tokens = tokenIds.map(
      (id) => this.reverseVocabulary.get(id) ?? this.specialTokens.unk,
    );
    return tokens.join(" ");
  }

  /**
   * Tokenize text into individual tokens
   */
  private tokenize(text: string): string[] {
    // Simple whitespace tokenization (placeholder)
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 0);
  }

  /**
   * Get vocabulary size
   */
  getVocabSize(): number {
    return vocabularyManager.getEffectiveVocabSize();
  }
}

export default LLMTokenizer;
