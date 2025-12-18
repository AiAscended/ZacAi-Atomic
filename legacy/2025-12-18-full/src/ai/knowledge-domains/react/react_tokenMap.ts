/**
 * File: src/ai/data/react/react_tokenMap.ts
 * Purpose: Bidirectional mapping between tokens and IDs for React domain
 * Depends on: react_tokens.ts
 * Depended on by: react_tokenizer.ts, react_embeddings.ts
 * Creator: Vercel v0 Coding Assistant
 */

import {
  ALL_REACT_TOKENS,
  REACT_SPECIAL_TOKENS,
  type ReactToken,
} from "./react_tokens";

export class ReactTokenMap {
  private tokenToId: Map<string, number>;
  private idToToken: Map<number, ReactToken>;

  constructor() {
    this.tokenToId = new Map();
    this.idToToken = new Map();

    // Add special tokens
    this.tokenToId.set("<PAD>", REACT_SPECIAL_TOKENS.PAD);
    this.tokenToId.set("<UNK>", REACT_SPECIAL_TOKENS.UNK);
    this.tokenToId.set("<BOS>", REACT_SPECIAL_TOKENS.BOS);
    this.tokenToId.set("<EOS>", REACT_SPECIAL_TOKENS.EOS);

    // Add all React tokens
    for (const token of ALL_REACT_TOKENS) {
      this.tokenToId.set(token.text.toLowerCase(), token.id);
      this.idToToken.set(token.id, token);
    }
  }

  public getTokenId(text: string): number {
    return this.tokenToId.get(text.toLowerCase()) ?? REACT_SPECIAL_TOKENS.UNK;
  }

  public getToken(id: number): ReactToken | null {
    return this.idToToken.get(id) || null;
  }

  public hasToken(text: string): boolean {
    return this.tokenToId.has(text.toLowerCase());
  }

  public getVocabularySize(): number {
    return this.tokenToId.size;
  }

  public getAllTokens(): ReactToken[] {
    return Array.from(this.idToToken.values());
  }
}

export const reactTokenMap = new ReactTokenMap();
