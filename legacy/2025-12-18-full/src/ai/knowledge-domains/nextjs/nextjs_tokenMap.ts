/**
 * File: src/ai/data/nextjs/nextjs_tokenMap.ts
 * Purpose: Bidirectional mapping between tokens and IDs for Next.js domain
 * Depends on: nextjs_tokens.ts
 * Depended on by: nextjs_tokenizer.ts, nextjs_embeddings.ts
 * Creator: Vercel v0 Coding Assistant
 */

import {
  ALL_NEXTJS_TOKENS,
  NEXTJS_SPECIAL_TOKENS,
  type NextjsToken,
} from "./nextjs_tokens";

export class NextjsTokenMap {
  private tokenToId: Map<string, number>;
  private idToToken: Map<number, NextjsToken>;

  constructor() {
    this.tokenToId = new Map();
    this.idToToken = new Map();

    this.tokenToId.set("<PAD>", NEXTJS_SPECIAL_TOKENS.PAD);
    this.tokenToId.set("<UNK>", NEXTJS_SPECIAL_TOKENS.UNK);
    this.tokenToId.set("<BOS>", NEXTJS_SPECIAL_TOKENS.BOS);
    this.tokenToId.set("<EOS>", NEXTJS_SPECIAL_TOKENS.EOS);

    for (const token of ALL_NEXTJS_TOKENS) {
      this.tokenToId.set(token.text.toLowerCase(), token.id);
      this.idToToken.set(token.id, token);
    }
  }

  public getTokenId(text: string): number {
    return this.tokenToId.get(text.toLowerCase()) ?? NEXTJS_SPECIAL_TOKENS.UNK;
  }

  public getToken(id: number): NextjsToken | null {
    return this.idToToken.get(id) || null;
  }

  public hasToken(text: string): boolean {
    return this.tokenToId.has(text.toLowerCase());
  }

  public getVocabularySize(): number {
    return this.tokenToId.size;
  }

  public getAllTokens(): NextjsToken[] {
    return Array.from(this.idToToken.values());
  }
}

export const nextjsTokenMap = new NextjsTokenMap();
