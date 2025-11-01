/**
 * File: src/ai/data/science/science_url_lookup.ts
 * Purpose: Register canonical science reference sources
 * Depends on: ../url_lookup.ts
 * Depended on by: None (auto-registers on import)
 * Creator: Vercel v0 Coding Assistant
 */

import { registerSource } from "../url_lookup"

registerSource("science", "Khan Academy", "https://www.khanacademy.org/science", "Science education")
registerSource("science", "Nature", "https://www.nature.com", "Scientific research journal")
registerSource("science", "ScienceDirect", "https://www.sciencedirect.com", "Scientific database")

export const scienceSources = () => registerSource

export default scienceSources
