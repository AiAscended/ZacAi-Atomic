import { loadGeneralLearnedData, saveGeneralLearnedData } from './general_knowledge_learnedDataManager';

type GeneralLearned = { notes: string[]; concepts: Record<string, unknown> };

export const generalRunTrainingEpoch = async (opts?: { epochs?: number }) => {
  const data = (await loadGeneralLearnedData()) as GeneralLearned;
  const epoch = opts?.epochs ?? 1;
  data.notes = data.notes || [];
  data.notes.push(`general trained ${epoch} epoch(s) at ${new Date().toISOString()}`);
  await saveGeneralLearnedData(data);
  return { ok: true, epoch };
};
