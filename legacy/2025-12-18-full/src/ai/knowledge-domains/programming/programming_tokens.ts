import {
  PROGRAMMING_CONCEPTS,
  PROGRAMMING_PARADIGMS,
  PROGRAMMING_LANGUAGES,
} from "./programming_constants";

export type ProgrammingToken = {
  id: number;
  text: string;
  type: "concept" | "paradigm" | "language" | "keyword";
  category?: string;
};

export const PROGRAMMING_SPECIAL_TOKENS = {
  PAD: 0,
  UNK: 1,
  BOS: 2,
  EOS: 3,
} as const;

let tokenId = 4;

export const PROGRAMMING_CONCEPT_TOKENS: ProgrammingToken[] =
  PROGRAMMING_CONCEPTS.map((concept) => ({
    id: tokenId++,
    text: concept,
    type: "concept" as const,
    category: "programming-core",
  }));

export const PROGRAMMING_PARADIGM_TOKENS: ProgrammingToken[] =
  PROGRAMMING_PARADIGMS.map((paradigm) => ({
    id: tokenId++,
    text: paradigm,
    type: "paradigm" as const,
    category: "programming-paradigms",
  }));

export const PROGRAMMING_LANGUAGE_TOKENS: ProgrammingToken[] =
  PROGRAMMING_LANGUAGES.map((lang) => ({
    id: tokenId++,
    text: lang,
    type: "language" as const,
    category: "programming-languages",
  }));

export const ALL_PROGRAMMING_TOKENS: ProgrammingToken[] = [
  ...PROGRAMMING_CONCEPT_TOKENS,
  ...PROGRAMMING_PARADIGM_TOKENS,
  ...PROGRAMMING_LANGUAGE_TOKENS,
];
