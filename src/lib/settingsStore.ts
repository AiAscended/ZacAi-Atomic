/**
 * Settings Store - Persistent Storage for All Admin Settings
 * 
 * Provides a centralized store for:
 * - System settings (timezone, location, preferences)
 * - Domain configurations (all 23 knowledge domains)
 * - Model settings (all 13 AI models)
 * - User preferences
 * - Training configurations
 * 
 * Storage: JSON files in /data/settings/ directory
 * Future: Migrate to PostgreSQL/MongoDB for production
 */

import * as fs from 'fs';
import * as path from 'path';

const SETTINGS_DIR = path.join(process.cwd(), 'data', 'settings');

// Ensure settings directory exists
if (!fs.existsSync(SETTINGS_DIR)) {
  fs.mkdirSync(SETTINGS_DIR, { recursive: true });
}

export interface SystemSettings {
  systemName: string;
  timezone: string;
  location: string;
  maxConcurrentRequests: number;
  requestTimeout: number;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  theme: 'light' | 'dark' | 'system';
  updatedAt: string;
}

export interface DomainSettings {
  enabled: boolean;
  confidenceThreshold: number;
  maxTokens: number;
  temperature: number;
  description: string;
  keywords: string[];
  priority: number;
  updatedAt: string;
}

export interface ModelSettings {
  enabled: boolean;
  type: string;
  parameters: Record<string, any>;
  performance: {
    maxLatency: number;
    cacheEnabled: boolean;
  };
  updatedAt: string;
}

export interface UserSettings {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'system';
  preferences: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

class SettingsStore {
  private readJSON<T>(filename: string, defaultValue: T): T {
    const filePath = path.join(SETTINGS_DIR, filename);
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data) as T;
      }
    } catch (error) {
      console.error(`[SettingsStore] Error reading ${filename}:`, error);
    }
    return defaultValue;
  }

  private writeJSON<T>(filename: string, data: T): void {
    const filePath = path.join(SETTINGS_DIR, filename);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error(`[SettingsStore] Error writing ${filename}:`, error);
      throw error;
    }
  }

  // System Settings
  getSystemSettings(): SystemSettings {
    return this.readJSON<SystemSettings>('system.json', {
      systemName: 'ZacAi-Atomic',
      timezone: 'America/New_York',
      location: 'United States',
      maxConcurrentRequests: 10,
      requestTimeout: 30000,
      enableLogging: true,
      logLevel: 'info',
      theme: 'system',
      updatedAt: new Date().toISOString(),
    });
  }

  saveSystemSettings(settings: Partial<SystemSettings>): SystemSettings {
    const current = this.getSystemSettings();
    const updated = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    this.writeJSON('system.json', updated);
    return updated;
  }

  // Domain Settings
  getDomainSettings(domainName: string): DomainSettings {
    const allDomains = this.readJSON<Record<string, DomainSettings>>('domains.json', {});
    return allDomains[domainName] || {
      enabled: true,
      confidenceThreshold: 0.6,
      maxTokens: 2048,
      temperature: 0.7,
      description: '',
      keywords: [],
      priority: 5,
      updatedAt: new Date().toISOString(),
    };
  }

  saveDomainSettings(domainName: string, settings: Partial<DomainSettings>): DomainSettings {
    const allDomains = this.readJSON<Record<string, DomainSettings>>('domains.json', {});
    const current = allDomains[domainName] || this.getDomainSettings(domainName);
    const updated = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    allDomains[domainName] = updated;
    this.writeJSON('domains.json', allDomains);
    return updated;
  }

  getAllDomains(): Record<string, DomainSettings> {
    return this.readJSON<Record<string, DomainSettings>>('domains.json', {});
  }

  // Model Settings
  getModelSettings(modelName: string): ModelSettings {
    const allModels = this.readJSON<Record<string, ModelSettings>>('models.json', {});
    return allModels[modelName] || {
      enabled: true,
      type: 'inference',
      parameters: {},
      performance: {
        maxLatency: 5000,
        cacheEnabled: true,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  saveModelSettings(modelName: string, settings: Partial<ModelSettings>): ModelSettings {
    const allModels = this.readJSON<Record<string, ModelSettings>>('models.json', {});
    const current = allModels[modelName] || this.getModelSettings(modelName);
    const updated = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    allModels[modelName] = updated;
    this.writeJSON('models.json', allModels);
    return updated;
  }

  getAllModels(): Record<string, ModelSettings> {
    return this.readJSON<Record<string, ModelSettings>>('models.json', {});
  }

  // User Settings
  getUser(userId: string): UserSettings | null {
    const allUsers = this.readJSON<Record<string, UserSettings>>('users.json', {});
    return allUsers[userId] || null;
  }

  saveUser(user: UserSettings): UserSettings {
    const allUsers = this.readJSON<Record<string, UserSettings>>('users.json', {});
    const updated = {
      ...user,
      updatedAt: new Date().toISOString(),
    };
    allUsers[user.id] = updated;
    this.writeJSON('users.json', allUsers);
    return updated;
  }

  getAllUsers(): UserSettings[] {
    const allUsers = this.readJSON<Record<string, UserSettings>>('users.json', {});
    return Object.values(allUsers);
  }

  deleteUser(userId: string): boolean {
    const allUsers = this.readJSON<Record<string, UserSettings>>('users.json', {});
    if (allUsers[userId]) {
      delete allUsers[userId];
      this.writeJSON('users.json', allUsers);
      return true;
    }
    return false;
  }
}

export const settingsStore = new SettingsStore();
