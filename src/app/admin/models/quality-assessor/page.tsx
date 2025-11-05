/**
 * Quality Assessor Model Settings
 * Evaluates response quality and coherence
 */

"use client"

import { ModelSettingsPage } from "@/components/admin/ModelSettingsPage"

export default function QualityAssessorPage() {
  return (
    <ModelSettingsPage 
      modelName="quality-assessor"
      modelTitle="Quality Assessor"
      modelDescription="Assesses response quality, coherence, and relevance"
      defaultParameters={{
        coherenceWeight: 0.3,
        relevanceWeight: 0.4,
        factualityWeight: 0.3,
        minQualityScore: 0.7,
        enableGrammarCheck: true,
        enableFactCheck: false
      }}
    />
  )
}
