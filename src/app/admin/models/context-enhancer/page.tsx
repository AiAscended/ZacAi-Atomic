/**
 * Context Enhancer Model Settings
 * Enriches prompts with history and context
 */

"use client"

import { ModelSettingsPage } from "@/components/admin/ModelSettingsPage"

export default function ContextEnhancerPage() {
  return (
    <ModelSettingsPage 
      modelName="context-enhancer"
      modelTitle="Context Enhancer"
      modelDescription="Enriches user prompts with conversation history and relevant context"
      defaultParameters={{
        contextWindowSize: 10,
        maxContextTokens: 1000,
        relevanceThreshold: 0.7,
        includeSystemPrompts: true,
        contextDecayFactor: 0.9
      }}
    />
  )
}
