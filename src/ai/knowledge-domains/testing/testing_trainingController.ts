/**
 * File: src/ai/data/testing/testing_trainingController.ts
 * Purpose: Training controller for testing domain
 * Depends on: testing_learnedDataManager.ts
 * Depended on by: testing_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import {
  loadTestingLearnedData,
  saveTestingLearnedData,
  type TestingLearnedData,
} from "./testing_learnedDataManager"

export const testingRunTrainingEpoch = async (opts?: { epochs?: number }) => {
  const data: TestingLearnedData = await loadTestingLearnedData()
  const epoch = opts?.epochs ?? 1
  data.notes = data.notes || []
  data.notes.push(`testing trained ${epoch} epoch(s) at ${new Date().toISOString()}`)
  data.interactions = data.interactions || []
  await saveTestingLearnedData(data)
  return { ok: true, epoch }
}
