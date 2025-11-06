/**
 * File: src/ai/inference/weightsLoader.ts
 * Purpose: Loads and manages trained neural network weights from binary files
 *
 * Dependencies:
 * - src/ai/monitoring/logger.ts
 *
 * Depended on by:
 * - src/ai/orchestration/inferenceEngine.ts
 * - src/ai/data domain inference controllers
 */

import { logger } from "../monitoring/logger"

export interface WeightsData {
  embeddings: number[][] // Token embeddings matrix
  hiddenWeights: number[][] // Hidden layer weights
  outputWeights: number[][] // Output layer weights
  biases: number[] // Bias terms
  vocabulary: Map<string, number> // Token to ID mapping
}

/**
 * Load trained weights from a binary file
 * For now, generates synthetic weights until real training is implemented
 */
export async function loadWeights(domainName: string): Promise<WeightsData> {
  const weightsPath = `src/ai/knowledge-domains/${domainName}/${domainName}_weights/${domainName}_trainingWeights.bin`

  try {
    logger.debug("WeightsLoader", `Loading weights for ${domainName} from ${weightsPath}`)

    // TODO: Load actual binary weights file when training pipeline is complete
    // For now, generate synthetic weights for inference
    const vocabSize = 10000
    const embeddingDim = 128
    const hiddenDim = 256
    const outputDim = 1

    const embeddings: number[][] = []
    for (let i = 0; i < vocabSize; i++) {
      const embedding: number[] = []
      for (let j = 0; j < embeddingDim; j++) {
        // Initialize with small random values
        embedding.push((Math.random() - 0.5) * 0.1)
      }
      embeddings.push(embedding)
    }

    const hiddenWeights: number[][] = []
    for (let i = 0; i < embeddingDim; i++) {
      const row: number[] = []
      for (let j = 0; j < hiddenDim; j++) {
        row.push((Math.random() - 0.5) * 0.1)
      }
      hiddenWeights.push(row)
    }

    const outputWeights: number[][] = []
    for (let i = 0; i < hiddenDim; i++) {
      const row: number[] = []
      for (let j = 0; j < outputDim; j++) {
        row.push((Math.random() - 0.5) * 0.1)
      }
      outputWeights.push(row)
    }

    const biases: number[] = []
    for (let i = 0; i < hiddenDim; i++) {
      biases.push(0)
    }

    // Build vocabulary from common words
    const vocabulary = new Map<string, number>()
    const commonWords = [
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "from",
      "as",
      "is",
      "was",
      "are",
      "were",
      "be",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "can",
      "what",
      "when",
      "where",
      "who",
      "why",
      "how",
      "which",
      "this",
      "that",
      "these",
      "those",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "me",
      "him",
      "her",
      "us",
      "them",
      "my",
      "your",
      "his",
      "her",
      "its",
      "our",
      "their",
      "mine",
      "yours",
      "hers",
      "ours",
      "theirs",
      "not",
      "no",
      "yes",
      "all",
      "some",
      "any",
      "many",
      "much",
      "few",
      "more",
      "most",
      "other",
      "another",
      "such",
      "only",
      "own",
      "same",
      "so",
      "than",
      "too",
      "very",
      "just",
      "now",
      "then",
      "here",
      "there",
      "up",
      "down",
      "out",
      "over",
      "under",
      "again",
      "back",
    ]

    commonWords.forEach((word, idx) => {
      vocabulary.set(word, idx)
    })

    logger.info("WeightsLoader", `Loaded weights for ${domainName}`, {
      vocabSize,
      embeddingDim,
      hiddenDim,
      vocabularySize: vocabulary.size,
    })

    return {
      embeddings,
      hiddenWeights,
      outputWeights,
      biases,
      vocabulary,
    }
  } catch (error) {
    logger.error("WeightsLoader", `Failed to load weights for ${domainName}`, error)
    throw error
  }
}

/**
 * Load domain-specific weights in the format expected by the inference engine
 * Returns weights organized by transformer layers
 */
export async function loadDomainWeights(
  domainName: string,
): Promise<{ layers: number[][][]; biases: number[][] } | null> {
  try {
    // Load the full weights data
    const weightsData = await loadWeights(domainName)

    // Convert to inference engine format
    // Each layer has weights and biases
    const layers: number[][][] = []
    const biases: number[][] = []

    // Use hiddenWeights as the base for each layer
    // In a real system, this would load actual trained transformer layers
    const numLayers = 6 // Match defaultInferenceConfig.numLayers
    for (let i = 0; i < numLayers; i++) {
      layers.push(weightsData.hiddenWeights)
      biases.push(weightsData.biases)
    }

    logger.info("WeightsLoader", `Loaded domain weights for ${domainName}`, {
      numLayers: layers.length,
      layerSize: layers[0]?.length || 0,
    })

    return { layers, biases }
  } catch (error) {
    logger.error("WeightsLoader", `Failed to load domain weights for ${domainName}`, error)
    return null
  }
}

/**
 * Generate embeddings for tokens using loaded weights
 */
export function generateEmbeddings(tokens: string[], weights: WeightsData): number[][] {
  const embeddings: number[][] = []

  for (const token of tokens) {
    const tokenLower = token.toLowerCase()
    const tokenId = weights.vocabulary.get(tokenLower) || 0 // Use 0 for unknown tokens

    if (tokenId < weights.embeddings.length) {
      embeddings.push([...weights.embeddings[tokenId]])
    } else {
      // Unknown token - use zero embedding
      embeddings.push(new Array(weights.embeddings[0].length).fill(0))
    }
  }

  return embeddings
}

/**
 * Run forward pass through neural network
 */
export function forwardPass(
  embeddings: number[][],
  weights: WeightsData,
): { confidence: number; hiddenState: number[] } {
  // Average embeddings to get sequence representation
  const seqLength = embeddings.length
  const embeddingDim = embeddings[0]?.length || 0

  if (seqLength === 0 || embeddingDim === 0) {
    return { confidence: 0, hiddenState: [] }
  }

  const avgEmbedding: number[] = new Array(embeddingDim).fill(0)
  for (const embedding of embeddings) {
    for (let i = 0; i < embeddingDim; i++) {
      avgEmbedding[i] += embedding[i] / seqLength
    }
  }

  // Hidden layer: h = ReLU(W * x + b)
  const hiddenDim = weights.hiddenWeights[0]?.length || 0
  const hiddenState: number[] = new Array(hiddenDim).fill(0)

  for (let i = 0; i < hiddenDim; i++) {
    let sum = weights.biases[i] || 0
    for (let j = 0; j < embeddingDim; j++) {
      sum += avgEmbedding[j] * (weights.hiddenWeights[j]?.[i] || 0)
    }
    // ReLU activation
    hiddenState[i] = Math.max(0, sum)
  }

  // Output layer: y = sigmoid(W * h)
  let output = 0
  for (let i = 0; i < hiddenDim; i++) {
    output += hiddenState[i] * (weights.outputWeights[i]?.[0] || 0)
  }

  // Sigmoid activation for confidence score
  const confidence = 1 / (1 + Math.exp(-output))

  return { confidence, hiddenState }
}
