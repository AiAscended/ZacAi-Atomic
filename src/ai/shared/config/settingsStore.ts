/**
 * File: src/ai/shared/config/settingsStore.ts
 * Purpose: Persistent storage for admin settings with encryption support
 * 
 * Features:
 * - Read/write settings to filesystem (JSON)
 * - Encrypt sensitive fields (privateKey, webhookSecret)
 * - Load from environment variables as fallback
 * - Type-safe access to all settings
 */

import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";
import type {
  AdminSettings,
  SystemSettings,
  OrchestratorSettings,
  DomainSettings,
  GitHubAppSettings,
  IDEModeSettings,
  ModelSettings,
} from "../types/adminSettings";
import {
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_ORCHESTRATOR_SETTINGS,
  DEFAULT_IDE_MODE_SETTINGS,
  DEFAULT_GITHUB_APP_SETTINGS,
} from "../types/adminSettings";

// ============================================================================
// Constants
// ============================================================================

const SETTINGS_DIR = path.join(process.cwd(), ".config");
const SETTINGS_FILE = path.join(SETTINGS_DIR, "admin-settings.json");
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || "default-dev-key-change-in-production";
const ALGORITHM = "aes-256-cbc";

// ============================================================================
// Encryption Utilities
// ============================================================================

function encrypt(text: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  return `${iv.toString("hex")}:${encrypted}`;
}

function decrypt(encryptedText: string): string {
  try {
    const [ivHex, encrypted] = encryptedText.split(":");
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return "";
  }
}

// ============================================================================
// Settings Store Class
// ============================================================================

export class SettingsStore {
  private settings: AdminSettings | null = null;
  private initialized = false;

  /**
   * Initialize the settings store - creates directory and loads settings
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await fs.mkdir(SETTINGS_DIR, { recursive: true });
      await this.load();
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize settings store:", error);
      this.settings = this.getDefaultSettings();
      this.initialized = true;
    }
  }

  /**
   * Get default settings structure
   */
  private getDefaultSettings(): AdminSettings {
    return {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      system: DEFAULT_SYSTEM_SETTINGS,
      orchestrator: DEFAULT_ORCHESTRATOR_SETTINGS,
      domains: {},
      githubApp: DEFAULT_GITHUB_APP_SETTINGS,
      ideMode: DEFAULT_IDE_MODE_SETTINGS,
      models: {},
    };
  }

  /**
   * Load settings from file or create default
   */
  private async load(): Promise<void> {
    try {
      const fileContent = await fs.readFile(SETTINGS_FILE, "utf8");
      const parsed = JSON.parse(fileContent);
      
      // Decrypt sensitive fields
      if (parsed.githubApp?.privateKey) {
        parsed.githubApp.privateKey = decrypt(parsed.githubApp.privateKey);
      }
      if (parsed.githubApp?.webhookSecret) {
        parsed.githubApp.webhookSecret = decrypt(parsed.githubApp.webhookSecret);
      }
      
      this.settings = parsed;
    } catch (error) {
      // File doesn't exist or is invalid, create default
      this.settings = this.getDefaultSettings();
      await this.save();
    }
  }

  /**
   * Save settings to file with encryption
   */
  private async save(): Promise<void> {
    if (!this.settings) {
      throw new Error("Settings not initialized");
    }

    const toSave = JSON.parse(JSON.stringify(this.settings));
    toSave.lastUpdated = new Date().toISOString();

    // Encrypt sensitive fields before saving
    if (toSave.githubApp?.privateKey) {
      toSave.githubApp.privateKey = encrypt(toSave.githubApp.privateKey);
    }
    if (toSave.githubApp?.webhookSecret) {
      toSave.githubApp.webhookSecret = encrypt(toSave.githubApp.webhookSecret);
    }

    await fs.writeFile(SETTINGS_FILE, JSON.stringify(toSave, null, 2), "utf8");
  }

  /**
   * Get all settings
   */
  async getAll(): Promise<AdminSettings> {
    await this.initialize();
    if (!this.settings) {
      throw new Error("Settings not initialized");
    }
    return this.settings;
  }

  /**
   * Get training settings
   */
  async getTraining(): Promise<any> {
    const all = await this.getAll();
    return (all as any).training || {
      enableAutoTraining: false,
      trainingFrequency: 'daily',
      trainingHour: 2,
      minConfidenceForTraining: 0.7,
      maxTrainingSamples: 1000,
      batchSize: 32,
      epochs: 10,
      learningRate: 0.001,
      tokenizerType: 'bpe',
      embeddingDim: 512,
      numLayers: 6,
      numHeads: 8,
      enableGradientClipping: true,
      gradientClipValue: 1.0,
      enableEarlyStopping: true,
      earlyStoppingPatience: 3,
      validationSplit: 0.2,
      enableMetricsCollection: true,
      metricsRetentionDays: 30,
      enableSystemAwareness: true,
      lastTrainingRun: null,
      nextScheduledRun: null,
    };
  }

  /**
   * Update training settings
   */
  async updateTraining(updates: any): Promise<any> {
    await this.initialize();
    if (!this.settings) throw new Error("Settings not initialized");

    const current = await this.getTraining();
    (this.settings as any).training = {
      ...current,
      ...updates,
    };
    
    await this.save();
    return (this.settings as any).training;
  }

  /**
   * Get system settings
   */
  async getSystem(): Promise<SystemSettings> {
    const all = await this.getAll();
    return all.system;
  }

  /**
   * Update system settings
   */
  async updateSystem(updates: Partial<SystemSettings>): Promise<SystemSettings> {
    await this.initialize();
    if (!this.settings) throw new Error("Settings not initialized");

    this.settings.system = {
      ...this.settings.system,
      ...updates,
    };
    
    await this.save();
    return this.settings.system;
  }

  /**
   * Get orchestrator settings
   */
  async getOrchestrator(): Promise<OrchestratorSettings> {
    const all = await this.getAll();
    return all.orchestrator;
  }

  /**
   * Update orchestrator settings
   */
  async updateOrchestrator(updates: Partial<OrchestratorSettings>): Promise<OrchestratorSettings> {
    await this.initialize();
    if (!this.settings) throw new Error("Settings not initialized");

    this.settings.orchestrator = {
      ...this.settings.orchestrator,
      ...updates,
    };
    
    await this.save();
    return this.settings.orchestrator;
  }

  /**
   * Get domain settings
   */
  async getDomain(domainId: string): Promise<DomainSettings | null> {
    const all = await this.getAll();
    return all.domains[domainId] || null;
  }

  /**
   * Get all domain settings
   */
  async getAllDomains(): Promise<Record<string, DomainSettings>> {
    const all = await this.getAll();
    return all.domains;
  }

  /**
   * Update domain settings
   */
  async updateDomain(domainId: string, updates: Partial<DomainSettings>): Promise<DomainSettings> {
    await this.initialize();
    if (!this.settings) throw new Error("Settings not initialized");

    const existing = this.settings.domains[domainId] || {
      domainId,
      enabled: true,
      inference: {
        confidenceThreshold: 0.7,
        tokenMatchWeight: 0.5,
        semanticWeight: 0.5,
        temperature: 0.7,
        topP: 0.9,
        maxTokens: 2048,
        frequencyPenalty: 0,
      },
      training: {
        enableAutoTraining: false,
        minTrainingExamples: 100,
        validationSplit: 0.2,
      },
      seeds: {
        version: "1.0.0",
        customVocabulary: [],
      },
    };

    this.settings.domains[domainId] = {
      ...existing,
      ...updates,
    };
    
    await this.save();
    return this.settings.domains[domainId];
  }

  /**
   * Get GitHub App settings (with env var fallback)
   */
  async getGitHubApp(): Promise<GitHubAppSettings> {
    const all = await this.getAll();
    
    // Prefer environment variables for secrets
    return {
      ...all.githubApp,
      appId: process.env.GITHUB_APP_ID || all.githubApp.appId,
      clientId: process.env.GITHUB_APP_CLIENT_ID || all.githubApp.clientId,
      webhookSecret: process.env.GITHUB_APP_WEBHOOK_SECRET || all.githubApp.webhookSecret,
    };
  }

  /**
   * Update GitHub App settings (metadata only, not secrets)
   */
  async updateGitHubApp(updates: Partial<GitHubAppSettings>): Promise<GitHubAppSettings> {
    await this.initialize();
    if (!this.settings) throw new Error("Settings not initialized");

    // Don't persist secrets if they're from env vars
    const updatesCopy = { ...updates };
    if (process.env.GITHUB_APP_ID) delete updatesCopy.appId;
    if (process.env.GITHUB_APP_CLIENT_ID) delete updatesCopy.clientId;
    if (process.env.GITHUB_APP_WEBHOOK_SECRET) delete updatesCopy.webhookSecret;

    this.settings.githubApp = {
      ...this.settings.githubApp,
      ...updatesCopy,
    };
    
    await this.save();
    return this.getGitHubApp(); // Return with env vars applied
  }

  /**
   * Get IDE mode settings
   */
  async getIDEMode(): Promise<IDEModeSettings> {
    const all = await this.getAll();
    return all.ideMode;
  }

  /**
   * Update IDE mode settings
   */
  async updateIDEMode(updates: Partial<IDEModeSettings>): Promise<IDEModeSettings> {
    await this.initialize();
    if (!this.settings) throw new Error("Settings not initialized");

    this.settings.ideMode = {
      ...this.settings.ideMode,
      ...updates,
    };
    
    await this.save();
    return this.settings.ideMode;
  }

  /**
   * Get model settings
   */
  async getModel(modelId: string): Promise<ModelSettings | null> {
    const all = await this.getAll();
    return all.models[modelId] || null;
  }

  /**
   * Get all model settings
   */
  async getAllModels(): Promise<Record<string, ModelSettings>> {
    const all = await this.getAll();
    return all.models;
  }

  /**
   * Update model settings
   */
  async updateModel(modelId: string, updates: Partial<ModelSettings>): Promise<ModelSettings> {
    await this.initialize();
    if (!this.settings) throw new Error("Settings not initialized");

    const existing = this.settings.models[modelId];
    if (!existing) {
      throw new Error(`Model ${modelId} not found`);
    }

    this.settings.models[modelId] = {
      ...existing,
      ...updates,
    };
    
    await this.save();
    return this.settings.models[modelId];
  }

  /**
   * Export all settings (for backup/migration)
   */
  async exportSettings(): Promise<string> {
    const all = await this.getAll();
    return JSON.stringify(all, null, 2);
  }

  /**
   * Import settings (from backup/migration)
   */
  async importSettings(settingsJson: string): Promise<void> {
    await this.initialize();
    
    const imported = JSON.parse(settingsJson);
    this.settings = imported;
    
    await this.save();
  }

  /**
   * Reset to defaults
   */
  async resetToDefaults(): Promise<void> {
    await this.initialize();
    this.settings = this.getDefaultSettings();
    await this.save();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const settingsStore = new SettingsStore();
