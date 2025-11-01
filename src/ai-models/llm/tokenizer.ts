/**
 * Tokenizer
 * 
 * Tokenizes input text and detokenizes output.
 * Handles text <-> token ID conversion.
 */

import { LLMConfig } from './config';

export interface Token {
  id: number;
  text: string;
}

export interface TokenizerResult {
  tokens: number[];
  attentionMask: number[];
  originalText: string;
}

export class Tokenizer {
  private vocab: Map<string, number>;
  private reverseVocab: Map<number, string>;
  // private config: LLMConfig; // TODO: Use for advanced tokenization features
  
  constructor(_config: LLMConfig) {
    // this.config = config; // TODO: Store for configuration-based tokenization
    this.vocab = new Map();
    this.reverseVocab = new Map();
    this.initializeVocab();
  }
  
  /**
   * Initialize vocabulary (placeholder - would load from file in production)
   */
  private initializeVocab(): void {
    // Special tokens
    this.vocab.set('<PAD>', 0);
    this.vocab.set('<UNK>', 1);
    this.vocab.set('<BOS>', 2);
    this.vocab.set('<EOS>', 3);
    
    // Build reverse mapping
    this.vocab.forEach((id, token) => {
      this.reverseVocab.set(id, token);
    });
  }
  
  /**
   * Tokenize input text into token IDs
   */
  encode(text: string, addSpecialTokens: boolean = true): TokenizerResult {
    const tokens: number[] = [];
    
    if (addSpecialTokens) {
      tokens.push(this.vocab.get('<BOS>')!);
    }
    
    // Simple word-level tokenization (placeholder)
    // In production, use BPE, WordPiece, or SentencePiece
    const words = text.toLowerCase().split(/\s+/);
    
    for (const word of words) {
      const tokenId = this.vocab.get(word) ?? this.vocab.get('<UNK>')!;
      tokens.push(tokenId);
    }
    
    if (addSpecialTokens) {
      tokens.push(this.vocab.get('<EOS>')!);
    }
    
    // Create attention mask (1 for real tokens, 0 for padding)
    const attentionMask = new Array(tokens.length).fill(1);
    
    return {
      tokens,
      attentionMask,
      originalText: text,
    };
  }
  
  /**
   * Decode token IDs back to text
   */
  decode(tokenIds: number[], skipSpecialTokens: boolean = true): string {
    const words: string[] = [];
    const specialTokens = new Set([0, 1, 2, 3]); // PAD, UNK, BOS, EOS
    
    for (const id of tokenIds) {
      if (skipSpecialTokens && specialTokens.has(id)) {
        continue;
      }
      
      const word = this.reverseVocab.get(id) ?? '<UNK>';
      words.push(word);
    }
    
    return words.join(' ');
  }
  
  /**
   * Get vocabulary size
   */
  getVocabSize(): number {
    return this.vocab.size;
  }
  
  /**
   * Pad sequence to max length
   */
  padSequence(tokens: number[], maxLength: number): number[] {
    const padded = [...tokens];
    const padId = this.vocab.get('<PAD>')!;
    
    while (padded.length < maxLength) {
      padded.push(padId);
    }
    
    return padded.slice(0, maxLength);
  }
}
