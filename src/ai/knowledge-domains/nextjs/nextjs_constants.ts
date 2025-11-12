/**
 * File: src/ai/data/nextjs/nextjs_constants.ts
 * Purpose: Constants and configuration for the Next.js knowledge domain
 * Depends on: None
 * Depended on by: All nextjs domain modules
 * Creator: Vercel v0 Coding Assistant
 */

export const NEXTJS_DOMAIN = "nextjs"
export const NEXTJS_VOCAB_PATH = "/src/ai/knowledge-domains/nextjs/nextjs_seeds/nextjs_seedVocabulary.json"
export const NEXTJS_LEARNED_DATA_PATH = "/src/ai/knowledge-domains/nextjs/nextjs_learned/nextjs_learnedData.json"
export const NEXTJS_WEIGHTS_PATH = "/src/ai/knowledge-domains/nextjs/nextjs_weights/nextjs_pretrained_weights.json"
export const NEXTJS_TRAINING_WEIGHTS_PATH = "/src/ai/knowledge-domains/nextjs/nextjs_weights/nextjs_trainingWeights.bin"

// Next.js-specific constants
export const NEXTJS_CONCEPTS = [
  "app-router",
  "pages-router",
  "server-components",
  "client-components",
  "server-actions",
  "route-handlers",
  "middleware",
  "layouts",
  "templates",
  "loading",
  "error",
  "not-found",
  "metadata",
  "static-generation",
  "server-side-rendering",
  "incremental-static-regeneration",
  "dynamic-routes",
  "api-routes",
  "image-optimization",
  "font-optimization",
  "streaming",
  "suspense",
  "parallel-routes",
  "intercepting-routes",
  "route-groups",
] as const

export const NEXTJS_FEATURES = [
  "file-based-routing",
  "automatic-code-splitting",
  "prefetching",
  "hot-module-replacement",
  "typescript-support",
  "css-modules",
  "tailwind-css",
  "environment-variables",
  "internationalization",
  "analytics",
  "deployment",
  "vercel",
] as const
