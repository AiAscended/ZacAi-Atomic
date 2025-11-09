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
