/**
 * File: src/ai/orchestration/modelSelector.ts
 *
 * Decides which AI models to invoke based on the prompt, task type, and intent.
 * Supports intelligent model selection for optimal performance and accuracy.
 *
 * Integration:
 * - Called by: main-orchestrator.ts
 * - Uses: Intent classification, keyword analysis, model registry
 * - Returns: List of model names to invoke for inference
 */

import { logger } from "./logger";

export interface ModelSelectionCriteria {
  keywords: string[];
  intent: string;
  inputType: "text" | "image" | "audio" | "code" | "multi-modal";
  taskType: "generation" | "classification" | "reasoning" | "transformation";
  preferredModels?: string[];
}

export interface SelectedModel {
  name: string;
  confidence: number;
  reason: string;
}

/**
 * ModelSelector Class
 *
 * Intelligent model selection based on task requirements
 */
export class ModelSelector {
  private modelCapabilities: Map<string, string[]>;
  private modelPriority: Map<string, number>;

  constructor() {
    this.modelCapabilities = new Map();
    this.modelPriority = new Map();
    this.initializeModelRegistry();
  }

  /**
   * Initialize model registry with capabilities
   */
  private initializeModelRegistry(): void {
    // Text models
    this.modelCapabilities.set("unified-transformer-llm", [
      "text-generation",
      "question-answering",
      "summarization",
      "translation",
      "reasoning",
    ]);
    this.modelPriority.set("unified-transformer-llm", 100);

    // Code models
    this.modelCapabilities.set("code-transformer", [
      "code-generation",
      "code-completion",
      "code-explanation",
      "bug-detection",
      "refactoring",
    ]);
    this.modelPriority.set("code-transformer", 95);

    // Vision models
    this.modelCapabilities.set("vision-transformer", [
      "image-classification",
      "object-detection",
      "image-understanding",
    ]);
    this.modelPriority.set("vision-transformer", 90);

    this.modelCapabilities.set("convolutional-neural-network", [
      "image-processing",
      "feature-extraction",
      "image-classification",
    ]);
    this.modelPriority.set("convolutional-neural-network", 85);

    // Sequence models
    this.modelCapabilities.set("recurrent-neural-network", [
      "sequence-processing",
      "time-series",
      "sequential-prediction",
    ]);
    this.modelPriority.set("recurrent-neural-network", 80);

    // Generation models
    this.modelCapabilities.set("generative-adversarial-network", [
      "image-generation",
      "style-transfer",
      "data-augmentation",
    ]);
    this.modelPriority.set("generative-adversarial-network", 85);

    this.modelCapabilities.set("diffusion-model", [
      "high-quality-image-generation",
      "image-editing",
      "creative-generation",
    ]);
    this.modelPriority.set("diffusion-model", 88);

    // Audio models
    this.modelCapabilities.set("speech-to-text", [
      "audio-transcription",
      "speech-recognition",
      "voice-to-text",
    ]);
    this.modelPriority.set("speech-to-text", 90);

    this.modelCapabilities.set("text-to-speech", [
      "speech-synthesis",
      "text-to-audio",
      "voice-generation",
    ]);
    this.modelPriority.set("text-to-speech", 90);

    this.modelCapabilities.set("wavenet-audio-model", [
      "high-fidelity-audio",
      "audio-generation",
      "voice-synthesis",
    ]);
    this.modelPriority.set("wavenet-audio-model", 87);

    // Specialized models
    this.modelCapabilities.set("neuro-symbolic-reasoning", [
      "logical-reasoning",
      "symbolic-computation",
      "hybrid-reasoning",
      "mathematical-proof",
    ]);
    this.modelPriority.set("neuro-symbolic-reasoning", 92);

    this.modelCapabilities.set("graph-neural-network", [
      "graph-processing",
      "relationship-analysis",
      "network-analysis",
    ]);
    this.modelPriority.set("graph-neural-network", 85);

    this.modelCapabilities.set("multi-modal-fusion", [
      "multi-modal-understanding",
      "cross-modal-reasoning",
      "integrated-analysis",
    ]);
    this.modelPriority.set("multi-modal-fusion", 95);
  }

  /**
   * Select appropriate models based on criteria
   */
  public select(criteria: ModelSelectionCriteria): SelectedModel[] {
    const selectedModels: SelectedModel[] = [];

    logger.info("ModelSelector: Selecting models", { criteria })

    // If preferred models specified, prioritize them
    if (criteria.preferredModels && criteria.preferredModels.length > 0) {
      for (const modelName of criteria.preferredModels) {
        if (this.modelCapabilities.has(modelName)) {
          selectedModels.push({
            name: modelName,
            confidence: 1.0,
            reason: "Explicitly requested",
          });
        }
      }
    }

    // Select based on input type
    switch (criteria.inputType) {
      case "text":
        selectedModels.push(
          ...this.selectForText(criteria.keywords, criteria.taskType),
        );
        break;
      case "code":
        selectedModels.push(...this.selectForCode(criteria.keywords));
        break;
      case "image":
        selectedModels.push(...this.selectForImage(criteria.taskType));
        break;
      case "audio":
        selectedModels.push(...this.selectForAudio(criteria.taskType));
        break;
      case "multi-modal":
        selectedModels.push(...this.selectForMultiModal(criteria));
        break;
    }

    // Remove duplicates
    const uniqueModels = this.deduplicateModels(selectedModels);

    // Sort by confidence and priority
    uniqueModels.sort((a, b) => {
      const priorityDiff =
        (this.modelPriority.get(b.name) || 0) -
        (this.modelPriority.get(a.name) || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });

    logger.info("ModelSelector: Models selected", {
      count: uniqueModels.length,
      models: uniqueModels.map((m) => m.name),
    });

    return uniqueModels;
  }

  /**
   * Select models for text processing
   */
  private selectForText(keywords: string[], taskType: string): SelectedModel[] {
    const models: SelectedModel[] = [];

    // Always include LLM for text
    models.push({
      name: "unified-transformer-llm",
      confidence: 0.95,
      reason: "Primary text model",
    });

    // Code-related keywords
    if (this.hasCodeKeywords(keywords)) {
      models.push({
        name: "code-transformer",
        confidence: 0.9,
        reason: "Code-related content detected",
      });
    }

    // Logical reasoning keywords
    if (this.hasReasoningKeywords(keywords) || taskType === "reasoning") {
      models.push({
        name: "neuro-symbolic-reasoning",
        confidence: taskType === "reasoning" ? 0.9 : 0.85,
        reason: "Logical reasoning required",
      });
    }

    return models;
  }

  /**
   * Select models for code processing
   */
  private selectForCode(keywords: string[]): SelectedModel[] {
    const languageHint = keywords.find((keyword) =>
      /(typescript|javascript|python|java|rust)/i.test(keyword)
    )

    const testingFocus = keywords.some((keyword) => /test|jest|mocha|qa/i.test(keyword))

    return [
      {
        name: "code-transformer",
        confidence: languageHint ? 0.99 : 0.95,
        reason: languageHint
          ? `Focused on ${languageHint} implementation details`
          : "Code processing task",
      },
      {
        name: "unified-transformer-llm",
        confidence: testingFocus ? 0.88 : 0.85,
        reason: testingFocus
          ? "Testing context detected"
          : "Supporting natural language",
      },
    ];
  }

  /**
   * Select models for image processing
   */
  private selectForImage(taskType: string): SelectedModel[] {
    const models: SelectedModel[] = [];

    if (taskType === "generation") {
      models.push(
        {
          name: "diffusion-model",
          confidence: 0.95,
          reason: "High-quality image generation",
        },
        {
          name: "generative-adversarial-network",
          confidence: 0.85,
          reason: "Alternative image generation",
        },
      );
    } else {
      models.push(
        {
          name: "vision-transformer",
          confidence: 0.95,
          reason: "Vision understanding",
        },
        {
          name: "convolutional-neural-network",
          confidence: 0.85,
          reason: "Image feature extraction",
        },
      );
    }

    return models;
  }

  /**
   * Select models for audio processing
   */
  private selectForAudio(taskType: string): SelectedModel[] {
    if (taskType === "generation") {
      return [
        {
          name: "text-to-speech",
          confidence: 0.95,
          reason: "Audio generation",
        },
        {
          name: "wavenet-audio-model",
          confidence: 0.9,
          reason: "High-fidelity audio",
        },
      ];
    } else {
      return [
        {
          name: "speech-to-text",
          confidence: 0.95,
          reason: "Audio transcription",
        },
      ];
    }
  }

  /**
   * Select models for multi-modal processing
   */
  private selectForMultiModal(
    criteria: ModelSelectionCriteria,
  ): SelectedModel[] {
    return [
      {
        name: "multi-modal-fusion",
        confidence: 0.98,
        reason: "Multi-modal integration",
      },
      {
        name: "unified-transformer-llm",
        confidence: criteria.taskType === "reasoning" ? 0.92 : 0.9,
        reason: "Text component",
      },
      {
        name: "vision-transformer",
        confidence: criteria.taskType === "generation" ? 0.87 : 0.85,
        reason: "Visual component",
      },
    ];
  }

  /**
   * Check for code-related keywords
   */
  private hasCodeKeywords(keywords: string[]): boolean {
    const codeKeywords = [
      "code",
      "function",
      "class",
      "typescript",
      "javascript",
      "python",
      "programming",
      "algorithm",
      "debug",
      "refactor",
    ];
    return keywords.some((k) =>
      codeKeywords.some((ck) => k.toLowerCase().includes(ck)),
    );
  }

  /**
   * Check for reasoning keywords
   */
  private hasReasoningKeywords(keywords: string[]): boolean {
    const reasoningKeywords = [
      "prove",
      "logic",
      "reasoning",
      "deduce",
      "infer",
      "calculate",
      "solve",
      "mathematical",
    ];
    return keywords.some((k) =>
      reasoningKeywords.some((rk) => k.toLowerCase().includes(rk)),
    );
  }

  /**
   * Remove duplicate models
   */
  private deduplicateModels(models: SelectedModel[]): SelectedModel[] {
    const seen = new Map<string, SelectedModel>();

    for (const model of models) {
      const existing = seen.get(model.name);
      if (!existing || model.confidence > existing.confidence) {
        seen.set(model.name, model);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Get all registered models
   */
  public getAllModels(): string[] {
    return Array.from(this.modelCapabilities.keys());
  }

  /**
   * Get model capabilities
   */
  public getModelCapabilities(modelName: string): string[] {
    return this.modelCapabilities.get(modelName) || [];
  }
}

export default ModelSelector;
