import TOKENS from "./general_knowledge_tokens";

const RESERVED_TOKENS = ["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"] as const

export const buildGeneralTokenMap = () => {
  const tokenToId = new Map<string, number>()
  RESERVED_TOKENS.forEach((token, index) => tokenToId.set(token, index))
  let nextId = RESERVED_TOKENS.length

export const getGeneralTokenId = (token: string): number | undefined =>
  tokenToId.get(token);
export const getGeneralTokenById = (id: number): string | undefined =>
  idToToken.get(id);
export const generalTokenCount = () => tokenToId.size;

  return tokenToId
}

export default {
  getGeneralTokenId,
  getGeneralTokenById,
  generalTokenCount,
  generalTokenMap,
};
