/**
 * File: src/__tests__/admin-settings.test.ts
 * Purpose: Basic tests for admin settings functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateSystemSettings,
  validateOrchestratorSettings,
  validateGitHubAppSettings,
  validateIDEModeSettings,
  redactSecrets,
} from '../ai/shared/validation/settingsSchemas';
import {
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_ORCHESTRATOR_SETTINGS,
  DEFAULT_GITHUB_APP_SETTINGS,
  DEFAULT_IDE_MODE_SETTINGS,
} from '../ai/shared/types/adminSettings';

describe('Admin Settings Validation', () => {
  describe('System Settings', () => {
    it('should validate default system settings', () => {
      const result = validateSystemSettings(DEFAULT_SYSTEM_SETTINGS);
      expect(result.success).toBe(true);
    });

    it('should reject invalid log level', () => {
      const invalid = {
        ...DEFAULT_SYSTEM_SETTINGS,
        general: {
          ...DEFAULT_SYSTEM_SETTINGS.general,
          logLevel: 'invalid',
        },
      };
      const result = validateSystemSettings(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Orchestrator Settings', () => {
    it('should validate default orchestrator settings', () => {
      const result = validateOrchestratorSettings(DEFAULT_ORCHESTRATOR_SETTINGS);
      expect(result.success).toBe(true);
    });

    it('should reject invalid threshold (out of range)', () => {
      const invalid = {
        ...DEFAULT_ORCHESTRATOR_SETTINGS,
        domainSelectionThreshold: 1.5, // Must be 0-1
      };
      const result = validateOrchestratorSettings(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('GitHub App Settings', () => {
    it('should validate default GitHub App settings', () => {
      const result = validateGitHubAppSettings(DEFAULT_GITHUB_APP_SETTINGS);
      expect(result.success).toBe(true);
    });

    it('should require appId and clientId', () => {
      const invalid = {
        ...DEFAULT_GITHUB_APP_SETTINGS,
        appId: '',
      };
      const result = validateGitHubAppSettings(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('IDE Mode Settings', () => {
    it('should validate default IDE mode settings', () => {
      const result = validateIDEModeSettings(DEFAULT_IDE_MODE_SETTINGS);
      expect(result.success).toBe(true);
    });

    it('should enforce font size range', () => {
      const invalid = {
        ...DEFAULT_IDE_MODE_SETTINGS,
        editor: {
          ...DEFAULT_IDE_MODE_SETTINGS.editor,
          fontSize: 50, // Max is 32
        },
      };
      const result = validateIDEModeSettings(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Secret Redaction', () => {
    it('should redact sensitive fields', () => {
      const settings = {
        appId: '123456',
        privateKey: 'secret-key-data',
        webhookSecret: 'webhook-secret',
        regularField: 'visible-data',
      };

      const redacted = redactSecrets(settings);

      expect(redacted.appId).toBe('123456');
      expect(redacted.regularField).toBe('visible-data');
      expect(redacted.privateKey).toBe('***REDACTED***');
      expect(redacted.webhookSecret).toBe('***REDACTED***');
    });

    it('should recursively redact nested secrets', () => {
      const settings = {
        public: 'visible',
        nested: {
          apiKey: 'secret-api-key',
          normalField: 'visible',
        },
      };

      const redacted = redactSecrets(settings);

      expect(redacted.public).toBe('visible');
      expect(redacted.nested.normalField).toBe('visible');
      expect(redacted.nested.apiKey).toBe('***REDACTED***');
    });
  });
});
