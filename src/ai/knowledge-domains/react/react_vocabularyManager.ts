let vocabularyLoaded = false
let vocabulary: string[] = []

export async function loadReactSeedVocabulary(): Promise<void> {
  if (vocabularyLoaded) return

  try {
    // In a real implementation, this would load from the JSON file
    // For now, we'll use a hardcoded vocabulary
    vocabulary = [
      "component",
      "props",
      "state",
      "hooks",
      "useState",
      "useEffect",
      "useContext",
      "jsx",
      "render",
      "lifecycle",
    ]

    vocabularyLoaded = true
    console.log(`[React Domain] Loaded ${vocabulary.length} vocabulary terms`)
  } catch (error) {
    console.error("[React Domain] Failed to load vocabulary:", error)
    throw error
  }
}

export function getReactVocabulary(): string[] {
  return [...vocabulary]
}

export function isVocabularyLoaded(): boolean {
  return vocabularyLoaded
}
