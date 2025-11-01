import {
  loadMathematicsLearnedData,
  saveMathematicsLearnedData,
} from './mathematics_learnedDataManager';

type MathLearned = { notes: string[]; concepts: Record<string, unknown> };

export const mathematicsRunTrainingEpoch = async (opts?: { epochs?: number }) => {
  const data = (await loadMathematicsLearnedData()) as MathLearned;
  const epoch = opts?.epochs ?? 1;
  data.notes = data.notes || [];
  data.notes.push(`mathematics trained ${epoch} epoch(s) at ${new Date().toISOString()}`);
  await saveMathematicsLearnedData(data);
  return { ok: true, epoch };
};
