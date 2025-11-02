/**
 * File: src/ai/data/documentation/documentation_trainingController.ts
 * Purpose: Training controller for documentation domain
 * Depends on: documentation_learnedDataManager.ts
 * Depended on by: documentation_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { loadDocumentationLearnedData, saveDocumentationLearnedData } from "./documentation_learnedDataManager"

type DocumentationLearned = { notes: string[]; concepts: Record<string, unknown> }

export const documentationRunTrainingEpoch = async (opts?: { epochs?: number }) => {
  const data = (await loadDocumentationLearnedData()) as DocumentationLearned
  const epoch = opts?.epochs ?? 1
  data.notes = data.notes || []
  data.notes.push(`documentation trained ${epoch} epoch(s) at ${new Date().toISOString()}`)
  await saveDocumentationLearnedData(data)
  return { ok: true, epoch }
}
