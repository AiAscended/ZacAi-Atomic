let vocabularyLoaded = false;
let vocabulary: string[] = [];

export async function loadProgrammingSeedVocabulary(): Promise<void> {
  if (vocabularyLoaded) return;

  vocabulary = [
    "variable",
    "function",
    "class",
    "object",
    "array",
    "loop",
    "conditional",
    "algorithm",
    "data-structure",
    "api",
  ];

  vocabularyLoaded = true;
  console.log(
    `[Programming Domain] Loaded ${vocabulary.length} vocabulary terms`,
  );
}

export function getProgrammingVocabulary(): string[] {
  return [...vocabulary];
}
