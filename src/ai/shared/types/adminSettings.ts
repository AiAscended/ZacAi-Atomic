/**
 * File: src/ai/shared/types/adminSettings.ts
 * Purpose: Centralized TypeScript types for all admin settings
 * 
 * This schema defines the shape of configuration data for:
 * - System-wide settings
 * - Orchestrator configuration
 * - Domain-specific settings
 * - GitHub App integration
 * - IDE mode features
 */

// ============================================================================
// System Settings
// ============================================================================

export interface SystemSettings {
  general: {
    appName: string;
    environment: "development" | "staging" | "production";
    logLevel: "debug" | "info" | "warn" | "error";
    enableTelemetry: boolean;
  };
  
  rag: {
    embeddingModel: string;
    chunkSize: number;
    chunkOverlap: number;
    maxRetrievalResults: number;
    similarityThreshold: number;
  };
  
  security: {
    enableRateLimiting: boolean;
    maxRequestsPerMinute: number;
    enableCORS: boolean;
    allowedOrigins: string[];
  };
}

// ============================================================================
// Orchestrator Settings
// ============================================================================

export interface OrchestratorSettings {
  domainSelectionThreshold: number;  // 0.0 - 1.0
  maxDomainsPerQuery: number;
  enableParallelInference: boolean;
  enableContextEnhancement: boolean;
  enableKnowledgeRetrieval: boolean;
  
  performance: {
    maxConcurrentRequests: number;
    requestTimeoutMs: number;
    enableCaching: boolean;
    cacheMaxSize: number;
  };
  
  reasoning: {
    maxReasoningSteps: number;
    enableThinkingSteps: boolean;
    thinkingVerbosity: "minimal" | "normal" | "detailed";
  };
}

// ============================================================================
// Domain Settings
// ============================================================================

export interface DomainSettings {
  domainId: string;
  enabled: boolean;
  
  inference: {
    confidenceThreshold: number;  // 0.0 - 1.0
    tokenMatchWeight: number;     // 0.0 - 1.0
    semanticWeight: number;       // 0.0 - 1.0
    temperature: number;          // 0.0 - 2.0
    topP: number;                 // 0.0 - 1.0
    maxTokens: number;
    frequencyPenalty: number;     // -2.0 - 2.0
  };
  
  training: {
    enableAutoTraining: boolean;
    trainingSchedule?: string;  // cron expression
    minTrainingExamples: number;
    validationSplit: number;
  };
  
  seeds: {
    lastUpdated?: string;
    version: string;
    customVocabulary: string[];
  };
}

// ============================================================================
// Training Settings
// ============================================================================

export interface TrainingSettings {
  autoTraining: {
    enabled: boolean;
    schedule: string; // cron expression (e.g., "0 2 * * *" for 2 AM daily)
    minConfidenceThreshold: number; // 0.0 - 1.0
    maxSamplesPerRun: number;
    minSamplesRequired: number;
  };
  
  pipeline: {
    enableVocabularyUpdate: boolean;
    enableWeightUpdate: boolean;
    enableSeedRegeneration: boolean;
    validationSplit: number; // 0.0 - 1.0
    testSplit: number; // 0.0 - 1.0
  };
  
  optimization: {
    learningRate: number;
    batchSize: number;
    epochs: number;
    earlyStoppingPatience: number;
    gradientClipping: number;
  };
  
  status: {
    lastTrainingRun?: string;
    nextScheduledRun?: string;
    trainingInProgress: boolean;
    lastTrainingDuration?: number; // milliseconds
    lastTrainingSamples?: number;
  };
}

// ============================================================================
// GitHub App Settings
// ============================================================================

export interface GitHubAppSettings {
  // Public configuration
  appId: string;
  clientId: string;
  
  // Installation data (managed by OAuth flow)
  installations: GitHubInstallation[];
  
  // Webhook configuration
  webhookSecret: string;
  webhookUrl?: string;
  
  // Feature flags
  enableAutoCommit: boolean;
  enablePRCreation: boolean;
  enableIssueSync: boolean;
  
  // Default repository settings
  defaultBranch: string;
  commitMessagePrefix: string;
}

export interface GitHubInstallation {
  installationId: string;
  accountLogin: string;
  accountType: "User" | "Organization";
  installedAt: string;
  repositories: GitHubRepository[];
  permissions: Record<string, string>;
}

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  defaultBranch: string;
}

// ============================================================================
// IDE Mode Settings
// ============================================================================

export interface IDEModeSettings {
  enabled: boolean;
  
  features: {
    enableCodeCompletion: boolean;
    enableInlineChat: boolean;
    enableFileTree: boolean;
    enableTerminal: boolean;
    enableGitIntegration: boolean;
  };
  
  editor: {
    theme: "light" | "dark" | "auto";
    fontSize: number;
    tabSize: number;
    wordWrap: boolean;
    minimap: boolean;
  };
  
  ai: {
    enableContextualSuggestions: boolean;
    suggestionDelay: number;
    maxSuggestions: number;
  };
}

// ============================================================================
// Model Settings
// ============================================================================

export interface ModelSettings {
  modelId: string;
  modelType: "llm" | "cnn" | "rnn" | "transformer" | "gan" | "diffusion" | "other";
  enabled: boolean;
  
  config: {
    batchSize: number;
    maxSequenceLength: number;
    vocabSize: number;
    embeddingDim: number;
    numLayers: number;
    numHeads?: number;
    dropout: number;
  };
  
  weights: {
    pretrainedPath?: string;
    finetunedPath?: string;
    lastUpdated?: string;
  };
  
  inference: {
    device: "cpu" | "gpu" | "auto";
    precision: "fp16" | "fp32" | "int8";
    batchSize: number;
  };
}

// ============================================================================
// Complete Admin Settings (Root)
// ============================================================================

export interface AdminSettings {
  version: string;
  lastUpdated: string;
  
  system: SystemSettings;
  orchestrator: OrchestratorSettings;
  domains: Record<string, DomainSettings>;
  githubApp: GitHubAppSettings;
  ideMode: IDEModeSettings;
  models: Record<string, ModelSettings>;
}

// ============================================================================
// Partial Update Types
// ============================================================================

export type SystemSettingsUpdate = Partial<SystemSettings>;
export type OrchestratorSettingsUpdate = Partial<OrchestratorSettings>;
export type DomainSettingsUpdate = Partial<DomainSettings>;
export type GitHubAppSettingsUpdate = Partial<GitHubAppSettings>;
export type IDEModeSettingsUpdate = Partial<IDEModeSettings>;
export type ModelSettingsUpdate = Partial<ModelSettings>;

// ============================================================================
// Settings Validation Result
// ============================================================================

export interface SettingsValidationResult {
  valid: boolean;
  errors: SettingsValidationError[];
}

export interface SettingsValidationError {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// Default Settings
// ============================================================================

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  general: {
    appName: "ZacAI Atomic",
    environment: "development",
    logLevel: "info",
    enableTelemetry: false,
  },
  rag: {
    embeddingModel: "text-embedding-3-small",
    chunkSize: 512,
    chunkOverlap: 50,
    maxRetrievalResults: 10,
    similarityThreshold: 0.7,
  },
  security: {
    enableRateLimiting: true,
    maxRequestsPerMinute: 60,
    enableCORS: true,
    allowedOrigins: ["http://localhost:3000"],
  },
};

export const DEFAULT_ORCHESTRATOR_SETTINGS: OrchestratorSettings = {
  domainSelectionThreshold: 0.6,
  maxDomainsPerQuery: 3,
  enableParallelInference: true,
  enableContextEnhancement: true,
  enableKnowledgeRetrieval: true,
  performance: {
    maxConcurrentRequests: 10,
    requestTimeoutMs: 30000,
    enableCaching: true,
    cacheMaxSize: 1000,
  },
  reasoning: {
    maxReasoningSteps: 10,
    enableThinkingSteps: true,
    thinkingVerbosity: "normal",
  },
};

export const DEFAULT_IDE_MODE_SETTINGS: IDEModeSettings = {
  enabled: false,
  features: {
    enableCodeCompletion: true,
    enableInlineChat: true,
    enableFileTree: true,
    enableTerminal: true,
    enableGitIntegration: true,
  },
  editor: {
    theme: "auto",
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    minimap: false,
  },
  ai: {
    enableContextualSuggestions: true,
    suggestionDelay: 300,
    maxSuggestions: 5,
  },
};

export const DEFAULT_GITHUB_APP_SETTINGS: GitHubAppSettings = {
  appId: "",
  clientId: "",
  installations: [],
  webhookSecret: "",
  enableAutoCommit: false,
  enablePRCreation: true,
  enableIssueSync: true,
  defaultBranch: "main",
  commitMessagePrefix: "[AI]",
};
