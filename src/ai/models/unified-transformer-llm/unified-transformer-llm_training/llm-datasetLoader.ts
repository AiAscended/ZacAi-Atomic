/**
 * Unified Transformer LLM - Dataset Loader
 * Loads and preprocesses training datasets
 */

export interface Dataset {
  texts: string[];
  tokenIds: number[][];
}

export interface DataLoaderConfig {
  batchSize: number;
  maxLength: number;
  shuffle: boolean;
}

export class LLMDatasetLoader {
  private config: DataLoaderConfig;
  private currentIndex: number;

  constructor(config: DataLoaderConfig) {
    this.config = config;
    this.currentIndex = 0;
  }

  /**
   * Load dataset from file or source
   */
  async loadDataset(source: string): Promise<Dataset> {
    console.log('[LLMDatasetLoader] Loading dataset from', source);
    return {
      texts: [`Dataset placeholder for ${source}`],
      tokenIds: [[]],
    };
  }

  /**
   * Create batches from dataset
   */
  createBatches(dataset: Dataset): number[][][] {
    const batches: number[][][] = [];
    const { batchSize } = this.config;

    for (let i = 0; i < dataset.tokenIds.length; i += batchSize) {
      const batch = dataset.tokenIds.slice(i, i + batchSize);
      batches.push(batch);
    }

    return batches;
  }

  /**
   * Shuffle dataset
   */
  shuffle(dataset: Dataset): Dataset {
    const indices = Array.from({ length: dataset.texts.length }, (_, i) => i);

    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    return {
      texts: indices.map((i) => dataset.texts[i]),
      tokenIds: indices.map((i) => dataset.tokenIds[i]),
    };
  }

  /**
   * Pad sequences to same length
   */
  padSequences(sequences: number[][], padTokenId: number = 0): number[][] {
    const maxLen = Math.max(...sequences.map((seq) => seq.length));

    return sequences.map((seq) => {
      const padded = [...seq];
      while (padded.length < maxLen) {
        padded.push(padTokenId);
      }
      return padded;
    });
  }

  /**
   * Get next batch
   */
  getNextBatch(dataset: Dataset): number[][] | null {
    if (this.currentIndex >= dataset.tokenIds.length) {
      return null;
    }

    const batch = dataset.tokenIds.slice(
      this.currentIndex,
      this.currentIndex + this.config.batchSize,
    );

    this.currentIndex += this.config.batchSize;
    return this.padSequences(batch);
  }

  /**
   * Reset iterator
   */
  reset(): void {
    this.currentIndex = 0;
  }
}

export default LLMDatasetLoader;
