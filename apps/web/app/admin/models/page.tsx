/**
 * File: app/admin/models/page.tsx
 * Purpose: AI Models overview page showing all 13 models in the system
 * Features: Hierarchical display, status indicators, configuration links
 */

"use client";

import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  Atom,
  AudioLines,
  Brain,
  Camera,
  Code2,
  Grid3X3,
  Merge,
  Mic,
  Network,
  Route,
  Puzzle,
  Repeat,
  Sparkles,
  Database,
  Shield,
  Package,
  Zap,
  Activity,
  Wrench,
  Wand2,
  FileOutput,
  AlertCircle,
  Waves,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIModel {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "active" | "inactive" | "training";
  path: string;
  category:
    | "orchestration"
    | "inference"
    | "training"
    | "monitoring"
    | "utility"
    | "language"
    | "vision"
    | "reasoning"
    | "fusion"
    | "audio";
}

const models: AIModel[] = [
  {
    id: "orchestrator",
    name: "Main Orchestrator",
    description:
      "Coordinates all AI models, routes queries to appropriate domains",
    icon: Brain,
    status: "active",
    path: "/admin/models/unified-transformer-llm",
    category: "language",
  },
  {
    id: "code-transformer",
    name: "Code Transformer",
    description: "Syntax-aware generation and repair for structured codebases",
    icon: Code2,
    status: "inactive",
    path: "/admin/models/code-transformer",
    category: "language",
  },
  {
    id: "domain-router",
    name: "Domain Router",
    description:
      "Routes queries to relevant knowledge domains based on content analysis",
    icon: Route,
    status: "active",
    path: "/admin/models/domain-router",
    category: "orchestration",
  },
  {
    id: "vision-transformer",
    name: "Vision Transformer",
    description: "Patch-wise transformer for global visual reasoning",
    icon: Camera,
    status: "inactive",
    path: "/admin/models/vision-transformer",
    category: "vision",
  },
  {
    id: "context-enhancer",
    name: "Context Enhancer",
    description:
      "Enriches prompts with session history and contextual information",
    icon: Sparkles,
    status: "active",
    path: "/admin/models/context-enhancer",
    category: "inference",
  },
  {
    id: "knowledge-retriever",
    name: "Knowledge Retriever",
    description:
      "RAG system for retrieving relevant information from knowledge base",
    icon: Database,
    status: "active",
    path: "/admin/models/knowledge-retriever",
    category: "inference",
  },
  {
    id: "safety-validator",
    name: "Safety Validator",
    description:
      "Validates inputs and outputs for safety, content policy compliance",
    icon: Shield,
    status: "active",
    path: "/admin/models/safety-validator",
    category: "utility",
  },
  {
    id: "model-loader",
    name: "Model Loader",
    description: "Loads and manages model weights and configurations",
    icon: Package,
    status: "active",
    path: "/admin/models/model-loader",
    category: "utility",
  },
  {
    id: "model-trainer",
    name: "Model Trainer",
    description: "Handles training epochs, backpropagation, and weight updates",
    icon: Zap,
    status: "training",
    path: "/admin/models/diffusion-model",
    category: "vision",
  },
  {
    id: "generative-adversarial-network",
    name: "Generative Adversarial Network",
    description: "Dual-network adversarial trainer for style transfer and augmentation",
    icon: Atom,
    status: "inactive",
    path: "/admin/models/generative-adversarial-network",
    category: "vision",
  },
  {
    id: "tool-registry",
    name: "Tool Registry",
    description:
      "Manages available tools and their execution for function calling",
    icon: Wrench,
    status: "active",
    path: "/admin/models/tool-registry",
    category: "utility",
  },
  {
    id: "prompt-builder",
    name: "Prompt Builder",
    description:
      "Constructs optimized prompts for different models and contexts",
    icon: Wand2,
    status: "active",
    path: "/admin/models/prompt-builder",
    category: "inference",
  },
  {
    id: "output-formatter",
    name: "Output Formatter",
    description:
      "Formats responses for optimal display with code/text separation",
    icon: FileOutput,
    status: "active",
    path: "/admin/models/neuro-symbolic-reasoning",
    category: "reasoning",
  },
  {
    id: "multi-modal-fusion",
    name: "Multi-Modal Fusion",
    description: "Attention router aligning embeddings across text, image, and audio",
    icon: Merge,
    status: "training",
    path: "/admin/models/multi-modal-fusion",
    category: "fusion",
  },
  {
    id: "speech-to-text",
    name: "Speech-to-Text",
    description: "Streaming transcription with adaptive language modeling",
    icon: Mic,
    status: "active",
    path: "/admin/models/speech-to-text",
    category: "audio",
  },
  {
    id: "text-to-speech",
    name: "Text-to-Speech",
    description: "Neural vocoder stack for expressive, low-latency speech synthesis",
    icon: AudioLines,
    status: "active",
    path: "/admin/models/text-to-speech",
    category: "audio",
  },
  {
    id: "wavenet-audio-model",
    name: "WaveNet Audio Model",
    description: "Autoregressive waveform generator for premium audio cues",
    icon: Waves,
    status: "inactive",
    path: "/admin/models/wavenet-audio-model",
    category: "audio",
  },
];

const categories = {
  orchestration: { label: "Orchestration", color: "text-purple-500" },
  inference: { label: "Inference", color: "text-blue-500" },
  training: { label: "Training", color: "text-orange-500" },
  monitoring: { label: "Monitoring", color: "text-green-500" },
  utility: { label: "Utility", color: "text-gray-500" },
};

const statusColors = {
  active: "bg-green-500",
  inactive: "bg-gray-400",
  training: "bg-orange-500",
};

export default function ModelsPage() {
  const router = useRouter();

  const handleModelClick = (path: string) => {
    router.push(path);
  };

  const modelsByCategory = Object.keys(categories).map((category) => ({
    category,
    label: categories[category as keyof typeof categories].label,
    models: models.filter((m) => m.category === category),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Models</h1>
          <p className="text-muted-foreground mt-1">
            {models.filter((m) => m.status === "active").length} active models •{" "}
            {models.length} total
          </p>
        </div>
      </div>

      {modelsByCategory.map(({ category, label, models: categoryModels }) =>
        categoryModels.length > 0 ? (
          <div key={category} className="space-y-3">
            <h2
              className={cn(
                "text-xl font-semibold",
                categories[category as keyof typeof categories].color,
              )}
            >
              {label}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryModels.map((model) => {
                const Icon = model.icon;
                return (
                  <Card
                    key={model.id}
                    className="p-4 cursor-pointer hover:border-primary transition-all duration-200 hover:shadow-md"
                    onClick={() => handleModelClick(model.path)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-accent">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">
                            {model.name}
                          </h3>
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full flex-shrink-0",
                              statusColors[model.status],
                            )}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {model.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
}
