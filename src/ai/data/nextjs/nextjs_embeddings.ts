/**
 * File: src/ai/data/nextjs/nextjs_embeddings.ts
 * Purpose: Generate and manage embeddings for Next.js domain tokens
 * Depends on: nextjs_tokenMap.ts, nextjs_constants.ts
 * Depended on by: nextjs_inferenceController.ts, nextjs_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { nextjsTokenMap } from "./nextjs_tokenMap"
import { NEXTJS_DOMAIN } from "./nextjs_constants"

const EMBEDDING_DIM = 128

export class NextjsEmbeddings {
  private embeddings: Map<number, number[]>

  constructor() {
    this.embeddings = new Map()
    this.initializeEmbeddings()
  }

  private initializeEmbeddings(): void {
    const vocabSize = nextjsTokenMap.getVocabularySize()

    for (let tokenId = 0; tokenId < vocabSize + 100; tokenId++) {
      const embedding = Array.from({ length: EMBEDDING_DIM }, () => (Math.random() - 0.5) * 0.1)
      this.embeddings.set(tokenId, embedding)
    }
  }

  public getEmbedding(tokenId: number): number[] {
    return this.embeddings.get(tokenId) || Array(EMBEDDING_DIM).fill(0)
  }

  public setEmbedding(tokenId: number, embedding: number[]): void {
    if (embedding.length !== EMBEDDING_DIM) {
      throw new Error(`Embedding dimension mismatch: expected ${EMBEDDING_DIM}, got ${embedding.length}`)
    }
    this.embeddings.set(tokenId, embedding)
  }

  public getDimension(): number {
    return EMBEDDING_DIM
  }

  public saveEmbeddings(): string {
    const embeddingsArray = Array.from(this.embeddings.entries()).map(([id, vec]) => ({
      tokenId: id,
      embedding: vec,
    }))

    return JSON.stringify({ domain: NEXTJS_DOMAIN, embeddings: embeddingsArray }, null, 2)
  }
}

export const nextjsEmbeddings = new NextjsEmbeddings()
