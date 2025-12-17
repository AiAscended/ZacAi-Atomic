import TOKENS from "./internet_search_tokens";

const RESERVED_TOKENS = ["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"] as const

export const buildInternetSearchTokenMap = () => {
  const tokenToId = new Map<string, number>()
  RESERVED_TOKENS.forEach((token, index) => tokenToId.set(token, index))

export const getInternetSearchTokenId = (token: string): number | undefined =>
  tokenToId.get(token);
export const getInternetSearchTokenById = (id: number): string | undefined =>
  idToToken.get(id);
export const internetSearchTokenCount = () => tokenToId.size;

  return tokenToId
}

const internet_search_tokenMap_bundle = {
  getInternetSearchTokenId,
  getInternetSearchTokenById,
  internetSearchTokenCount,
  internetSearchTokenMap,
};

export default internet_search_tokenMap_bundle;
