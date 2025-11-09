import TOKENS from './internet_search_tokens';

const tokenToId = new Map<string, number>();
const idToToken = new Map<number, string>();

TOKENS.forEach((t, i) => {
  tokenToId.set(t, i);
  idToToken.set(i, t);
});

export const getInternetSearchTokenId = (token: string): number | undefined => tokenToId.get(token);
export const getInternetSearchTokenById = (id: number): string | undefined => idToToken.get(id);
export const internetSearchTokenCount = () => tokenToId.size;

export const internetSearchTokenMap = tokenToId;

const internet_search_tokenMap_bundle = {
  getInternetSearchTokenId,
  getInternetSearchTokenById,
  internetSearchTokenCount,
  internetSearchTokenMap,
};

export default internet_search_tokenMap_bundle;
