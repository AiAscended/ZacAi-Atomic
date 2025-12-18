/**
 * File: app/admin/model-layers/page.tsx
 * Purpose: Multi-Modal AI Model Layers Management
 * Features: View and configure all neural network model layers
 */

"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  Brain,
  Eye,
  Code,
  Music,
  Image,
  Network,
  Sparkles,
  Layers,
  Settings,
  Play,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ModelLayer {
  id: string
  name: string
  type: string
  modality: 'text' | 'vision' | 'audio' | 'code' | 'multi-modal'
  architecture: string
  icon: React.ComponentType<{ className?: string }>
  status: 'active' | 'inactive' | 'training'
  layers: number
  parameters: string
  embeddingDim: number
  description: string
}

const MODEL_LAYERS: ModelLayer[] = [
  {
    id: 'unified-transformer-llm',
    name: 'Unified Transformer LLM',
    type: 'Transformer',
    modality: 'text',
    architecture: 'GPT-style Decoder',
    icon: Brain,
    status: 'active',
    layers: 24,
    parameters: '175B',
    embeddingDim: 512,
    description: 'Large language model for text generation and understanding',
  },
  {
    id: 'vision-transformer',
    name: 'Vision Transformer',
    type: 'ViT',
    modality: 'vision',
    architecture: 'Transformer + Patch Embedding',
    icon: Eye,
    status: 'active',
    layers: 12,
    parameters: '86M',
    embeddingDim: 768,
    description: 'Image understanding and classification',
  },
  {
    id: 'code-transformer',
    name: 'Code Transformer',
    type: 'Transformer',
    modality: 'code',
    architecture: 'Encoder-Decoder',
    icon: Code,
    status: 'active',
    layers: 16,
    parameters: '350M',
    embeddingDim: 512,
    description: 'Code generation, completion, and analysis',
  },
  {
    id: 'convolutional-neural-network',
    name: 'Convolutional Neural Network',
    type: 'CNN',
    modality: 'vision',
    architecture: 'ResNet-50',
    icon: Image,
    status: 'active',
    layers: 50,
    parameters: '25M',
    embeddingDim: 2048,
    description: 'Image feature extraction and classification',
  },
  {
    id: 'recurrent-neural-network',
    name: 'Recurrent Neural Network',
    type: 'RNN',
    modality: 'text',
    architecture: 'LSTM',
    icon: Brain,
    status: 'active',
    layers: 4,
    parameters: '50M',
    embeddingDim: 512,
    description: 'Sequential data processing',
  },
  {
    id: 'graph-neural-network',
    name: 'Graph Neural Network',
    type: 'GNN',
    modality: 'multi-modal',
    architecture: 'Graph Attention Network',
    icon: Network,
    status: 'active',
    layers: 8,
    parameters: '10M',
    embeddingDim: 256,
    description: 'Graph-structured data processing',
  },
  {
    id: 'diffusion-model',
    name: 'Diffusion Model',
    type: 'Generative',
    modality: 'vision',
    architecture: 'U-Net + Attention',
    icon: Sparkles,
    status: 'active',
    layers: 32,
    parameters: '1.4B',
    embeddingDim: 512,
    description: 'Image generation from text descriptions',
  },
  {
    id: 'generative-adversarial-network',
    name: 'GAN',
    type: 'Generative',
    modality: 'vision',
    architecture: 'Generator + Discriminator',
    icon: Image,
    status: 'active',
    layers: 16,
    parameters: '100M',
    embeddingDim: 512,
    description: 'Realistic image generation',
  },
  {
    id: 'speech-to-text',
    name: 'Speech-to-Text',
    type: 'Encoder',
    modality: 'audio',
    architecture: 'Wav2Vec 2.0',
    icon: Music,
    status: 'active',
    layers: 12,
    parameters: '300M',
    embeddingDim: 768,
    description: 'Audio transcription',
  },
  {
    id: 'text-to-speech',
    name: 'Text-to-Speech',
    type: 'Decoder',
    modality: 'audio',
    architecture: 'Tacotron 2',
    icon: Music,
    status: 'active',
    layers: 10,
    parameters: '200M',
    embeddingDim: 512,
    description: 'Speech synthesis',
  },
  {
    id: 'wavenet-audio-model',
    name: 'WaveNet',
    type: 'Generative',
    modality: 'audio',
    architecture: 'Dilated CNN',
    icon: Music,
    status: 'active',
    layers: 30,
    parameters: '500M',
    embeddingDim: 512,
    description: 'High-quality audio generation',
  },
  {
    id: 'multi-modal-fusion',
    name: 'Multi-Modal Fusion',
    type: 'Fusion',
    modality: 'multi-modal',
    architecture: 'Cross-Attention',
    icon: Layers,
    status: 'active',
    layers: 6,
    parameters: '150M',
    embeddingDim: 768,
    description: 'Combines text, vision, and audio',
  },
  {
    id: 'neuro-symbolic-reasoning',
    name: 'Neuro-Symbolic Reasoning',
    type: 'Hybrid',
    modality: 'text',
    architecture: 'Neural + Symbolic Logic',
    icon: Brain,
    status: 'active',
    layers: 8,
    parameters: '80M',
    embeddingDim: 512,
    description: 'Logical reasoning with neural networks',
  },
];

const MODALITY_COLORS = {
  text: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  vision: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  audio: 'bg-green-500/10 text-green-500 border-green-500/20',
  code: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'multi-modal': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
};

export default function ModelLayersPage() {
  const router = useRouter();
  const [selectedModality, setSelectedModality] = useState<string>('all');

  const filteredModels = selectedModality === 'all'
    ? MODEL_LAYERS
    : MODEL_LAYERS.filter(m => m.modality === selectedModality);

  const modelsByModality = {
    all: MODEL_LAYERS,
    text: MODEL_LAYERS.filter(m => m.modality === 'text'),
    vision: MODEL_LAYERS.filter(m => m.modality === 'vision'),
    audio: MODEL_LAYERS.filter(m => m.modality === 'audio'),
    code: MODEL_LAYERS.filter(m => m.modality === 'code'),
    'multi-modal': MODEL_LAYERS.filter(m => m.modality === 'multi-modal'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Multi-Modal AI Model Layers</h1>
          <p className="text-muted-foreground mt-1">
            {MODEL_LAYERS.length} model layers • 2025 hybrid architecture
          </p>
        </div>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Global Settings
        </Button>
      </div>

      <Card className="p-6">
        <Tabs value={selectedModality} onValueChange={setSelectedModality}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({MODEL_LAYERS.length})</TabsTrigger>
            <TabsTrigger value="text">Text ({modelsByModality.text.length})</TabsTrigger>
            <TabsTrigger value="vision">Vision ({modelsByModality.vision.length})</TabsTrigger>
            <TabsTrigger value="audio">Audio ({modelsByModality.audio.length})</TabsTrigger>
            <TabsTrigger value="code">Code ({modelsByModality.code.length})</TabsTrigger>
            <TabsTrigger value="multi-modal">Multi-Modal ({modelsByModality['multi-modal'].length})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedModality} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModels.map((model) => {
                const Icon = model.icon;
                return (
                  <Card key={model.id} className="p-5 hover:border-primary transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-accent">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", MODALITY_COLORS[model.modality])}
                      >
                        {model.modality}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-sm mb-1">{model.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {model.description}
                    </p>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Architecture:</span>
                        <span className="font-medium">{model.architecture}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Layers:</span>
                        <span className="font-medium">{model.layers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Parameters:</span>
                        <span className="font-medium">{model.parameters}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Embedding:</span>
                        <span className="font-medium">{model.embeddingDim}d</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/admin/model-layers/${model.id}`)}
                      >
                        <Settings className="mr-1 h-3 w-3" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline">
                        <Info className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-semibold mb-2">Architecture Overview</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Modern 2025 hybrid AI architecture with specialized model layers for different modalities
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{MODEL_LAYERS.length}</div>
            <div className="text-xs text-muted-foreground">Total Models</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {MODEL_LAYERS.reduce((sum, m) => sum + m.layers, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Layers</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">5</div>
            <div className="text-xs text-muted-foreground">Modalities</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {MODEL_LAYERS.filter(m => m.status === 'active').length}
            </div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
