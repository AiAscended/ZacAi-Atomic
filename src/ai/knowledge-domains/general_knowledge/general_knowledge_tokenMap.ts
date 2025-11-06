import TOKENS from './general_knowledge_tokens';

const tokenToId = new Map<string, number>();
const idToToken = new Map<number, string>();

// 0-based token ids
TOKENS.forEach((t, i) => {
  tokenToId.set(t, i);
  idToToken.set(i, t);
});

export const getGeneralTokenId = (token: string): number | undefined => tokenToId.get(token);
export const getGeneralTokenById = (id: number): string | undefined => idToToken.get(id);
export const generalTokenCount = () => tokenToId.size;

export const generalTokenMap = tokenToId;

export default { getGeneralTokenId, getGeneralTokenById, generalTokenCount, generalTokenMap };
