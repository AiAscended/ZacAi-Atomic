import {
  ALL_PROGRAMMING_TOKENS,
  PROGRAMMING_SPECIAL_TOKENS,
  type ProgrammingToken,
} from "./programming_tokens";

export class ProgrammingTokenMap {
  private tokenToId: Map<string, number>;
  private idToToken: Map<number, ProgrammingToken>;

  constructor() {
    this.tokenToId = new Map();
    this.idToToken = new Map();

    this.tokenToId.set("<PAD>", PROGRAMMING_SPECIAL_TOKENS.PAD);
    this.tokenToId.set("<UNK>", PROGRAMMING_SPECIAL_TOKENS.UNK);
    this.tokenToId.set("<BOS>", PROGRAMMING_SPECIAL_TOKENS.BOS);
    this.tokenToId.set("<EOS>", PROGRAMMING_SPECIAL_TOKENS.EOS);

    for (const token of ALL_PROGRAMMING_TOKENS) {
      this.tokenToId.set(token.text.toLowerCase(), token.id);
      this.idToToken.set(token.id, token);
    }
  }

  public getTokenId(text: string): number {
    return (
      this.tokenToId.get(text.toLowerCase()) ?? PROGRAMMING_SPECIAL_TOKENS.UNK
    );
  }

  public getToken(id: number): ProgrammingToken | null {
    return this.idToToken.get(id) || null;
  }

  public getVocabularySize(): number {
    return this.tokenToId.size;
  }
}

export const programmingTokenMap = new ProgrammingTokenMap();
