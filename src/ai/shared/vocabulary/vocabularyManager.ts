/**
 * File: src/ai/shared/vocabulary/vocabularyManager.ts
 * Purpose: Central vocabulary management for all AI models
 * Loads and manages the shared base vocabulary plus domain-specific extensions
 */

import baseVocabulary from './base-vocabulary.json'

export interface VocabularyMetadata {
  version: string
  description: string
  tokenCount: number
  updated: string
}

const VOCAB_CATEGORY_KEYS = [
  'special_tokens',
  'system_tokens',
  'common_words',
  'ai_domain_terms',
  'programming_terms',
  'mathematics_terms'
] as const

type VocabularyCategoryKey = (typeof VOCAB_CATEGORY_KEYS)[number]
type TokenCategoryMap = Record<string, number>
type BaseVocabularyFile = { metadata: VocabularyMetadata } & Record<VocabularyCategoryKey, TokenCategoryMap>

const baseVocabularyData: BaseVocabularyFile = baseVocabulary

export class VocabularyManager {
  private vocabulary: Map<string, number> = new Map()
  private reverseVocabulary: Map<number, string> = new Map()
  private maxTokenId: number = 0
  private metadata: VocabularyMetadata
  
  constructor() {
    this.metadata = baseVocabularyData.metadata
    this.loadBaseVocabulary()
  }
  
  /**
   * Load base vocabulary from JSON
   */
  private loadBaseVocabulary(): void {
    const vocab = baseVocabulary as Record<string, unknown>;
    
    // Load all token categories
    const categories = [
      'special_tokens',
      'system_tokens',
      'common_words',
      'ai_domain_terms',
      'programming_terms',
      'mathematics_terms'
    ]
    
    for (const category of categories) {
      if (vocab[category]) {
        for (const [token, id] of Object.entries(vocab[category])) {
          this.vocabulary.set(token.toLowerCase(), id as number)
          this.reverseVocabulary.set(id as number, token.toLowerCase())
        }
      }
    }
    
    console.log(`[VocabularyManager] Loaded ${this.vocabulary.size} base tokens`)
  }
  
  /**
   * Extend vocabulary with domain-specific terms
   */
  public extendVocabulary(domainName: string, tokens: Record<string, number>): void {
    let added = 0
    for (const [token, id] of Object.entries(tokens)) {
      if (!this.vocabulary.has(token.toLowerCase())) {
        this.registerToken(token, id)
        added++
      }
    }
    console.log(`[VocabularyManager] Extended with ${added} tokens from ${domainName} domain`)
  }
  
  /**
   * Get token ID for a word
   */
  public getTokenId(token: string): number {
    return this.vocabulary.get(token.toLowerCase()) ?? this.vocabulary.get('<UNK>') ?? 3
  }
  
  /**
   * Get word for a token ID
   */
  public getToken(id: number): string {
    return this.reverseVocabulary.get(id) ?? '<UNK>'
  }
  
  /**
   * Get vocabulary map for direct use
   */
  public getVocabulary(): Map<string, number> {
    return new Map(this.vocabulary)
  }
  
  /**
   * Get reverse vocabulary map
   */
  public getReverseVocabulary(): Map<number, string> {
    return new Map(this.reverseVocabulary)
  }
  
  /**
   * Get vocabulary size
   */
  public getVocabSize(): number {
    return this.vocabulary.size
  }

  public getEffectiveVocabSize(): number {
    return this.maxTokenId + 1
  }
  
  /**
   * Get metadata
   */
  public getMetadata(): VocabularyMetadata {
    return { ...this.metadata }
  }
  
  /**
   * Check if token exists
   */
  public hasToken(token: string): boolean {
    return this.vocabulary.has(token.toLowerCase())
  }
  
  /**
   * Get special token IDs
   */
  public getSpecialTokens(): { pad: number; bos: number; eos: number; unk: number; mask: number } {
    return {
      pad: this.getTokenId('<PAD>'),
      bos: this.getTokenId('<BOS>'),
      eos: this.getTokenId('<EOS>'),
      unk: this.getTokenId('<UNK>'),
      mask: this.getTokenId('<MASK>')
    }
  }

  private registerToken(token: string, id: number): void {
    const normalized = token.toLowerCase()
    this.vocabulary.set(normalized, id)
    this.reverseVocabulary.set(id, normalized)
    if (id > this.maxTokenId) {
      this.maxTokenId = id
    }
  }
}

// Singleton instance
export const vocabularyManager = new VocabularyManager()
