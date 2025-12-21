/**
 * Training Coordinator Model Settings
 * Orchestrates model training and fine-tuning
 */

"use client";

import { ModelSettingsPage } from "@/components/admin/ModelSettingsPage";

export default function TrainingCoordinatorPage() {
  return (
    <ModelSettingsPage
      modelName="training-coordinator"
      modelTitle="Training Coordinator"
      modelDescription="Coordinates and schedules training jobs across models and domains"
      defaultParameters={{
        batchSize: 32,
        learningRate: 0.0001,
        maxEpochs: 10,
        checkpointInterval: 1000,
        enableDistributed: false,
        gpuAllocation: "auto",
      }}
    />
  );
}
