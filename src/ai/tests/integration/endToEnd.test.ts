/**
 * File: src/ai/tests/integration/endToEnd.test.ts
 * Purpose: End-to-end integration tests for the complete AI pipeline
 * Tests: Full flow from user input to AI response
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { MainOrchestrator } from '../../orchestration/mainOrchestrator';
import { domainRegistry } from '../../knowledge-domains/domainRegistry';
import '../../knowledge-domains/registerAllDomains';

describe('End-to-End AI Pipeline Integration', () => {
  let orchestrator: MainOrchestrator;

  beforeAll(async () => {
    orchestrator = MainOrchestrator.getInstance();
    await orchestrator.initialize();
  });

  describe('Complete Pipeline Flow', () => {
    it('should handle full pipeline: input → processing → output', async () => {
      const userInput = 'What is artificial intelligence?';
      
      const response = await orchestrator.processPrompt(userInput);
      
      // Verify complete response structure
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
      expect(response.text.length).toBeGreaterThan(50);
      expect(response.domains).toBeDefined();
      expect(Array.isArray(response.domains)).toBe(true);
      expect(response.confidence).toBeGreaterThanOrEqual(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
      expect(response.metadata).toBeDefined();
    });

    it('should maintain context across conversation', async () => {
      const sessionId = 'integration-test-session';
      
      // First message
      const response1 = await orchestrator.processPrompt(
        'I am learning React',
        sessionId
      );
      expect(response1).toBeDefined();
      
      // Second message referencing context
      const response2 = await orchestrator.processPrompt(
        'What are hooks in it?',
        sessionId
      );
      expect(response2).toBeDefined();
      expect(response2.text).toMatch(/hook/i);
    });

    it('should route to correct domains', async () => {
      const testCases = [
        {
          input: 'How do I use useState in React?',
          expectedDomains: ['react', 'programming'],
        },
        {
          input: 'What is the integral of x^2?',
          expectedDomains: ['mathematics'],
        },
        {
          input: 'Explain TypeScript generics',
          expectedDomains: ['typescript', 'programming'],
        },
      ];

      for (const testCase of testCases) {
        const response = await orchestrator.processPrompt(testCase.input);
        
        const hasExpectedDomain = testCase.expectedDomains.some(expected =>
          response.domains.some(actual => actual.includes(expected))
        );
        
        expect(hasExpectedDomain).toBe(true);
      }
    });
  });

  describe('Multi-Domain Integration', () => {
    it('should aggregate responses from multiple domains', async () => {
      const complexQuery = 'Explain how to build a React component that performs mathematical calculations';
      
      const response = await orchestrator.processPrompt(complexQuery);
      
      expect(response.domains.length).toBeGreaterThan(1);
      expect(response.text).toBeTruthy();
    });

    it('should weight domain contributions appropriately', async () => {
      const response = await orchestrator.processPrompt(
        'What is React and how does it relate to JavaScript?'
      );
      
      // Should primarily use React domain
      expect(response.domains).toContain('react');
      expect(response.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle code generation requests', async () => {
      const response = await orchestrator.processPrompt(
        'Generate a TypeScript function that sorts an array'
      );
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
      expect(
        response.domains.some(d => ['typescript', 'programming', 'algorithms'].includes(d))
      ).toBe(true);
    });

    it('should handle debugging queries', async () => {
      const response = await orchestrator.processPrompt(
        'Why does my React component re-render infinitely?'
      );
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
      expect(response.domains).toContain('react');
    });

    it('should handle documentation requests', async () => {
      const response = await orchestrator.processPrompt(
        'Write documentation for a REST API endpoint'
      );
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
    });

    it('should handle testing queries', async () => {
      const response = await orchestrator.processPrompt(
        'How do I write unit tests for a React component?'
      );
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
    });

    it('should handle security questions', async () => {
      const response = await orchestrator.processPrompt(
        'What are common security vulnerabilities in web applications?'
      );
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
    });
  });

  describe('Performance Requirements', () => {
    it('should respond within acceptable latency', async () => {
      const startTime = Date.now();
      await orchestrator.processPrompt('Quick test query');
      const duration = Date.now() - startTime;
      
      // Production requirement: < 10 seconds
      expect(duration).toBeLessThan(10000);
    });

    it('should handle concurrent requests', async () => {
      const queries = [
        'What is React?',
        'What is TypeScript?',
        'What is Next.js?',
      ];

      const startTime = Date.now();
      const responses = await Promise.all(
        queries.map(q => orchestrator.processPrompt(q))
      );
      const duration = Date.now() - startTime;

      expect(responses).toHaveLength(3);
      responses.forEach(response => {
        expect(response).toBeDefined();
        expect(response.text).toBeTruthy();
      });

      // Should handle concurrent requests efficiently
      expect(duration).toBeLessThan(30000);
    });

    it('should track processing metrics', async () => {
      const response = await orchestrator.processPrompt('Test metrics tracking');
      
      expect(response.metadata).toBeDefined();
      expect(response.metadata.processingTime).toBeDefined();
      expect(response.metadata.tokensUsed).toBeDefined();
      expect(response.metadata.domainsQueried).toBeDefined();
    });
  });

  describe('Error Recovery', () => {
    it('should handle empty inputs gracefully', async () => {
      const response = await orchestrator.processPrompt('');
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
    });

    it('should handle malformed inputs', async () => {
      const malformedInputs = [
        '<script>alert("xss")</script>',
        '!@#$%^&*()',
        '\\n\\t\\r',
      ];

      for (const input of malformedInputs) {
        const response = await orchestrator.processPrompt(input);
        expect(response).toBeDefined();
        expect(response.text).toBeTruthy();
      }
    });

    it('should recover from domain failures', async () => {
      // Even if some domains fail, should still produce response
      const response = await orchestrator.processPrompt('Test resilience');
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
    });
  });

  describe('Content Generation', () => {
    it('should generate structured text', async () => {
      const response = await orchestrator.processPrompt(
        'List the main features of React'
      );
      
      expect(response.text).toBeTruthy();
      expect(response.text.length).toBeGreaterThan(100);
    });

    it('should format code blocks when appropriate', async () => {
      const response = await orchestrator.processPrompt(
        'Show me a React component example'
      );
      
      expect(response).toBeDefined();
      
      // Check for code blocks if they exist
      if (response.contentBlocks?.codeBlocks) {
        expect(Array.isArray(response.contentBlocks.codeBlocks)).toBe(true);
      }
    });

    it('should include sources when available', async () => {
      const response = await orchestrator.processPrompt(
        'What is the latest version of React?'
      );
      
      expect(response).toBeDefined();
      if (response.sources) {
        expect(Array.isArray(response.sources)).toBe(true);
      }
    });
  });

  describe('System Health', () => {
    it('should have all domains operational', () => {
      const domains = domainRegistry.getAllDomains();
      
      expect(domains.length).toBeGreaterThan(0);
      
      // Verify critical domains
      const criticalDomains = [
        'general_knowledge',
        'programming',
        'react',
        'typescript',
      ];

      criticalDomains.forEach(domain => {
        expect(domains).toContain(domain);
      });
    });

    it('should have proper orchestrator state', () => {
      const domains = orchestrator.getAvailableDomains();
      const models = orchestrator.getAvailableModels();
      
      expect(domains.length).toBeGreaterThan(0);
      expect(models.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long prompts', async () => {
      const longPrompt = 'Explain React hooks. '.repeat(100);
      
      const response = await orchestrator.processPrompt(longPrompt);
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
    });

    it('should handle special characters', async () => {
      const response = await orchestrator.processPrompt(
        'How do I use <>& in React?'
      );
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
    });

    it('should handle multilingual inputs', async () => {
      const response = await orchestrator.processPrompt(
        'What is React? ¿Qué es React?'
      );
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
    });
  });
});
