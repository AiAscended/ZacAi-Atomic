/**/**

 * Unified Transformer LLM - Utility Functions * LLM Utilities

 * Helper functions for tensor operations and model utilities * Helper functions for tensor operations and common tasks

 */ */



/**/**

 * Matrix multiplication * Matrix multiplication

 */ */

export function matmul(a: Float32Array, b: Float32Array, m: number, n: number, p: number): Float32Array {export function matMul(a: number[][], b: number[][]): number[][] {

  const result = new Float32Array(m * p);  const result: number[][] = [];

    for (let i = 0; i < a.length; i++) {

  for (let i = 0; i < m; i++) {    const row: number[] = [];

    for (let j = 0; j < p; j++) {    for (let j = 0; j < b[0].length; j++) {

      let sum = 0;      let sum = 0;

      for (let k = 0; k < n; k++) {      for (let k = 0; k < a[0].length; k++) {

        sum += a[i * n + k] * b[k * p + j];        sum += a[i][k] * b[k][j];

      }      }

      result[i * p + j] = sum;      row.push(sum);

    }    }

  }    result.push(row);

    }

  return result;  return result;

}}



/**/**

 * Element-wise addition * Add two matrices element-wise

 */ */

export function add(a: Float32Array, b: Float32Array): Float32Array {export function add(a: number[][], b: number[][]): number[][] {

  if (a.length !== b.length) {  return a.map((row, i) => row.map((val, j) => val + b[i][j]));

    throw new Error('Arrays must have same length');}

  }

  /**

  return a.map((val, idx) => val + b[idx]); * Transpose a matrix

} */

export function transpose(matrix: number[][]): number[][] {

/**  return matrix[0].map((_, i) => matrix.map(row => row[i]));

 * Element-wise multiplication}

 */

export function multiply(a: Float32Array, b: Float32Array): Float32Array {/**

  if (a.length !== b.length) { * Apply dropout to a matrix

    throw new Error('Arrays must have same length'); */

  }export function dropout(matrix: number[][], rate: number): number[][] {

    return matrix.map(row => row.map(val => Math.random() > rate ? val / (1 - rate) : 0));

  return a.map((val, idx) => val * b[idx]);}

}

/**

/** * Calculate cosine similarity between two vectors

 * Scalar multiplication */

 */export function cosineSimilarity(a: number[], b: number[]): number {

export function scale(arr: Float32Array, scalar: number): Float32Array {  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);

  return arr.map(val => val * scalar);  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));

}  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  return dotProduct / (magnitudeA * magnitudeB);

/**}

 * ReLU activation

 *//**

export function relu(arr: Float32Array): Float32Array { * Normalize a vector

  return arr.map(val => Math.max(0, val)); */

}export function normalize(vector: number[]): number[] {

  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));

/**  return vector.map(val => val / magnitude);

 * GELU activation (approximate)}

 */

export function gelu(arr: Float32Array): Float32Array {/**

  return arr.map(x => { * Clip values to a range

    return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3)))); */

  });export function clip(value: number, min: number, max: number): number {

}  return Math.max(min, Math.min(max, value));

}

/**

 * Dropout (training mode)export default {

 */  matMul,

export function dropout(arr: Float32Array, rate: number): Float32Array {  add,

  if (rate === 0) return arr;  transpose,

    dropout,

  const mask = new Float32Array(arr.length);  cosineSimilarity,

  for (let i = 0; i < arr.length; i++) {  normalize,

    mask[i] = Math.random() > rate ? 1 / (1 - rate) : 0;  clip,

  }};

  
  return multiply(arr, mask);
}

/**
 * Compute mean
 */
export function mean(arr: Float32Array): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Compute variance
 */
export function variance(arr: Float32Array): number {
  const m = mean(arr);
  return arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / arr.length;
}

export default {
  matmul,
  add,
  multiply,
  scale,
  relu,
  gelu,
  dropout,
  mean,
  variance,
};
