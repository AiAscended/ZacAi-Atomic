/**
 * File: src/ai/tests/orchestration/mainOrchestrator.test.ts
 * Purpose: Test main AI orchestration system for production readiness
 * Tests: Input processing, domain routing, model inference, response synthesis
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { MainOrchestrator } from '../../orchestration/mainOrchestrator';

describe('MainOrchestrator - Production Tests', () => {
  let orchestrator: MainOrchestrator;

  beforeAll(async () => {
    orchestrator = MainOrchestrator.getInstance();
    await orchestrator.initialize();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      expect(orchestrator).toBeDefined();
    });

    it('should have domains available', async () => {
      const domains = orchestrator.getAvailableDomains();
      expect(domains.length).toBeGreaterThan(0);
      expect(domains).toContain('general_knowledge');
    });

    it('should have models available', async () => {
      const models = orchestrator.getAvailableModels();
      expect(models.length).toBeGreaterThan(0);
    });
  });

  describe('Prompt Processing Pipeline', () => {
    it('should process simple text query', async () => {
      const response = await orchestrator.processPrompt('Hello, how are you?');
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
      expect(typeof response.text).toBe('string');
      expect(response.confidence).toBeGreaterThanOrEqual(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
    });

    it('should route programming queries to programming domain', async () => {
      const response = await orchestrator.processPrompt(
        'How do I create a React component?'
      );
      
      expect(response.domains).toBeDefined();
      expect(
        response.domains.some(d => ['react', 'programming'].includes(d))
      ).toBe(true);
    });

    it('should route mathematical queries to mathematics domain', async () => {
      const response = await orchestrator.processPrompt(
        'What is the derivative of x^2?'
      );
      
      expect(response.domains).toBeDefined();
      expect(response.domains).toContain('mathematics');
    });

    it('should handle multi-domain queries', async () => {
      const response = await orchestrator.processPrompt(
        'Explain React hooks using mathematical concepts'
      );
      
      expect(response.domains).toBeDefined();
      expect(response.domains.length).toBeGreaterThan(1);
    });
  });

  describe('Response Quality', () => {
    it('should include metadata in response', async () => {
      const response = await orchestrator.processPrompt('Test query');
      
      expect(response.metadata).toBeDefined();
      expect(response.metadata.processingTime).toBeDefined();
    });

    it('should track thinking steps', async () => {
      const response = await orchestrator.processPrompt(
        'Complex query requiring multiple steps'
      );
      
      expect(response.metadata.thinkingSteps).toBeDefined();
      expect(Array.isArray(response.metadata.thinkingSteps)).toBe(true);
    });

    it('should generate coherent responses', async () => {
      const response = await orchestrator.processPrompt('What is TypeScript?');
      
      expect(response.text.length).toBeGreaterThan(50);
      expect(response.text).toMatch(/TypeScript/i);
    });

    it('should handle context and history', async () => {
      const sessionId = 'test-session-001';
      
      const response1 = await orchestrator.processPrompt(
        'My name is Alice',
        sessionId
      );
      expect(response1).toBeDefined();
      
      const response2 = await orchestrator.processPrompt(
        'What is my name?',
        sessionId
      );
      expect(response2.text).toMatch(/Alice/i);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty prompts gracefully', async () => {
      const response = await orchestrator.processPrompt('');
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
    });

    it('should handle very long prompts', async () => {
      const longPrompt = 'Test '.repeat(1000);
      const response = await orchestrator.processPrompt(longPrompt);
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
    });

    it('should handle special characters', async () => {
      const response = await orchestrator.processPrompt(
        '!@#$%^&*()_+ Test <>&"\''
      );
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
    });
  });

  describe('Performance Metrics', () => {
    it('should complete processing within reasonable time', async () => {
      const startTime = Date.now();
      await orchestrator.processPrompt('Quick test');
      const duration = Date.now() - startTime;
      
      // Should complete within 10 seconds for production
      expect(duration).toBeLessThan(10000);
    });

    it('should track inference metrics', async () => {
      const response = await orchestrator.processPrompt('Test metrics');
      
      expect(response.metadata.processingTime).toBeDefined();
      expect(response.metadata.tokensUsed).toBeDefined();
      expect(response.metadata.modelsInvoked).toBeDefined();
    });
  });
});
