import { storageAdapter } from "../storageAdapter";
import { safeParseJSON } from "./mathematics_utils";

export type MathematicsSeedVocabulary = {
  terms: string[]
}

const DEFAULT_SEED_VOCAB_PATH =
  "/src/ai/knowledge-domains/mathematics/mathematics_seeds/mathematics_seedVocabulary.json"

const createDefaultSeedVocabulary = (): MathematicsSeedVocabulary => ({ terms: [] })

export const loadMathematicsSeedVocabulary = async (
  path = DEFAULT_SEED_VOCAB_PATH,
): Promise<MathematicsSeedVocabulary> => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8");
    return safeParseJSON(raw, { terms: [] }) as { terms: string[] };
  } catch (e) {
    return { terms: [] };
  }
};
