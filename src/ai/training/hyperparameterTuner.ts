/**
 * File: src/ai/training/hyperparameterTuner.ts
 * Purpose: Hyperparameter tuning with grid search and random search strategies
 * Depends on: None
 * Depended on by: src/ai/orchestration/aiOrchestrator.ts
 * Creator: Vercel v0 Coding Assistant
 */

export interface HyperparameterConfig {
  learningRate?: number[]
  batchSize?: number[]
  epochs?: number[]
  dropout?: number[]
  hiddenSize?: number[]
  numLayers?: number[]
  [key: string]: number[] | undefined
}

export interface TuningResult {
  params: Record<string, number>
  score: number
  metrics?: Record<string, number>
}

/**
 * Grid search over hyperparameter space
 * @param searchSpace - Object mapping parameter names to arrays of values to try
 * @param evalFn - Function that evaluates a parameter configuration and returns a score
 * @returns Array of results sorted by score (best first)
 */
export function gridSearch(
  searchSpace: HyperparameterConfig,
  evalFn: (params: Record<string, number>) => number,
): TuningResult[] {
  const keys = Object.keys(searchSpace).filter((k) => searchSpace[k] !== undefined)
  const results: TuningResult[] = []

  function recursiveSearch(idx: number, currentParams: Record<string, number>): void {
    if (idx === keys.length) {
      const score = evalFn(currentParams)
      results.push({ params: { ...currentParams }, score })
      return
    }

    const key = keys[idx]
    const values = searchSpace[key]
    if (!values) return

    for (const value of values) {
      currentParams[key] = value
      recursiveSearch(idx + 1, currentParams)
    }
  }

  recursiveSearch(0, {})
  results.sort((a, b) => b.score - a.score)
  return results
}

/**
 * Random search over hyperparameter space
 * @param searchSpace - Object mapping parameter names to arrays of values to try
 * @param evalFn - Function that evaluates a parameter configuration and returns a score
 * @param numTrials - Number of random configurations to try
 * @returns Array of results sorted by score (best first)
 */
export function randomSearch(
  searchSpace: HyperparameterConfig,
  evalFn: (params: Record<string, number>) => number,
  numTrials = 20,
): TuningResult[] {
  const keys = Object.keys(searchSpace).filter((k) => searchSpace[k] !== undefined)
  const results: TuningResult[] = []

  for (let i = 0; i < numTrials; i++) {
    const params: Record<string, number> = {}

    for (const key of keys) {
      const values = searchSpace[key]
      if (values && values.length > 0) {
        const randomIndex = Math.floor(Math.random() * values.length)
        params[key] = values[randomIndex]
      }
    }

    const score = evalFn(params)
    results.push({ params, score })
  }

  results.sort((a, b) => b.score - a.score)
  return results
}

/**
 * Get best hyperparameters from tuning results
 */
export function getBestParams(results: TuningResult[]): Record<string, number> {
  if (results.length === 0) {
    return {}
  }
  return results[0].params
}

/**
 * Default hyperparameter search space for common AI models
 */
export const defaultSearchSpace: HyperparameterConfig = {
  learningRate: [0.001, 0.01, 0.1],
  batchSize: [16, 32, 64],
  epochs: [10, 20, 50],
  dropout: [0.1, 0.2, 0.3],
  hiddenSize: [128, 256, 512],
  numLayers: [2, 4, 6],
}
