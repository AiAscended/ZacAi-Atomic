/**
 * Common type helpers shared by placeholder model implementations.
 */

export type ModelPayload = Record<string, unknown>
export type ModelConfig = Record<string, unknown>
export type InferenceContext = Record<string, unknown>

export interface TrainingExample {
  input: ModelPayload
  target?: ModelPayload
}

export type TrainingBatch = ReadonlyArray<TrainingExample>

export interface WeightDictionary {
  [key: string]: number | number[] | string | WeightDictionary | undefined
}
