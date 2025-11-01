/**
 * File: src/ai/data/security/security_trainingController.ts
 * Purpose: Training controller for security domain
 * Depends on: security_learnedDataManager.ts
 * Depended on by: security_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { loadSecurityLearnedData, saveSecurityLearnedData } from "./security_learnedDataManager"

type SecurityLearned = { notes: string[]; concepts: Record<string, unknown> }

export const securityRunTrainingEpoch = async (opts?: { epochs?: number }) => {
  const data = (await loadSecurityLearnedData()) as SecurityLearned
  const epoch = opts?.epochs ?? 1
  data.notes = data.notes || []
  data.notes.push(`security trained ${epoch} epoch(s) at ${new Date().toISOString()}`)
  await saveSecurityLearnedData(data)
  return { ok: true, epoch }
}
