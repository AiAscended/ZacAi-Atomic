/**
 * File: src/ai/data/documentation/documentation_url_lookup.ts
 * Purpose: Register canonical documentation reference sources
 * Depends on: ../url_lookup.ts
 * Depended on by: None (auto-registers on import)
 * Creator: Vercel v0 Coding Assistant
 */

import { registerSource } from "../url_lookup"

registerSource("documentation", "JSDoc", "https://jsdoc.app", "JavaScript documentation standard")
registerSource("documentation", "TypeDoc", "https://typedoc.org", "TypeScript documentation generator")

export const documentationSources = () => registerSource
export default documentationSources
