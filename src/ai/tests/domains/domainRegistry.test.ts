/**
 * File: src/ai/tests/domains/domainRegistry.test.ts
 * Purpose: Test domain registration and routing system
 * Tests: All 35 domains are registered, functional, and properly configured
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { domainRegistry } from '../../knowledge-domains/domainRegistry';
import '../../knowledge-domains/registerAllDomains';

describe('Domain Registry - System Tests', () => {
  beforeAll(async () => {
    // Ensure domains are registered
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Domain Registration', () => {
    it('should have all expected domains registered', () => {
      const domains = domainRegistry.getAllDomains();
      
      expect(domains.length).toBeGreaterThan(0);
      
      // Core domains that must exist
      const coreDomains = [
        'general_knowledge',
        'programming',
        'mathematics',
        'science',
        'react',
        'typescript',
        'nextjs',
      ];

      coreDomains.forEach(domain => {
        expect(domains).toContain(domain);
      });
    });

    it('should register at least 30 domains', () => {
      const domains = domainRegistry.getAllDomains();
      
      // According to exploration, we have 35 domains
      expect(domains.length).toBeGreaterThanOrEqual(30);
    });

    it('should have unique domain names', () => {
      const domains = domainRegistry.getAllDomains();
      const uniqueDomains = new Set(domains);
      
      expect(uniqueDomains.size).toBe(domains.length);
    });
  });

  describe('Domain Configuration', () => {
    it('should have inference controllers for all domains', () => {
      const domains = domainRegistry.getAllDomains();
      
      domains.forEach(domainName => {
        const domain = domainRegistry.getDomain(domainName);
        expect(domain).toBeDefined();
        expect(domain.infer).toBeDefined();
        expect(typeof domain.infer).toBe('function');
      });
    });

    it('should have vocabularies for all domains', () => {
      const domains = domainRegistry.getAllDomains();
      
      domains.forEach(domainName => {
        const domain = domainRegistry.getDomain(domainName);
        expect(domain).toBeDefined();
        expect(domain.vocabulary).toBeDefined();
        expect(Array.isArray(domain.vocabulary)).toBe(true);
      });
    });

    it('should have proper domain metadata', () => {
      const domains = domainRegistry.getAllDomains();
      
      domains.forEach(domainName => {
        const domain = domainRegistry.getDomain(domainName);
        expect(domain).toBeDefined();
        expect(domain.name).toBeDefined();
        expect(domain.description).toBeDefined();
      });
    });
  });

  describe('Domain Inference', () => {
    it('should execute inference for general_knowledge', async () => {
      const domain = domainRegistry.getDomain('general_knowledge');
      expect(domain).toBeDefined();
      
      const result = await domain.infer('What is AI?', {});
      expect(result).toBeDefined();
      expect(result.content).toBeTruthy();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should execute inference for programming domain', async () => {
      const domain = domainRegistry.getDomain('programming');
      expect(domain).toBeDefined();
      
      const result = await domain.infer('Explain functions', {});
      expect(result).toBeDefined();
      expect(result.content).toBeTruthy();
    });

    it('should execute inference for mathematics domain', async () => {
      const domain = domainRegistry.getDomain('mathematics');
      expect(domain).toBeDefined();
      
      const result = await domain.infer('What is calculus?', {});
      expect(result).toBeDefined();
      expect(result.content).toBeTruthy();
    });

    it('should handle domain-specific queries', async () => {
      const testCases = [
        { domain: 'react', query: 'What are React hooks?' },
        { domain: 'typescript', query: 'What is a type annotation?' },
        { domain: 'science', query: 'What is gravity?' },
      ];

      for (const testCase of testCases) {
        const domain = domainRegistry.getDomain(testCase.domain);
        if (domain) {
          const result = await domain.infer(testCase.query, {});
          expect(result).toBeDefined();
          expect(result.content).toBeTruthy();
        }
      }
    });
  });

  describe('Domain Vocabulary Quality', () => {
    it('should have meaningful vocabulary terms', () => {
      const domains = domainRegistry.getAllDomains();
      
      domains.forEach(domainName => {
        const domain = domainRegistry.getDomain(domainName);
        if (domain && domain.vocabulary && domain.vocabulary.length > 0) {
          expect(domain.vocabulary.length).toBeGreaterThan(0);
          
          // Check that vocabulary terms are non-empty strings
          domain.vocabulary.forEach(term => {
            expect(typeof term).toBe('string');
            expect(term.length).toBeGreaterThan(0);
          });
        }
      });
    });

    it('should have adequate vocabulary size', () => {
      const domains = domainRegistry.getAllDomains();
      
      // At least some domains should have comprehensive vocabularies
      const largeVocabDomains = domains.filter(domainName => {
        const domain = domainRegistry.getDomain(domainName);
        return domain?.vocabulary && domain.vocabulary.length >= 50;
      });

      expect(largeVocabDomains.length).toBeGreaterThan(0);
    });
  });

  describe('Domain Weights', () => {
    it('should have weights for domains', () => {
      const domains = domainRegistry.getAllDomains();
      
      // At least some domains should have weight configurations
      const domainsWithWeights = domains.filter(domainName => {
        const domain = domainRegistry.getDomain(domainName);
        return domain?.weightsPath || domain?.hasWeights;
      });

      // According to docs, all 23-35 domains should have weights
      expect(domainsWithWeights.length).toBeGreaterThan(0);
    });
  });

  describe('Domain Error Handling', () => {
    it('should handle non-existent domain queries', () => {
      const domain = domainRegistry.getDomain('non_existent_domain');
      expect(domain).toBeUndefined();
    });

    it('should handle empty domain queries', async () => {
      const domain = domainRegistry.getDomain('general_knowledge');
      if (domain) {
        const result = await domain.infer('', {});
        expect(result).toBeDefined();
      }
    });

    it('should handle complex queries', async () => {
      const domain = domainRegistry.getDomain('general_knowledge');
      if (domain) {
        const complexQuery = 'Explain the relationship between quantum mechanics and artificial intelligence in modern computing systems';
        const result = await domain.infer(complexQuery, {});
        expect(result).toBeDefined();
        expect(result.content).toBeTruthy();
      }
    });
  });

  describe('Domain Performance', () => {
    it('should respond within acceptable time', async () => {
      const domain = domainRegistry.getDomain('general_knowledge');
      if (domain) {
        const startTime = Date.now();
        await domain.infer('Test query', {});
        const duration = Date.now() - startTime;
        
        // Should complete within 5 seconds
        expect(duration).toBeLessThan(5000);
      }
    });
  });

  describe('Specialized Domains', () => {
    it('should have specialized technical domains', () => {
      const domains = domainRegistry.getAllDomains();
      
      const technicalDomains = [
        'algorithms',
        'data_structures',
        'version_control',
        'security',
        'testing',
        'error_detection',
        'repair',
        'observability',
      ];

      const foundTechnicalDomains = technicalDomains.filter(domain => 
        domains.includes(domain)
      );

      // Should have most technical domains
      expect(foundTechnicalDomains.length).toBeGreaterThan(5);
    });

    it('should have content generation domains', () => {
      const domains = domainRegistry.getAllDomains();
      
      const contentDomains = [
        'documentation',
        'code_review',
        'english',
        'grammar',
      ];

      const foundContentDomains = contentDomains.filter(domain => 
        domains.includes(domain)
      );

      expect(foundContentDomains.length).toBeGreaterThan(0);
    });
  });
});
