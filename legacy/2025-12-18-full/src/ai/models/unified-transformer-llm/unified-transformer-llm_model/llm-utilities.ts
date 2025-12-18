/**
 * Unified Transformer LLM - Utility Functions
 * Helper functions for tensor operations and model utilities
 */

/**
 * Matrix multiplication for 2D arrays
 */
export function matMul(a: number[][], b: number[][]): number[][] {
  const result: number[][] = [];
  for (let i = 0; i < a.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < b[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < a[0].length; k++) {
        sum += a[i][k] * b[k][j];
      }
      row.push(sum);
    }
    result.push(row);
  }
  return result;
}

/**
 * Add two matrices element-wise
 */
export function add(a: number[][], b: number[][]): number[][] {
  return a.map((row, i) => row.map((val, j) => val + b[i][j]));
}

/**
 * Transpose a matrix
 */
export function transpose(matrix: number[][]): number[][] {
  return matrix[0].map((_, i) => matrix.map((row) => row[i]));
}

/**
 * Apply dropout to a matrix
 */
export function dropout(matrix: number[][], rate: number): number[][] {
  return matrix.map((row) =>
    row.map((val) => (Math.random() > rate ? val / (1 - rate) : 0)),
  );
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Normalize a vector
 */
export function normalize(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map((val) => val / magnitude);
}

/**
 * Clip values to a range
 */
export function clip(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

const llmUtilities = {
  matMul,
  add,
  transpose,
  dropout,
  cosineSimilarity,
  normalize,
  clip,
};

export default llmUtilities;
