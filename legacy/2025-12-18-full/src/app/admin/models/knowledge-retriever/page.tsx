/**
 * Knowledge Retriever Model Settings
 * RAG system for retrieving relevant knowledge
 */

"use client";

import { ModelSettingsPage } from "@/components/admin/ModelSettingsPage";

export default function KnowledgeRetrieverPage() {
  return (
    <ModelSettingsPage
      modelName="knowledge-retriever"
      modelTitle="Knowledge Retriever"
      modelDescription="RAG system that retrieves relevant knowledge from vector databases"
      defaultParameters={{
        topK: 5,
        similarityThreshold: 0.75,
        vectorDimensions: 768,
        embeddingModel: "text-embedding-ada-002",
        rerankResults: true,
      }}
    />
  );
}
