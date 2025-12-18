import { storageAdapter } from "../storageAdapter";
import { safeParseJSON } from "./typescript_utils";

export const loadTypescriptSeedVocabulary = async (
  path = "/src/ai/knowledge-domains/typescript/typescript_seeds/typescript_seedVocabulary.json",
) => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8");
    return safeParseJSON(raw, { terms: [] }) as { terms: string[] };
  } catch (e) {
    return { terms: [] };
  }
};
