/**
 * Secure Settings Store (fallback implementation)
 * Provides durable JSON-backed settings for orchestrator, GitHub App, and IDE mode.
 * Keeps API routes online even when the richer config layer is unavailable.
 */

import * as fs from "fs";
import * as path from "path";

export interface GitHubInstallation {
  installationId: string;
  account?: string;
}

export interface GitHubAppSettings {
  appId: string;
  clientId: string;
  installations: GitHubInstallation[];
  webhookUrl?: string;
  enableAutoCommit: boolean;
  enablePRCreation: boolean;
  enableIssueSync: boolean;
  defaultBranch: string;
  commitMessagePrefix: string;
}

export interface SpeechSettings {
  enabled: boolean;
  enableSTT: boolean;
  enableTTS: boolean;
  defaultVoice: string;
  availableVoices: string[];
  preferredLanguages: string[];
}

export interface AuditLoggingSettings {
  enabled: boolean;
  redactAudio: boolean;
  retainTranscriptsInDays: number;
}

export interface HCOModeSettings {
  enabled: boolean;
  routingStrategy: "auto" | "manual";
  minConfidence: number;
  enforceCriticalPath: boolean;
  allowUserOverride: boolean;
  triggerWords?: string[];
  speech: SpeechSettings;
  auditLogging: AuditLoggingSettings;
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

export interface IDEModeSettings {
  enabled: boolean;
  mode: "standard" | "experimental" | "locked";
  defaultBranch: string;
  autoRunTests: boolean;
}

const SETTINGS_DIR = path.join(process.cwd(), "data", "settings");
if (!fs.existsSync(SETTINGS_DIR)) {
  fs.mkdirSync(SETTINGS_DIR, { recursive: true });
}

class SecureSettingsStore {
  private readJSON<T>(filename: string, fallback: T): T {
    const filePath = path.join(SETTINGS_DIR, filename);
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
      }
    } catch (error) {
      console.error(`[settingsStore] Failed to read ${filename}`, error);
    }
    return fallback;
  }

  private writeJSON<T>(filename: string, data: T): void {
    const filePath = path.join(SETTINGS_DIR, filename);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      console.error(`[settingsStore] Failed to write ${filename}`, error);
      throw error;
    }
  }

  // GitHub App Settings
  async getGitHubApp(): Promise<GitHubAppSettings> {
    return this.readJSON<GitHubAppSettings>("github-app.json", {
      appId: "",
      clientId: "",
      installations: [],
      webhookUrl: "",
      enableAutoCommit: false,
      enablePRCreation: true,
      enableIssueSync: true,
      defaultBranch: "main",
      commitMessagePrefix: "[AI]",
    });
  }

  async updateGitHubApp(update: Partial<GitHubAppSettings>): Promise<GitHubAppSettings> {
    const current = await this.getGitHubApp();
    const merged: GitHubAppSettings = {
      ...current,
      ...update,
      installations: update.installations ?? current.installations ?? [],
      defaultBranch: update.defaultBranch || current.defaultBranch || "main",
      commitMessagePrefix: update.commitMessagePrefix || current.commitMessagePrefix || "[AI]",
    };
    this.writeJSON("github-app.json", merged);
    return merged;
  }

  // Orchestrator Settings
  async getOrchestrator(): Promise<OrchestratorSettings> {
    return this.readJSON<OrchestratorSettings>("orchestrator.json", {
      domainSelectionThreshold: 0.72,
      maxDomainsPerQuery: 3,
      enableParallelInference: true,
      enableContextEnhancement: true,
      enableKnowledgeRetrieval: true,
      performance: {
        maxConcurrentRequests: 8,
        requestTimeoutMs: 30000,
        cacheMaxSize: 1000,
      },
      reasoning: { maxReasoningSteps: 10 },
      hybridMode: {
        enabled: true,
        routingStrategy: "auto",
        minConfidence: 0.72,
        enforceCriticalPath: true,
        allowUserOverride: true,
        triggerWords: [],
        speech: {
          enabled: true,
          enableSTT: true,
          enableTTS: true,
          defaultVoice: "orion",
          availableVoices: ["orion", "solara", "lumen"],
          preferredLanguages: ["en-US"],
        },
        auditLogging: {
          enabled: true,
          redactAudio: true,
          retainTranscriptsInDays: 30,
        },
      },
    });
  }

  async updateOrchestrator(update: Partial<OrchestratorSettings>): Promise<OrchestratorSettings> {
    const current = await this.getOrchestrator();
    const merged: OrchestratorSettings = {
      ...current,
      ...update,
      performance: { ...current.performance, ...update.performance },
      reasoning: { ...current.reasoning, ...update.reasoning },
      hybridMode: { ...current.hybridMode, ...update.hybridMode },
    };
    this.writeJSON("orchestrator.json", merged);
    return merged;
  }

  // IDE Mode
  async getIDEMode(): Promise<IDEModeSettings> {
    return this.readJSON<IDEModeSettings>("ide-mode.json", {
      enabled: true,
      mode: "standard",
      defaultBranch: "main",
      autoRunTests: false,
    });
  }

  async updateIDEMode(update: Partial<IDEModeSettings>): Promise<IDEModeSettings> {
    const current = await this.getIDEMode();
    const merged: IDEModeSettings = { ...current, ...update } as IDEModeSettings;
    this.writeJSON("ide-mode.json", merged);
    return merged;
  }
}

export const settingsStore = new SecureSettingsStore();
