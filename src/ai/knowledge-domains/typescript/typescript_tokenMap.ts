import TOKENS from './typescript_tokens';

const tokenToId = new Map<string, number>();
const idToToken = new Map<number, string>();

TOKENS.forEach((t, i) => {
  tokenToId.set(t, i);
  idToToken.set(i, t);
});

export const getTypescriptTokenId = (token: string): number | undefined => tokenToId.get(token);
export const getTypescriptTokenById = (id: number): string | undefined => idToToken.get(id);
export const typescriptTokenCount = () => tokenToId.size;

export const typescriptTokenMap = tokenToId;

export default {
  getTypescriptTokenId,
  getTypescriptTokenById,
  typescriptTokenCount,
  typescriptTokenMap,
};
