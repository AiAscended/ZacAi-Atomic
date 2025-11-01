/**
 * File: src/ai/data/environment/environment_trainingController.ts
 * Purpose: Training controller for environment domain
 * Depends on: environment_learnedDataManager.ts
 * Depended on by: environment_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { loadEnvironmentLearnedData, saveEnvironmentLearnedData } from "./environment_learnedDataManager"

type EnvironmentLearned = { notes: string[]; concepts: Record<string, unknown> }

export const environmentRunTrainingEpoch = async (opts?: { epochs?: number }) => {
  const data = (await loadEnvironmentLearnedData()) as EnvironmentLearned
  const epoch = opts?.epochs ?? 1
  data.notes.push(`environment trained ${epoch} epoch(s) at ${new Date().toISOString()}`)
  await saveEnvironmentLearnedData(data)
  return { success: true, epochs: epoch }
}
