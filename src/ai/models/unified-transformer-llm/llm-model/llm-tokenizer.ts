/**
 * LLM Tokenizer
 * Handles tokenization and detokenization of input text
 */

export class LLMTokenizer {
  private vocabulary: Map<string, number>;
  private reverseVocabulary: Map<number, string>;
  private specialTokens: Record<string, string>;

  constructor(
    vocabulary?: Map<string, number>,
    specialTokens?: Record<string, string>
  ) {
    this.vocabulary = vocabulary || new Map();
    this.reverseVocabulary = new Map();
    this.specialTokens = specialTokens || {
      pad: '<PAD>',
      bos: '<BOS>',
      eos: '<EOS>',
      unk: '<UNK>',
    };

    // Build reverse vocabulary
    this.vocabulary.forEach((id, token) => {
      this.reverseVocabulary.set(id, token);
    });
  }

  /**
   * Encode text into token IDs
   */
  encode(text: string): number[] {
    const tokens = this.tokenize(text);
    return tokens.map(token => this.vocabulary.get(token) ?? this.vocabulary.get(this.specialTokens.unk) ?? 3);
  }

  /**
   * Decode token IDs back into text
   */
  decode(tokenIds: number[]): string {
    const tokens = tokenIds.map(id => this.reverseVocabulary.get(id) ?? this.specialTokens.unk);
    return tokens.join(' ');
  }

  /**
   * Tokenize text into individual tokens
   */
  private tokenize(text: string): string[] {
    // Simple whitespace tokenization (placeholder)
    return text.toLowerCase().split(/\s+/).filter(t => t.length > 0);
  }

  /**
   * Get vocabulary size
   */
  getVocabSize(): number {
    return this.vocabulary.size;
  }
}

export default LLMTokenizer;
