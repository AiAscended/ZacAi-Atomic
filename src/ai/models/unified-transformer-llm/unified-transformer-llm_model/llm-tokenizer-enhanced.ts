/**
 * Enhanced LLM Tokenizer
 * Implements industry-standard tokenization algorithms:
 * - Byte Pair Encoding (BPE) - used by GPT models
 * - WordPiece - used by BERT
 * - Unigram Language Model - used by T5
 * 
 * 2025 AI Standards Compliant
 */

import { vocabularyManager } from '../../../shared/vocabulary/vocabularyManager';

export type TokenizerType = 'bpe' | 'wordpiece' | 'unigram' | 'simple';

export interface TokenizerConfig {
  type: TokenizerType;
  vocabSize?: number;
  minFrequency?: number;
  unknownToken?: string;
  padToken?: string;
  bosToken?: string;
  eosToken?: string;
  maskToken?: string;
}

export class EnhancedLLMTokenizer {
  private vocabulary: Map<string, number>;
  private reverseVocabulary: Map<number, string>;
  private specialTokens: Record<string, string>;
  private config: TokenizerConfig;
  
  // BPE-specific data structures
  private bpeMerges: Map<string, number> = new Map();
  private bpeCache: Map<string, string[]> = new Map();
  
  // WordPiece-specific
  private wordpiecePrefix: string = '##';

  constructor(config?: Partial<TokenizerConfig>) {
    this.config = {
      type: 'bpe',
      vocabSize: 50000,
      minFrequency: 2,
      unknownToken: '<UNK>',
      padToken: '<PAD>',
      bosToken: '<BOS>',
      eosToken: '<EOS>',
      maskToken: '<MASK>',
      ...config,
    };

    // Use shared vocabulary as base
    this.vocabulary = vocabularyManager.getVocabulary();
    this.reverseVocabulary = vocabularyManager.getReverseVocabulary();
    
    this.specialTokens = {
      pad: this.config.padToken!,
      bos: this.config.bosToken!,
      eos: this.config.eosToken!,
      unk: this.config.unknownToken!,
      mask: this.config.maskToken!,
    };

    console.log(`[EnhancedLLMTokenizer] Initialized ${this.config.type} tokenizer with ${this.vocabulary.size} tokens`);
  }

  /**
   * Encode text into token IDs
   */
  encode(text: string, addSpecialTokens: boolean = true): number[] {
    let tokens: string[] = [];
    
    // Add BOS token if requested
    if (addSpecialTokens) {
      tokens.push(this.specialTokens.bos);
    }

    // Tokenize based on algorithm
    switch (this.config.type) {
      case 'bpe':
        tokens.push(...this.tokenizeBPE(text));
        break;
      case 'wordpiece':
        tokens.push(...this.tokenizeWordPiece(text));
        break;
      case 'unigram':
        tokens.push(...this.tokenizeUnigram(text));
        break;
      default:
        tokens.push(...this.tokenizeSimple(text));
    }

    // Add EOS token if requested
    if (addSpecialTokens) {
      tokens.push(this.specialTokens.eos);
    }

    // Convert tokens to IDs
    return tokens.map(token => this.vocabulary.get(token) ?? this.vocabulary.get(this.specialTokens.unk) ?? 3);
  }

  /**
   * Decode token IDs back into text
   */
  decode(tokenIds: number[], skipSpecialTokens: boolean = true): string {
    const tokens = tokenIds.map(id => this.reverseVocabulary.get(id) ?? this.specialTokens.unk);
    
    // Filter special tokens if requested
    const filteredTokens = skipSpecialTokens
      ? tokens.filter(token => !Object.values(this.specialTokens).includes(token))
      : tokens;

    // Handle WordPiece prefix removal
    if (this.config.type === 'wordpiece') {
      return this.reconstructWordPiece(filteredTokens);
    }

    return filteredTokens.join(' ');
  }

  /**
   * Byte Pair Encoding tokenization
   * Implements the BPE algorithm used in GPT models
   */
  private tokenizeBPE(text: string): string[] {
    // Check cache first
    if (this.bpeCache.has(text)) {
      return this.bpeCache.get(text)!;
    }

    // Normalize and split into words
    const words = this.normalizeText(text).split(/\s+/).filter(w => w.length > 0);
    const tokens: string[] = [];

    for (const word of words) {
      // Split word into character sequence with end-of-word marker
      let wordTokens = word.split('').map((c, i) => i === word.length - 1 ? c + '</w>' : c);
      
      // Iteratively apply BPE merges
      while (wordTokens.length > 1) {
        const pairs = this.getPairs(wordTokens);
        if (pairs.length === 0) break;

        // Find the most frequent pair to merge
        let bestPair: [string, string] | null = null;
        let bestRank = Infinity;

        for (const pair of pairs) {
          const pairStr = pair.join(' ');
          const rank = this.bpeMerges.get(pairStr) ?? Infinity;
          if (rank < bestRank) {
            bestRank = rank;
            bestPair = pair;
          }
        }

        if (bestPair === null || bestRank === Infinity) break;

        // Merge the best pair
        wordTokens = this.mergePair(wordTokens, bestPair);
      }

      tokens.push(...wordTokens);
    }

    // Cache result
    this.bpeCache.set(text, tokens);
    
    return tokens;
  }

  /**
   * WordPiece tokenization
   * Implements the WordPiece algorithm used in BERT
   */
  private tokenizeWordPiece(text: string): string[] {
    const words = this.normalizeText(text).split(/\s+/).filter(w => w.length > 0);
    const tokens: string[] = [];

    for (const word of words) {
      let isUnknown = false;
      let start = 0;
      const subTokens: string[] = [];

      while (start < word.length) {
        let end = word.length;
        let foundSubToken: string | null = null;

        // Greedy longest-match-first
        while (start < end) {
          const substr = word.substring(start, end);
          const candidate = start === 0 ? substr : this.wordpiecePrefix + substr;
          
          if (this.vocabulary.has(candidate)) {
            foundSubToken = candidate;
            break;
          }
          end--;
        }

        if (foundSubToken === null) {
          isUnknown = true;
          break;
        }

        subTokens.push(foundSubToken);
        start = end;
      }

      if (isUnknown) {
        tokens.push(this.specialTokens.unk);
      } else {
        tokens.push(...subTokens);
      }
    }

    return tokens;
  }

  /**
   * Unigram tokenization
   * Simplified version of the algorithm used in SentencePiece/T5
   */
  private tokenizeUnigram(text: string): string[] {
    const words = this.normalizeText(text).split(/\s+/).filter(w => w.length > 0);
    const tokens: string[] = [];

    for (const word of words) {
      // Use dynamic programming to find best segmentation
      const n = word.length;
      const dp: number[] = new Array(n + 1).fill(-Infinity);
      const backtrack: number[] = new Array(n + 1).fill(-1);
      dp[0] = 0;

      for (let i = 0; i < n; i++) {
        if (dp[i] === -Infinity) continue;

        for (let j = i + 1; j <= n; j++) {
          const substr = word.substring(i, j);
          if (this.vocabulary.has(substr)) {
            // Simple scoring: prefer longer subwords
            const score = dp[i] + Math.log(j - i);
            if (score > dp[j]) {
              dp[j] = score;
              backtrack[j] = i;
            }
          }
        }
      }

      // Reconstruct tokens
      if (dp[n] === -Infinity) {
        tokens.push(this.specialTokens.unk);
      } else {
        const wordTokens: string[] = [];
        let pos = n;
        while (pos > 0) {
          const start = backtrack[pos];
          wordTokens.unshift(word.substring(start, pos));
          pos = start;
        }
        tokens.push(...wordTokens);
      }
    }

    return tokens;
  }

  /**
   * Simple whitespace tokenization (fallback)
   */
  private tokenizeSimple(text: string): string[] {
    return this.normalizeText(text).split(/\s+/).filter(t => t.length > 0);
  }

  /**
   * Normalize text for tokenization
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Get adjacent pairs from token sequence
   */
  private getPairs(tokens: string[]): [string, string][] {
    const pairs: [string, string][] = [];
    for (let i = 0; i < tokens.length - 1; i++) {
      pairs.push([tokens[i], tokens[i + 1]]);
    }
    return pairs;
  }

  /**
   * Merge a pair in token sequence
   */
  private mergePair(tokens: string[], pair: [string, string]): string[] {
    const result: string[] = [];
    let i = 0;

    while (i < tokens.length) {
      if (i < tokens.length - 1 && tokens[i] === pair[0] && tokens[i + 1] === pair[1]) {
        result.push(tokens[i] + tokens[i + 1]);
        i += 2;
      } else {
        result.push(tokens[i]);
        i++;
      }
    }

    return result;
  }

  /**
   * Reconstruct text from WordPiece tokens
   */
  private reconstructWordPiece(tokens: string[]): string {
    let result = '';
    for (const token of tokens) {
      if (token.startsWith(this.wordpiecePrefix)) {
        result += token.substring(this.wordpiecePrefix.length);
      } else {
        if (result.length > 0) result += ' ';
        result += token;
      }
    }
    return result;
  }

  /**
   * Train BPE merges from corpus
   */
  trainBPE(corpus: string[], numMerges: number = 10000): void {
    console.log(`[EnhancedLLMTokenizer] Training BPE with ${numMerges} merges...`);
    
    // Initialize vocabulary with characters
    const vocab: Map<string, number> = new Map();
    
    for (const text of corpus) {
      const words = this.normalizeText(text).split(/\s+/);
      for (const word of words) {
        const wordWithEnd = word.split('').join(' ') + ' </w>';
        vocab.set(wordWithEnd, (vocab.get(wordWithEnd) || 0) + 1);
      }
    }

    // Iteratively find and apply best merges
    for (let i = 0; i < numMerges; i++) {
      const pairFreqs: Map<string, number> = new Map();

      // Count pair frequencies
      for (const [word, freq] of vocab.entries()) {
        const symbols = word.split(' ');
        for (let j = 0; j < symbols.length - 1; j++) {
          const pair = `${symbols[j]} ${symbols[j + 1]}`;
          pairFreqs.set(pair, (pairFreqs.get(pair) || 0) + freq);
        }
      }

      if (pairFreqs.size === 0) break;

      // Find most frequent pair
      let bestPair = '';
      let bestFreq = 0;
      for (const [pair, freq] of pairFreqs.entries()) {
        if (freq > bestFreq) {
          bestFreq = freq;
          bestPair = pair;
        }
      }

      if (bestFreq < this.config.minFrequency!) break;

      // Record merge
      this.bpeMerges.set(bestPair, i);

      // Apply merge to vocabulary
      const [first, second] = bestPair.split(' ');
      const newVocab: Map<string, number> = new Map();
      
      for (const [word, freq] of vocab.entries()) {
        const newWord = word.replace(new RegExp(`${first} ${second}`, 'g'), first + second);
        newVocab.set(newWord, freq);
      }
      
      vocab.clear();
      for (const [word, freq] of newVocab.entries()) {
        vocab.set(word, freq);
      }
    }

    console.log(`[EnhancedLLMTokenizer] Trained ${this.bpeMerges.size} BPE merges`);
  }

  /**
   * Get vocabulary size
   */
  getVocabSize(): number {
    return this.vocabulary.size;
  }

  /**
   * Get tokenizer configuration
   */
  getConfig(): TokenizerConfig {
    return { ...this.config };
  }

  /**
   * Save tokenizer state
   */
  saveState(): any {
    return {
      config: this.config,
      bpeMerges: Array.from(this.bpeMerges.entries()),
      vocabularySize: this.vocabulary.size,
    };
  }

  /**
   * Load tokenizer state
   */
  loadState(state: any): void {
    if (state.config) {
      this.config = state.config;
    }
    if (state.bpeMerges) {
      this.bpeMerges = new Map(state.bpeMerges);
    }
    console.log(`[EnhancedLLMTokenizer] Loaded tokenizer state with ${this.bpeMerges.size} BPE merges`);
  }
}

export default EnhancedLLMTokenizer;
