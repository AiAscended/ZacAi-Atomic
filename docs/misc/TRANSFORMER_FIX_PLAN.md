# LLM Transformer Dimension Fix Plan

## Problem Statement

The LLM transformer in `llm-transformerBlocks.ts` currently has a dimension mismatch workaround that returns the input matrix when matrix multiplication dimensions don't align. This prevents the transformer from functioning correctly.

### Current Issue

```typescript
// In matmul method:
if (colsA !== rowsB) {
  console.error(`[LLMTransformerBlock] matmul dimension mismatch: A is ${rowsA}x${colsA}, B is ${rowsB}x${colsB}`);
  // Return identity-like result to prevent crash
  return A;  // ⚠️ WORKAROUND - NOT CORRECT
}
```

## Root Cause Analysis

The dimension mismatch occurs in the attention mechanism when projecting Q, K, V:

```typescript
// Current implementation:
const Q = this.matmul(queries, this.transpose(this.Wq[h])); // [seqLen, headDim]
const K = this.matmul(keys, this.transpose(this.Wk[h]));    // [seqLen, headDim]
const V = this.matmul(values, this.transpose(this.Wv[h]));  // [seqLen, headDim]
```

### The Problem

1. **Weight Initialization:**
   - Weights are initialized with shape `[outDim, inDim]` (correctly for transpose)
   - But the matmul expects `[inDim, outDim]` after transpose

2. **Dimension Flow:**
   ```
   Input: [seqLen, embeddingDim]
   Wq[h]: [headDim, embeddingDim]  (initialized)
   transpose(Wq[h]): [embeddingDim, headDim]
   
   matmul: [seqLen, embeddingDim] × [embeddingDim, headDim]
           ✅ Should work!
   ```

3. **Actual Issue:**
   - The transpose function might not be handling the dimensions correctly
   - OR the weight initialization is creating the wrong shape

## Solution Approach

### Option 1: Fix Weight Initialization (Recommended)

Change the weight initialization to match expected dimensions:

```typescript
private initializeAttentionWeights(numHeads: number, inDim: number, outDim: number): number[][][] {
  const weights: number[][][] = [];
  for (let h = 0; h < numHeads; h++) {
    // Initialize as [inDim, outDim] so after transpose we get [outDim, inDim]
    // But for Q,K,V we want: input[seqLen, embeddingDim] × W[embeddingDim, headDim]
    // So W should be [embeddingDim, headDim] directly - NO TRANSPOSE NEEDED
    weights.push(this.initializeMatrix(inDim, outDim));
  }
  return weights;
}
```

### Option 2: Remove Transpose

If weights are initialized correctly, don't transpose:

```typescript
// Multi-head attention
for (let h = 0; h < numHeads; h++) {
  // Don't transpose - use weights directly
  const Q = this.matmul(queries, this.Wq[h]); // [seqLen, embeddingDim] × [embeddingDim, headDim]
  const K = this.matmul(keys, this.Wk[h]);
  const V = this.matmul(values, this.Wv[h]);
  // ...
}
```

### Option 3: Fix Both Initialization and Usage (Most Robust)

```typescript
// Initialize weights in the correct orientation
private initializeAttentionWeights(numHeads: number, inDim: number, outDim: number): number[][][] {
  const weights: number[][][] = [];
  for (let h = 0; h < numHeads; h++) {
    // Create weight matrix for: [batchSize, inDim] × [inDim, outDim] = [batchSize, outDim]
    // So shape should be [inDim, outDim]
    weights.push(this.initializeMatrix(inDim, outDim));
  }
  return weights;
}

// In constructor:
this.Wq = this.initializeAttentionWeights(numHeads, embeddingDim, this.headDim);
this.Wk = this.initializeAttentionWeights(numHeads, embeddingDim, this.headDim);
this.Wv = this.initializeAttentionWeights(numHeads, embeddingDim, this.headDim);

// In multiHeadAttention - use weights directly without transpose:
for (let h = 0; h < numHeads; h++) {
  const Q = this.matmul(queries, this.Wq[h]);  // [seqLen, embeddingDim] × [embeddingDim, headDim]
  const K = this.matmul(keys, this.Wk[h]);
  const V = this.matmul(values, this.Wv[h]);
  // ...
}
```

## Implementation Plan

### Step 1: Add Dimension Validation

Add validation in the constructor to catch dimension issues early:

```typescript
constructor(config: TransformerBlockConfig) {
  this.config = config;
  
  // Validate configuration
  if (config.embeddingDim % config.numHeads !== 0) {
    throw new Error(`embeddingDim (${config.embeddingDim}) must be divisible by numHeads (${config.numHeads})`);
  }
  
  this.headDim = Math.floor(config.embeddingDim / config.numHeads);
  console.log(`[LLMTransformerBlock] Initialized: embeddingDim=${config.embeddingDim}, numHeads=${config.numHeads}, headDim=${this.headDim}`);
  
  this.initializeWeights();
}
```

### Step 2: Fix Weight Initialization

```typescript
private initializeWeights(): void {
  const { embeddingDim, numHeads, hiddenDim } = this.config;
  
  // Initialize Q, K, V projection matrices for each head
  // Shape: [embeddingDim, headDim] for direct multiplication (no transpose needed)
  this.Wq = [];
  this.Wk = [];
  this.Wv = [];
  
  for (let h = 0; h < numHeads; h++) {
    this.Wq.push(this.initializeMatrix(embeddingDim, this.headDim));
    this.Wk.push(this.initializeMatrix(embeddingDim, this.headDim));
    this.Wv.push(this.initializeMatrix(embeddingDim, this.headDim));
  }
  
  // Initialize output projection - concatenated heads back to embeddingDim
  this.Wo = this.initializeMatrix(embeddingDim, embeddingDim);
  
  // Rest remains the same...
}
```

### Step 3: Remove Transpose in Attention

```typescript
private multiHeadAttention(
  queries: number[][],
  keys: number[][],
  values: number[][],
  mask?: boolean[][]
): number[][] {
  const seqLen = queries.length;
  const { numHeads } = this.config;
  const headOutputs: number[][][] = [];
  
  // Process each attention head independently
  for (let h = 0; h < numHeads; h++) {
    // Project Q, K, V for this head (NO TRANSPOSE)
    const Q = this.matmul(queries, this.Wq[h]); // [seqLen, embeddingDim] × [embeddingDim, headDim]
    const K = this.matmul(keys, this.Wk[h]);
    const V = this.matmul(values, this.Wv[h]);
    
    // Compute attention scores: QK^T / sqrt(d_k)
    const KT = this.transpose(K); // [headDim, seqLen]
    const scores = this.matmul(Q, KT); // [seqLen, headDim] × [headDim, seqLen] = [seqLen, seqLen]
    
    // Rest remains the same...
  }
  
  // Concatenate and project
  const concatenated: number[][] = [];
  for (let i = 0; i < seqLen; i++) {
    const row: number[] = [];
    for (let h = 0; h < numHeads; h++) {
      row.push(...headOutputs[h][i]);
    }
    concatenated.push(row);
  }
  
  // Project through Wo (NO TRANSPOSE)
  const output = this.matmul(concatenated, this.Wo); // [seqLen, embeddingDim] × [embeddingDim, embeddingDim]
  
  return output;
}
```

### Step 4: Update Feed-Forward Network

The FFN also needs weight dimension fixes:

```typescript
private feedForward(input: number[][]): number[][] {
  const seqLen = input.length;
  
  // Ensure weights are [inDim, outDim] for direct multiplication
  // W1: [embeddingDim, hiddenDim]
  // W2: [hiddenDim, embeddingDim]
  
  // First layer
  const hidden: number[][] = [];
  for (let i = 0; i < seqLen; i++) {
    const vec: number[] = [];
    for (let j = 0; j < this.config.hiddenDim; j++) {
      let sum = this.b1[j];
      for (let k = 0; k < this.config.embeddingDim; k++) {
        sum += input[i][k] * this.W1[k][j];
      }
      vec.push(this.gelu(sum));
    }
    hidden.push(vec);
  }
  
  // Second layer
  const output: number[][] = [];
  for (let i = 0; i < seqLen; i++) {
    const vec: number[] = [];
    for (let j = 0; j < this.config.embeddingDim; j++) {
      let sum = this.b2[j];
      for (let k = 0; k < this.config.hiddenDim; k++) {
        sum += hidden[i][k] * this.W2[k][j];
      }
      vec.push(sum);
    }
    output.push(vec);
  }
  
  return output;
}
```

### Step 5: Add Unit Tests

Create tests to verify dimensions:

```typescript
// test file: llm-transformerBlocks.test.ts
describe('LLMTransformerBlock', () => {
  it('should handle correct dimensions', () => {
    const config = {
      embeddingDim: 512,
      numHeads: 8,
      hiddenDim: 2048,
      dropoutRate: 0.1,
    };
    
    const block = new LLMTransformerBlock(config);
    
    // Test with sample input
    const seqLen = 10;
    const input: number[][] = [];
    for (let i = 0; i < seqLen; i++) {
      const row: number[] = [];
      for (let j = 0; j < config.embeddingDim; j++) {
        row.push(Math.random());
      }
      input.push(row);
    }
    
    const output = block.forward(input);
    
    expect(output.length).toBe(seqLen);
    expect(output[0].length).toBe(config.embeddingDim);
  });
});
```

## Testing Strategy

1. **Unit Tests:**
   - Test individual matrix operations
   - Test weight initialization dimensions
   - Test attention mechanism with various sequence lengths
   - Test feed-forward network

2. **Integration Tests:**
   - Test full forward pass
   - Test with different configurations
   - Test with edge cases (seqLen=1, very long sequences)

3. **Dimension Validation:**
   - Add assertions to verify dimensions at each step
   - Log dimensions in debug mode
   - Add dimension checking in matmul (keep error but throw instead of returning A)

## Rollout Plan

1. ✅ Document the issue (this file)
2. Create feature branch for transformer fix
3. Implement dimension fixes
4. Add comprehensive tests
5. Verify all tests pass
6. Update documentation
7. Merge to main
8. Update system status from "disabled" to "active"

## Success Criteria

- [ ] All matrix multiplications have correct dimensions
- [ ] No dimension mismatch errors in logs
- [ ] Forward pass completes successfully
- [ ] Output dimensions match input dimensions
- [ ] All unit tests pass
- [ ] Integration tests pass with various configurations
- [ ] Performance benchmarks within acceptable range

## Notes

- The current workaround prevents crashes but doesn't produce correct transformer outputs
- This fix is critical for the LLM to function properly
- Once fixed, the system status in metrics should change from "disabled" to "active"
- Consider adding dimension logging in debug mode for future troubleshooting

---

**Status:** 📋 Planning Complete  
**Priority:** 🔴 Critical  
**Estimated Effort:** 4-6 hours  
**Dependencies:** None  
**Next Step:** Implement fixes in feature branch
