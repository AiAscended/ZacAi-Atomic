/**
 * File: src/ai/tests/index.ts
 * Purpose: Central export for all AI system tests
 * Usage: Import test suites for programmatic execution
 */

// Export test metadata
export const AI_TEST_SUITES = {
  orchestration: {
    name: 'Orchestration Tests',
    description: 'Tests for main orchestrator and prompt processing',
    file: './orchestration/mainOrchestrator.test.ts',
  },
  inference: {
    name: 'Inference Engine Tests',
    description: 'Tests for neural network inference and forward passes',
    file: './inference/inferenceEngine.test.ts',
  },
  domains: {
    name: 'Domain Registry Tests',
    description: 'Tests for all 23 knowledge domains',
    file: './domains/domainRegistry.test.ts',
  },
  models: {
    name: 'Multi-Modal Model Tests',
    description: 'Tests for all AI model layers',
    file: './models/multiModalLayers.test.ts',
  },
  integration: {
    name: 'End-to-End Integration Tests',
    description: 'Complete AI pipeline tests',
    file: './integration/endToEnd.test.ts',
  },
};

export const TEST_CATEGORIES = {
  unit: ['orchestration', 'inference'],
  integration: ['domains', 'models', 'integration'],
  performance: ['inference', 'integration'],
  production: ['orchestration', 'domains', 'models', 'integration'],
};

export function getTestSuiteInfo(category?: keyof typeof TEST_CATEGORIES) {
  if (category) {
    const suites = TEST_CATEGORIES[category];
    return suites.map(key => AI_TEST_SUITES[key as keyof typeof AI_TEST_SUITES]);
  }
  return Object.values(AI_TEST_SUITES);
}
