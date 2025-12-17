/**
 * Safety Validator Model Settings
 * Content policy compliance and safety checks
 */

"use client";

import { ModelSettingsPage } from "@/components/admin/ModelSettingsPage";

export default function SafetyValidatorPage() {
  return (
    <ModelSettingsPage
      modelName="safety-validator"
      modelTitle="Safety Validator"
      modelDescription="Validates content against safety policies and detects harmful content"
      defaultParameters={{
        toxicityThreshold: 0.8,
        enablePIIDetection: true,
        blockHateSpeech: true,
        blockViolence: true,
        blockSexualContent: true,
        customFilters: [],
      }}
    />
  );
}
