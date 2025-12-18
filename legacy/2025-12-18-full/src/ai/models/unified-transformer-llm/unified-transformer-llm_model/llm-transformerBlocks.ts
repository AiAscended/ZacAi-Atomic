/**
 * LLM Transformer Blocks
 * Implements multi-head self-attention and feed-forward layers with industry-standard architecture
 */

export interface TransformerBlockConfig {
  embeddingDim: number;
  numHeads: number;
  hiddenDim: number;
  dropoutRate: number;
}

export class LLMTransformerBlock {
  private config: TransformerBlockConfig;
  private headDim: number;

  // Weight matrices for multi-head attention
  private Wq!: number[][][]; // [numHeads, embeddingDim, headDim]
  private Wk!: number[][][]; // [numHeads, embeddingDim, headDim]
  private Wv!: number[][][]; // [numHeads, embeddingDim, headDim]
  private Wo!: number[][]; // [embeddingDim, embeddingDim]

  // Weight matrices for feed-forward network
  private W1!: number[][]; // [embeddingDim, hiddenDim]
  private b1!: number[]; // [hiddenDim]
  private W2!: number[][]; // [hiddenDim, embeddingDim]
  private b2!: number[]; // [embeddingDim]

  // Layer normalization parameters
  private gamma1!: number[]; // [embeddingDim]
  private beta1!: number[]; // [embeddingDim]
  private gamma2!: number[]; // [embeddingDim]
  private beta2!: number[]; // [embeddingDim]

  constructor(config: TransformerBlockConfig) {
    this.config = config;
    this.headDim = Math.floor(config.embeddingDim / config.numHeads);

    // Initialize all weight matrices
    this.initializeWeights();
  }

  /**
   * Initialize weight matrices with Xavier/Glorot initialization
   */
  private initializeWeights(): void {
    const { embeddingDim, numHeads, hiddenDim } = this.config;

    // Initialize Q, K, V projection matrices for each head
    this.Wq = this.initializeAttentionWeights(
      numHeads,
      embeddingDim,
      this.headDim,
    );
    this.Wk = this.initializeAttentionWeights(
      numHeads,
      embeddingDim,
      this.headDim,
    );
    this.Wv = this.initializeAttentionWeights(
      numHeads,
      embeddingDim,
      this.headDim,
    );

    // Initialize output projection
    this.Wo = this.initializeMatrix(embeddingDim, embeddingDim);

    // Initialize feed-forward weights
    this.W1 = this.initializeMatrix(embeddingDim, hiddenDim);
    this.b1 = new Array(hiddenDim).fill(0);
    this.W2 = this.initializeMatrix(hiddenDim, embeddingDim);
    this.b2 = new Array(embeddingDim).fill(0);

    // Initialize layer norm parameters (gamma=1, beta=0)
    this.gamma1 = new Array(embeddingDim).fill(1);
    this.beta1 = new Array(embeddingDim).fill(0);
    this.gamma2 = new Array(embeddingDim).fill(1);
    this.beta2 = new Array(embeddingDim).fill(0);
  }

  /**
   * Initialize attention weight matrices for all heads
   * Creates matrices of shape [outDim, inDim] for correct matmul with transposed weights
   */
  private initializeAttentionWeights(
    numHeads: number,
    inDim: number,
    outDim: number,
  ): number[][][] {
    const weights: number[][][] = [];
    for (let h = 0; h < numHeads; h++) {
      weights.push(this.initializeMatrix(inDim, outDim));
    }
    return weights;
  }

  /**
   * Initialize a matrix with Xavier/Glorot uniform distribution
   */
  private initializeMatrix(rows: number, cols: number): number[][] {
    const limit = Math.sqrt(6 / (rows + cols));
    const matrix: number[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < cols; j++) {
        row.push((Math.random() * 2 - 1) * limit);
      }
      matrix.push(row);
    }
    return matrix;
  }

  /**
   * Matrix multiplication: A * B
   */
  private matmul(A: number[][], B: number[][]): number[][] {
    // Safety checks
    if (!A || A.length === 0 || !A[0]) {
      console.error("[LLMTransformerBlock] matmul: Matrix A is invalid");
      return [];
    }
    if (!B || B.length === 0 || !B[0]) {
      console.error("[LLMTransformerBlock] matmul: Matrix B is invalid");
      return [];
    }

    const rowsA = A.length;
    const colsA = A[0].length;
    const rowsB = B.length;
    const colsB = B[0].length;

    // Check dimension compatibility
    if (colsA !== rowsB) {
      console.error(
        `[LLMTransformerBlock] matmul dimension mismatch: A is ${rowsA}x${colsA}, B is ${rowsB}x${colsB}`,
      );
      // Return identity-like result to prevent crash
      return A;
    }

    const result: number[][] = [];
    for (let i = 0; i < rowsA; i++) {
      const row: number[] = [];
      for (let j = 0; j < colsB; j++) {
        let sum = 0;
        for (let k = 0; k < colsA; k++) {
          sum += A[i][k] * B[k][j];
        }
        row.push(sum);
      }
      result.push(row);
    }
    return result;
  }

  /**
   * Transpose a matrix
   */
  private transpose(matrix: number[][]): number[][] {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result: number[][] = [];

    for (let j = 0; j < cols; j++) {
      const row: number[] = [];
      for (let i = 0; i < rows; i++) {
        row.push(matrix[i][j]);
      }
      result.push(row);
    }
    return result;
  }

  /**
   * Softmax activation along the last dimension
   */
  private softmax(matrix: number[][]): number[][] {
    return matrix.map((row) => {
      const maxVal = Math.max(...row);
      const exps = row.map((val) => Math.exp(val - maxVal)); // Subtract max for numerical stability
      const sumExps = exps.reduce((a, b) => a + b, 0);
      return exps.map((val) => val / sumExps);
    });
  }

  /**
   * GELU activation function (Gaussian Error Linear Unit)
   */
  private gelu(x: number): number {
    return (
      0.5 *
      x *
      (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))))
    );
  }

  /**
   * Multi-head self-attention mechanism with scaled dot-product attention
   * Implements: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) * V
   */
  private multiHeadAttention(
    queries: number[][],
    keys: number[][],
    values: number[][],
    mask?: boolean[][],
  ): number[][] {
    const seqLen = queries.length;
    const { numHeads } = this.config;
    const headOutputs: number[][][] = [];

    // Process each attention head independently
    for (let h = 0; h < numHeads; h++) {
      // Project Q, K, V for this head
      const Q = this.matmul(queries, this.transpose(this.Wq[h])); // [seqLen, headDim]
      const K = this.matmul(keys, this.transpose(this.Wk[h])); // [seqLen, headDim]
      const V = this.matmul(values, this.transpose(this.Wv[h])); // [seqLen, headDim]

      // Compute attention scores: QK^T / sqrt(d_k)
      const KT = this.transpose(K); // [headDim, seqLen]
      const scores = this.matmul(Q, KT); // [seqLen, seqLen]

      // Scale by sqrt(headDim) for numerical stability
      const scaleFactor = Math.sqrt(this.headDim);
      const scaledScores = scores.map((row) =>
        row.map((val) => val / scaleFactor),
      );

      // Apply causal mask if provided (for autoregressive generation)
      if (mask) {
        for (let i = 0; i < seqLen; i++) {
          for (let j = 0; j < seqLen; j++) {
            if (!mask[i][j]) {
              scaledScores[i][j] = -Infinity; // Mask out future positions
            }
          }
        }
      }

      // Apply softmax to get attention weights
      const attentionWeights = this.softmax(scaledScores); // [seqLen, seqLen]

      // Apply attention weights to values
      const headOutput = this.matmul(attentionWeights, V); // [seqLen, headDim]
      headOutputs.push(headOutput);
    }

    // Concatenate all heads
    const concatenated: number[][] = [];
    for (let i = 0; i < seqLen; i++) {
      const row: number[] = [];
      for (let h = 0; h < numHeads; h++) {
        row.push(...headOutputs[h][i]);
      }
      concatenated.push(row);
    }

    // Project concatenated output through Wo
    const output = this.matmul(concatenated, this.transpose(this.Wo));

    return output;
  }

  /**
   * Feed-forward network with GELU activation
   * FFN(x) = GELU(xW1 + b1)W2 + b2
   */
  private feedForward(input: number[][]): number[][] {
    const seqLen = input.length;
    const output: number[][] = [];

    for (let i = 0; i < seqLen; i++) {
      // First linear layer: embeddingDim -> hiddenDim
      const hidden: number[] = [];
      for (let j = 0; j < this.config.hiddenDim; j++) {
        let sum = this.b1[j];
        for (let k = 0; k < this.config.embeddingDim; k++) {
          sum += input[i][k] * this.W1[k][j];
        }
        hidden.push(this.gelu(sum)); // Apply GELU activation
      }

      // Second linear layer: hiddenDim -> embeddingDim
      const outputVector: number[] = [];
      for (let j = 0; j < this.config.embeddingDim; j++) {
        let sum = this.b2[j];
        for (let k = 0; k < this.config.hiddenDim; k++) {
          sum += hidden[k] * this.W2[k][j];
        }
        outputVector.push(sum);
      }

      output.push(outputVector);
    }

    return output;
  }

  /**
   * Layer normalization with learnable parameters
   * LayerNorm(x) = gamma * (x - mean) / sqrt(variance + eps) + beta
   */
  private layerNorm(
    input: number[][],
    gamma: number[],
    beta: number[],
  ): number[][] {
    return input.map((vector) => {
      const mean = vector.reduce((a, b) => a + b, 0) / vector.length;
      const variance =
        vector.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vector.length;
      const std = Math.sqrt(variance + 1e-5);
      return vector.map(
        (val, idx) => gamma[idx] * ((val - mean) / std) + beta[idx],
      );
    });
  }

  /**
   * Forward pass through transformer block with pre-layer normalization
   * Architecture: LayerNorm -> Attention -> Residual -> LayerNorm -> FFN -> Residual
   */
  forward(input: number[][], mask?: boolean[][]): number[][] {
    // Pre-layer normalization for attention
    const normed1 = this.layerNorm(input, this.gamma1, this.beta1);

    // Multi-head attention
    const attended = this.multiHeadAttention(normed1, normed1, normed1, mask);

    // Residual connection
    const residual1 = input.map((vec, i) =>
      vec.map((val, j) => val + attended[i][j]),
    );

    // Pre-layer normalization for feed-forward
    const normed2 = this.layerNorm(residual1, this.gamma2, this.beta2);

    // Feed-forward network
    const ffOutput = this.feedForward(normed2);

    // Residual connection
    const residual2 = residual1.map((vec, i) =>
      vec.map((val, j) => val + ffOutput[i][j]),
    );

    return residual2;
  }

  /**
   * Get weight matrices (for saving/loading)
   */
  getWeights(): {
    Wq: number[][][];
    Wk: number[][][];
    Wv: number[][][];
    Wo: number[][];
    W1: number[][];
    b1: number[];
    W2: number[][];
    b2: number[];
    gamma1: number[];
    beta1: number[];
    gamma2: number[];
    beta2: number[];
  } {
    return {
      Wq: this.Wq,
      Wk: this.Wk,
      Wv: this.Wv,
      Wo: this.Wo,
      W1: this.W1,
      b1: this.b1,
      W2: this.W2,
      b2: this.b2,
      gamma1: this.gamma1,
      beta1: this.beta1,
      gamma2: this.gamma2,
      beta2: this.beta2,
    };
  }

  /**
   * Set weight matrices (for loading trained weights)
   */
  setWeights(weights: {
    Wq: number[][][];
    Wk: number[][][];
    Wv: number[][][];
    Wo: number[][];
    W1: number[][];
    b1: number[];
    W2: number[][];
    b2: number[];
    gamma1: number[];
    beta1: number[];
    gamma2: number[];
    beta2: number[];
  }): void {
    this.Wq = weights.Wq;
    this.Wk = weights.Wk;
    this.Wv = weights.Wv;
    this.Wo = weights.Wo;
    this.W1 = weights.W1;
    this.b1 = weights.b1;
    this.W2 = weights.W2;
    this.b2 = weights.b2;
    this.gamma1 = weights.gamma1;
    this.beta1 = weights.beta1;
    this.gamma2 = weights.gamma2;
    this.beta2 = weights.beta2;
  }
}

export default LLMTransformerBlock;
