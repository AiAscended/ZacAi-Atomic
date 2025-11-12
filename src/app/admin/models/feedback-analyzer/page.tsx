/**
 * Feedback Analyzer Model Settings
 * Processes and learns from user feedback
 */

"use client"

import { ModelSettingsPage } from "@/components/admin/ModelSettingsPage"

export default function FeedbackAnalyzerPage() {
  return (
    <ModelSettingsPage 
      modelName="feedback-analyzer"
      modelTitle="Feedback Analyzer"
      modelDescription="Analyzes user feedback to improve system performance"
      defaultParameters={{
        sentimentAnalysis: true,
        aggregationPeriod: "daily",
        minFeedbackCount: 10,
        autoApplyImprovements: false,
        feedbackCategories: ["helpful", "unhelpful", "incorrect", "incomplete"]
      }}
    />
  )
}
