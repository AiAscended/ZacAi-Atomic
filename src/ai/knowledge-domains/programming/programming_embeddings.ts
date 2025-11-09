import { programmingTokenMap } from "./programming_tokenMap";

const EMBEDDING_DIM = 128;

export class ProgrammingEmbeddings {
  private embeddings: Map<number, number[]>;

  constructor() {
    this.embeddings = new Map();
    this.initializeEmbeddings();
  }

  private initializeEmbeddings(): void {
    const vocabSize = programmingTokenMap.getVocabularySize();
    for (let tokenId = 0; tokenId < vocabSize + 100; tokenId++) {
      const embedding = Array.from(
        { length: EMBEDDING_DIM },
        () => (Math.random() - 0.5) * 0.1,
      );
      this.embeddings.set(tokenId, embedding);
    }
  }

  public getEmbedding(tokenId: number): number[] {
    return this.embeddings.get(tokenId) || Array(EMBEDDING_DIM).fill(0);
  }

  public getDimension(): number {
    return EMBEDDING_DIM;
  }
}

export const programmingEmbeddings = new ProgrammingEmbeddings();
