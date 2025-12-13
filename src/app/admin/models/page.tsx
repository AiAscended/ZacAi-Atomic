/**
 * File: app/admin/models/page.tsx
 * Purpose: AI Models overview page showing all 13 models in the system
 * Features: Hierarchical display, status indicators, configuration links
 */

"use client"

import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
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
  Puzzle,
  Repeat,
  Sparkles,
  Waves,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AIModel {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: "active" | "inactive" | "training"
  path: string
  category: "language" | "vision" | "audio" | "reasoning" | "fusion"
}

const models: AIModel[] = [
  {
    id: "unified-transformer-llm",
    name: "Unified Transformer LLM",
    description: "Primary reasoning backbone with retrieval-aware decoding",
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
    id: "convolutional-neural-network",
    name: "Convolutional Neural Network",
    description: "Feature extraction backbone for perception-heavy workloads",
    icon: Grid3X3,
    status: "inactive",
    path: "/admin/models/convolutional-neural-network",
    category: "vision",
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
    id: "diffusion-model",
    name: "Diffusion Model",
    description: "Iterative denoising pipeline for high-fidelity synthesis",
    icon: Sparkles,
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
    id: "recurrent-neural-network",
    name: "Recurrent Neural Network",
    description: "Temporal modeling with LSTM/GRU cells for sequential signals",
    icon: Repeat,
    status: "inactive",
    path: "/admin/models/recurrent-neural-network",
    category: "reasoning",
  },
  {
    id: "graph-neural-network",
    name: "Graph Neural Network",
    description: "Graph-aware inference over relational structures and topologies",
    icon: Network,
    status: "inactive",
    path: "/admin/models/graph-neural-network",
    category: "reasoning",
  },
  {
    id: "neuro-symbolic-reasoning",
    name: "Neuro-Symbolic Reasoning",
    description: "Hybrid proof engine combining learned heuristics with symbolic steps",
    icon: Puzzle,
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
]

const categories = {
  language: { label: "Language & Code", color: "text-indigo-500" },
  vision: { label: "Vision & Generation", color: "text-rose-500" },
  audio: { label: "Audio & Speech", color: "text-amber-500" },
  reasoning: { label: "Reasoning & Graph", color: "text-emerald-500" },
  fusion: { label: "Fusion Systems", color: "text-cyan-500" },
}

const statusColors = {
  active: "bg-green-500",
  inactive: "bg-gray-400",
  training: "bg-orange-500",
}

export default function ModelsPage() {
  const router = useRouter()

  const handleModelClick = (path: string) => {
    router.push(path)
  }

  const modelsByCategory = Object.keys(categories).map((category) => ({
    category,
    label: categories[category as keyof typeof categories].label,
    models: models.filter((m) => m.category === category),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Models</h1>
          <p className="text-muted-foreground mt-1">
            {models.filter((m) => m.status === "active").length} active models • {models.length} total
          </p>
        </div>
      </div>

      {modelsByCategory.map(({ category, label, models: categoryModels }) =>
        categoryModels.length > 0 ? (
          <div key={category} className="space-y-3">
            <h2 className={cn("text-xl font-semibold", categories[category as keyof typeof categories].color)}>
              {label}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryModels.map((model) => {
                const Icon = model.icon
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
                          <h3 className="font-semibold text-sm truncate">{model.name}</h3>
                          <div className={cn("h-2 w-2 rounded-full flex-shrink-0", statusColors[model.status])} />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{model.description}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        ) : null,
      )}
    </div>
  )
}
