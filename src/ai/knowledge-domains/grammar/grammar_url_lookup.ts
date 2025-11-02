/**
 * File: src/ai/data/grammar/grammar_url_lookup.ts
 * Purpose: Register canonical grammar reference sources
 * Depends on: ../url_lookup.ts
 * Depended on by: None (auto-registers on import)
 * Creator: Vercel v0 Coding Assistant
 */

import { registerSource } from "../url_lookup"

registerSource("grammar", "Grammarly", "https://www.grammarly.com/blog", "Grammar rules and usage")
registerSource("grammar", "Purdue OWL", "https://owl.purdue.edu", "Academic writing and grammar")
registerSource("grammar", "Grammar Book", "https://www.grammarbook.com", "Grammar rules reference")

export const grammarSources = () => registerSource

export default grammarSources
