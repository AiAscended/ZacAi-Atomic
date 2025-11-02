/**
 * File: src/ai/data/react/react_embeddings.ts
 * Purpose: Generate and manage embeddings for React domain tokens
 * Depends on: react_tokenMap.ts, react_constants.ts
 * Depended on by: react_inferenceController.ts, react_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { reactTokenMap } from "./react_tokenMap"
import { REACT_DOMAIN } from "./react_constants"

const EMBEDDING_DIM = 128

export class ReactEmbeddings {
  private embeddings: Map<number, number[]>

  constructor() {
    this.embeddings = new Map()
    this.initializeEmbeddings()
  }

  private initializeEmbeddings(): void {
    const vocabSize = reactTokenMap.getVocabularySize()

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

    return JSON.stringify({ domain: REACT_DOMAIN, embeddings: embeddingsArray }, null, 2)
  }
}

export const reactEmbeddings = new ReactEmbeddings()
