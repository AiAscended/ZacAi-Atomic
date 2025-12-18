/**
 * File: src/ai/inference/modelSharder.ts
 * Purpose: Model sharding for distributed inference across multiple compute units
 * Depends on: None (atomic utility)
 * Depended on by: src/ai/orchestration/inferenceEngine.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Shard configuration for model distribution
 */
export interface ShardConfig {
  numShards: number;
  shardStrategy: "layer" | "tensor" | "pipeline" | "data";
  balanceLoad: boolean;
}

/**
 * Shard metadata for tracking distributed model parts
 */
export interface ShardMetadata {
  shardId: number;
  totalShards: number;
  layerRange?: [number, number];
  tensorIndices?: number[];
  dataRange?: [number, number];
}

/**
 * Sharded model representation
 */
export interface ShardedModel<T> {
  shards: T[][];
  metadata: ShardMetadata[];
  config: ShardConfig;
}

/**
 * Shard an array into multiple parts for distributed processing
 * @param arr - Array to shard
 * @param parts - Number of parts to split into
 * @returns Array of sharded arrays
 */
export function shardArray<T>(arr: T[], parts = 2): T[][] {
  const out: T[][] = Array.from({ length: parts }, () => []);
  for (let i = 0; i < arr.length; i++) out[i % parts].push(arr[i]);
  return out;
}

/**
 * Shard model layers for pipeline parallelism
 * @param layers - Array of model layers
 * @param config - Sharding configuration
 * @returns Sharded model with metadata
 */
export function shardModelLayers<T>(
  layers: T[],
  config: ShardConfig,
): ShardedModel<T> {
  const { numShards } = config;
  // TODO: Implement balanceLoad feature for uneven load distribution
  // const balanceLoad = config.balanceLoad;
  const layersPerShard = Math.ceil(layers.length / numShards);

  const shards: T[][] = [];
  const metadata: ShardMetadata[] = [];

  for (let i = 0; i < numShards; i++) {
    const start = i * layersPerShard;
    const end = Math.min(start + layersPerShard, layers.length);

    if (start < layers.length) {
      shards.push(layers.slice(start, end));
      metadata.push({
        shardId: i,
        totalShards: numShards,
        layerRange: [start, end - 1],
      });
    }
  }

  return { shards, metadata, config };
}

/**
 * Shard model tensors for tensor parallelism
 * @param tensors - Array of model tensors (represented as number arrays)
 * @param config - Sharding configuration
 * @returns Sharded model with metadata
 */
export function shardModelTensors(
  tensors: number[][],
  config: ShardConfig,
): ShardedModel<number[]> {
  const { numShards } = config;
  const shards: number[][][] = Array.from({ length: numShards }, () => []);
  const metadata: ShardMetadata[] = [];

  // Distribute tensors across shards
  tensors.forEach((tensor, idx) => {
    const shardId = idx % numShards;
    shards[shardId].push(tensor);
  });

  // Create metadata for each shard
  for (let i = 0; i < numShards; i++) {
    const tensorIndices = tensors
      .map((_, idx) => idx)
      .filter((idx) => idx % numShards === i);

    metadata.push({
      shardId: i,
      totalShards: numShards,
      tensorIndices,
    });
  }

  return { shards, metadata, config };
}

/**
 * Shard data batches for data parallelism
 * @param data - Input data array
 * @param config - Sharding configuration
 * @returns Sharded data with metadata
 */
export function shardDataBatch<T>(
  data: T[],
  config: ShardConfig,
): ShardedModel<T> {
  const { numShards, balanceLoad } = config;

  if (balanceLoad) {
    // Round-robin distribution for balanced load
    return {
      shards: shardArray(data, numShards),
      metadata: Array.from({ length: numShards }, (_, i) => ({
        shardId: i,
        totalShards: numShards,
      })),
      config,
    };
  } else {
    // Contiguous chunks
    const chunkSize = Math.ceil(data.length / numShards);
    const shards: T[][] = [];
    const metadata: ShardMetadata[] = [];

    for (let i = 0; i < numShards; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, data.length);

      if (start < data.length) {
        shards.push(data.slice(start, end));
        metadata.push({
          shardId: i,
          totalShards: numShards,
          dataRange: [start, end - 1],
        });
      }
    }

    return { shards, metadata, config };
  }
}

/**
 * Merge sharded results back together
 * @param shardedResults - Array of results from each shard
 * @param metadata - Shard metadata for proper ordering
 * @returns Merged result array
 */
export function mergeShardedResults<T>(
  shardedResults: T[][],
  metadata: ShardMetadata[],
): T[] {
  const merged: T[] = [];

  // Sort by shard ID to maintain order
  const sortedResults = shardedResults
    .map((result, idx) => ({ result, metadata: metadata[idx] }))
    .sort((a, b) => a.metadata.shardId - b.metadata.shardId);

  // Flatten results
  sortedResults.forEach(({ result }) => {
    merged.push(...result);
  });

  return merged;
}

/**
 * Calculate optimal number of shards based on model size and available resources
 * @param modelSize - Size of model in parameters
 * @param availableMemory - Available memory in bytes
 * @param targetMemoryPerShard - Target memory per shard in bytes
 * @returns Optimal number of shards
 */
export function calculateOptimalShards(
  modelSize: number,
  availableMemory: number,
  targetMemoryPerShard: number = 1024 * 1024 * 1024, // 1GB default
): number {
  const bytesPerParam = 4; // Float32
  const modelMemory = modelSize * bytesPerParam;

  // Calculate minimum shards needed
  const minShards = Math.ceil(modelMemory / availableMemory);

  // Calculate optimal shards for target memory
  const optimalShards = Math.ceil(modelMemory / targetMemoryPerShard);

  return Math.max(minShards, optimalShards);
}
