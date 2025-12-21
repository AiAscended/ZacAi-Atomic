/**
 * Shared admin settings types used by orchestrator and hybrid control APIs.
 */

export interface HCOAuditLoggingSettings {
  enabled: boolean;
  redactAudio: boolean;
  retainTranscriptsInDays: number;
}

export interface HCOSpeechSettings {
  enabled: boolean;
  enableSTT: boolean;
  enableTTS: boolean;
  defaultVoice: string;
  availableVoices: string[];
  preferredLanguages: string[];
}

export interface HCOModeSettings {
  enabled: boolean;
  routingStrategy: "auto" | "manual";
  minConfidence: number;
  enforceCriticalPath: boolean;
  allowUserOverride: boolean;
  triggerWords?: string[];
  speech: HCOSpeechSettings;
  auditLogging: HCOAuditLoggingSettings;
}

export interface OrchestratorSettings {
  domainSelectionThreshold?: number;
  maxDomainsPerQuery?: number;
  enableParallelInference?: boolean;
  enableContextEnhancement?: boolean;
  enableKnowledgeRetrieval?: boolean;
  performance?: {
    maxConcurrentRequests?: number;
    requestTimeoutMs?: number;
    cacheMaxSize?: number;
  };
  reasoning?: {
    maxReasoningSteps?: number;
  };
  hybridMode: HCOModeSettings;
}
