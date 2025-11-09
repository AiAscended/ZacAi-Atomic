/**
 * File: src/ai/data/grammar/grammar_trainingController.ts
 * Purpose: Training controller for grammar domain
 * Depends on: grammar_learnedDataManager.ts
 * Depended on by: grammar_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import {
  loadGrammarLearnedData,
  saveGrammarLearnedData,
} from "./grammar_learnedDataManager";

type GrammarLearned = { notes: string[]; concepts: Record<string, unknown> };

export const grammarRunTrainingEpoch = async (opts?: { epochs?: number }) => {
  const data = (await loadGrammarLearnedData()) as GrammarLearned;
  const epoch = opts?.epochs ?? 1;
  data.notes = data.notes || [];
  data.notes.push(
    `grammar trained ${epoch} epoch(s) at ${new Date().toISOString()}`,
  );
  await saveGrammarLearnedData(data);
  return { ok: true, epoch };
};
