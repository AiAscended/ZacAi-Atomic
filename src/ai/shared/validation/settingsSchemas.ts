/**
 * File: src/ai/shared/validation/settingsSchemas.ts
 * Purpose: Zod validation schemas for admin settings
 * 
 * Provides runtime validation for all settings types
 */

import { z } from "zod";

// ============================================================================
// System Settings Schema
// ============================================================================

export const SystemSettingsSchema = z.object({
  general: z.object({
    appName: z.string().min(1),
    environment: z.enum(["development", "staging", "production"]),
    logLevel: z.enum(["debug", "info", "warn", "error"]),
    enableTelemetry: z.boolean(),
  }),
  rag: z.object({
    embeddingModel: z.string().min(1),
    chunkSize: z.number().int().positive(),
    chunkOverlap: z.number().int().nonnegative(),
    maxRetrievalResults: z.number().int().positive(),
    similarityThreshold: z.number().min(0).max(1),
  }),
  security: z.object({
    enableRateLimiting: z.boolean(),
    maxRequestsPerMinute: z.number().int().positive(),
    enableCORS: z.boolean(),
    allowedOrigins: z.array(z.string().url()),
  }),
});

// ============================================================================
// Orchestrator Settings Schema
// ============================================================================

export const OrchestratorSettingsSchema = z.object({
  domainSelectionThreshold: z.number().min(0).max(1),
  maxDomainsPerQuery: z.number().int().positive(),
  enableParallelInference: z.boolean(),
  enableContextEnhancement: z.boolean(),
  enableKnowledgeRetrieval: z.boolean(),
  performance: z.object({
    maxConcurrentRequests: z.number().int().positive(),
    requestTimeoutMs: z.number().int().positive(),
    enableCaching: z.boolean(),
    cacheMaxSize: z.number().int().positive(),
  }),
  reasoning: z.object({
    maxReasoningSteps: z.number().int().positive(),
    enableThinkingSteps: z.boolean(),
    thinkingVerbosity: z.enum(["minimal", "normal", "detailed"]),
  }),
});

// ============================================================================
// Domain Settings Schema
// ============================================================================

export const DomainSettingsSchema = z.object({
  domainId: z.string().min(1),
  enabled: z.boolean(),
  inference: z.object({
    confidenceThreshold: z.number().min(0).max(1),
    tokenMatchWeight: z.number().min(0).max(1),
    semanticWeight: z.number().min(0).max(1),
    temperature: z.number().min(0).max(2),
    topP: z.number().min(0).max(1),
    maxTokens: z.number().int().positive(),
    frequencyPenalty: z.number().min(-2).max(2),
  }),
  training: z.object({
    enableAutoTraining: z.boolean(),
    trainingSchedule: z.string().optional(),
    minTrainingExamples: z.number().int().positive(),
    validationSplit: z.number().min(0).max(1),
  }),
  seeds: z.object({
    lastUpdated: z.string().optional(),
    version: z.string(),
    customVocabulary: z.array(z.string()),
  }),
});

// ============================================================================
// GitHub App Settings Schema
// ============================================================================

export const GitHubAppSettingsSchema = z
  .object({
    appId: z.string(),
    clientId: z.string(),
    installations: z.array(
      z.object({
        installationId: z.string(),
        accountLogin: z.string(),
        accountType: z.enum(["User", "Organization"]),
        installedAt: z.string(),
        repositories: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            fullName: z.string(),
            private: z.boolean(),
            defaultBranch: z.string(),
          })
        ),
        permissions: z.record(z.string(), z.string()),
      })
    ),
    webhookSecret: z.string(),
    webhookUrl: z.string().url().optional(),
    enableAutoCommit: z.boolean(),
    enablePRCreation: z.boolean(),
    enableIssueSync: z.boolean(),
    defaultBranch: z.string(),
    commitMessagePrefix: z.string(),
  })
  .refine(
    (data) => {
      const hasAppId = data.appId.trim().length > 0;
      const hasClientId = data.clientId.trim().length > 0;
      return hasAppId === hasClientId;
    },
    {
      message: 'appId and clientId must both be provided together or left blank',
      path: ['appId'],
    }
  );

// Public-facing (no secrets)
export const GitHubAppSettingsPublicSchema = GitHubAppSettingsSchema.omit({
  webhookSecret: true,
});

// ============================================================================
// IDE Mode Settings Schema
// ============================================================================

export const IDEModeSettingsSchema = z.object({
  enabled: z.boolean(),
  features: z.object({
    enableCodeCompletion: z.boolean(),
    enableInlineChat: z.boolean(),
    enableFileTree: z.boolean(),
    enableTerminal: z.boolean(),
    enableGitIntegration: z.boolean(),
  }),
  editor: z.object({
    theme: z.enum(["light", "dark", "auto"]),
    fontSize: z.number().int().min(8).max(32),
    tabSize: z.number().int().min(2).max(8),
    wordWrap: z.boolean(),
    minimap: z.boolean(),
  }),
  ai: z.object({
    enableContextualSuggestions: z.boolean(),
    suggestionDelay: z.number().int().nonnegative(),
    maxSuggestions: z.number().int().positive(),
  }),
});

// ============================================================================
// Model Settings Schema
// ============================================================================

export const ModelSettingsSchema = z.object({
  modelId: z.string().min(1),
  modelType: z.enum(["llm", "cnn", "rnn", "transformer", "gan", "diffusion", "other"]),
  enabled: z.boolean(),
  config: z.object({
    batchSize: z.number().int().positive(),
    maxSequenceLength: z.number().int().positive(),
    vocabSize: z.number().int().positive(),
    embeddingDim: z.number().int().positive(),
    numLayers: z.number().int().positive(),
    numHeads: z.number().int().positive().optional(),
    dropout: z.number().min(0).max(1),
  }),
  weights: z.object({
    pretrainedPath: z.string().optional(),
    finetunedPath: z.string().optional(),
    lastUpdated: z.string().optional(),
  }),
  inference: z.object({
    device: z.enum(["cpu", "gpu", "auto"]),
    precision: z.enum(["fp16", "fp32", "int8"]),
    batchSize: z.number().int().positive(),
  }),
});

// ============================================================================
// Complete Admin Settings Schema
// ============================================================================

export const AdminSettingsSchema = z.object({
  version: z.string(),
  lastUpdated: z.string(),
  system: SystemSettingsSchema,
  orchestrator: OrchestratorSettingsSchema,
  domains: z.record(z.string(), DomainSettingsSchema),
  githubApp: GitHubAppSettingsSchema,
  ideMode: IDEModeSettingsSchema,
  models: z.record(z.string(), ModelSettingsSchema),
});

// ============================================================================
// Validation Helper Functions
// ============================================================================

export function validateSystemSettings(data: unknown) {
  return SystemSettingsSchema.safeParse(data);
}

export function validateOrchestratorSettings(data: unknown) {
  return OrchestratorSettingsSchema.safeParse(data);
}

export function validateDomainSettings(data: unknown) {
  return DomainSettingsSchema.safeParse(data);
}

export function validateGitHubAppSettings(data: unknown) {
  return GitHubAppSettingsSchema.safeParse(data);
}

export function validateGitHubAppSettingsPublic(data: unknown) {
  return GitHubAppSettingsPublicSchema.safeParse(data);
}

export function validateIDEModeSettings(data: unknown) {
  return IDEModeSettingsSchema.safeParse(data);
}

export function validateModelSettings(data: unknown) {
  return ModelSettingsSchema.safeParse(data);
}

export function validateAdminSettings(data: unknown) {
  return AdminSettingsSchema.safeParse(data);
}

// ============================================================================
// Secret Redaction Utility
// ============================================================================

type SecretBearingRecord = Record<string, unknown>;

export function redactSecrets<T extends SecretBearingRecord>(obj: T): T {
  const redacted: SecretBearingRecord = { ...obj };
  const secretKeys = ["privateKey", "webhookSecret", "apiKey", "secret", "password", "token"];

  for (const key of Object.keys(redacted)) {
    const value = redacted[key];
    if (secretKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      redacted[key] = "***REDACTED***";
      continue;
    }

    if (Array.isArray(value)) {
      redacted[key] = value.map(item =>
        typeof item === "object" && item !== null ? redactSecrets(item as SecretBearingRecord) : item
      );
    } else if (typeof value === "object" && value !== null) {
      redacted[key] = redactSecrets(value as SecretBearingRecord);
    }
  }

  return redacted as T;
}
