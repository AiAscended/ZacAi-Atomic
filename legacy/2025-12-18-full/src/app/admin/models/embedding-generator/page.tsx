/**
 * Embedding Generator Model Settings
 * Generates vector embeddings for semantic search
 */

"use client";

import { ModelSettingsPage } from "@/components/admin/ModelSettingsPage";

export default function EmbeddingGeneratorPage() {
  return (
    <ModelSettingsPage
      modelName="embedding-generator"
      modelTitle="Embedding Generator"
      modelDescription="Generates high-quality vector embeddings for semantic search and similarity"
      defaultParameters={{
        modelType: "transformer",
        dimensions: 768,
        normalize: true,
        poolingStrategy: "mean",
        batchSize: 32,
        maxSequenceLength: 512,
      }}
    />
  );
}
