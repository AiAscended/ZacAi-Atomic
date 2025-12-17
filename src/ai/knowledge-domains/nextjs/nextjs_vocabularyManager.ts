let vocabularyLoaded = false;
let vocabulary: string[] = [];

export async function loadNextjsSeedVocabulary(): Promise<void> {
  if (vocabularyLoaded) return;

  try {
    vocabulary = [
      "next.js",
      "app-router",
      "pages-router",
      "server-components",
      "client-components",
      "server-actions",
      "route-handlers",
      "middleware",
      "layouts",
      "metadata",
      "static-generation",
      "server-side-rendering",
      "dynamic-routes",
      "api-routes",
      "image-optimization",
    ];

    vocabularyLoaded = true;
    console.log(
      `[Next.js Domain] Loaded ${vocabulary.length} vocabulary terms`,
    );
  } catch (error) {
    console.error("[Next.js Domain] Failed to load vocabulary:", error);
    throw error;
  }
}

export function getNextjsVocabulary(): string[] {
  return [...vocabulary];
}

export function isVocabularyLoaded(): boolean {
  return vocabularyLoaded;
}

export function getNextjsSeedData(): SeedData | null {
  return seedDataCache
}

function buildVocabularyFromSeedData(seedData: SeedData): string[] {
  const tokens = new Set<string>()

  const addToken = (value?: string | null) => {
    if (!value) return
    const normalized = value.trim()
    if (normalized) {
      tokens.add(normalized)
    }
  }

  seedData.vocabulary.forEach(addToken)

  for (const concept of seedData.concepts) {
    addToken(extractLabel(concept))

    extractStringList(concept, "relatedConcepts").forEach(addToken)
    extractStringList(concept, "synonyms").forEach(addToken)
    extractStringList(concept, "aliases").forEach(addToken)
  }

  return Array.from(tokens).sort((a, b) => a.localeCompare(b))
}

function extractLabel(concept: SeedConcept): string | null {
  for (const key of LABEL_CANDIDATES) {
    const candidate = concept[key]
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim()
    }
  }

  return null
}

function extractStringList(concept: SeedConcept, key: string): string[] {
  const value = concept[key]

  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : null))
      .filter((item): item is string => Boolean(item))
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()]
  }

  return []
}
