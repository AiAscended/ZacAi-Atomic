import { programmingTokenMap } from "./programming_tokenMap";
import { PROGRAMMING_SPECIAL_TOKENS } from "./programming_tokens";

export interface TokenizedProgrammingInput {
  tokens: string[];
  tokenIds: number[];
  originalText: string;
}

export function tokenizeProgrammingInput(
  input: string,
): TokenizedProgrammingInput {
  const normalized = input.toLowerCase().trim();
  const rawTokens = normalized
    .split(/[\s,;.(){}[\]<>]+/)
    .filter((t) => t.length > 0);

  const tokens: string[] = [];
  const tokenIds: number[] = [PROGRAMMING_SPECIAL_TOKENS.BOS];

  for (const rawToken of rawTokens) {
    tokens.push(rawToken);
    tokenIds.push(programmingTokenMap.getTokenId(rawToken));
  }

  tokenIds.push(PROGRAMMING_SPECIAL_TOKENS.EOS);

  return { tokens, tokenIds, originalText: input };
}
