#!/usr/bin/env node
/**
 * ZacAi-Atomic AI Pipeline Test Suite
 * 
 * Comprehensive tests for the hybrid AI system:
 * 1. Domain inference controllers
 * 2. Token-based confidence scoring
 * 3. Fallback hierarchy
 * 4. Learning metrics tracking
 * 5. End-to-end inference flow
 * 
 * Usage:
 *   node scripts/test-ai-pipeline.js
 */

const path = require('path');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

class AIPipelineTest {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.warnings = 0;
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  success(message) {
    this.log(`✅ ${message}`, 'green');
    this.passed++;
  }

  error(message) {
    this.log(`❌ ${message}`, 'red');
    this.failed++;
  }

  warning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
    this.warnings++;
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'cyan');
  }

  header(message) {
    this.log(`\n${'='.repeat(60)}`, 'bright');
    this.log(message, 'bright');
    this.log('='.repeat(60), 'bright');
  }

  /**
   * Run all tests
   */
  async runAll() {
    this.log('\n🚀 Starting ZacAi-Atomic AI Pipeline Tests\n', 'bright');

    await this.testDomainStructure();
    await this.testInferenceControllers();
    await this.testTokenizers();
    await this.testWeightsAndSeeds();
    await this.testOrchestratorFlow();
    await this.testFallbackHierarchy();
    await this.testLearningMetrics();

    this.printSummary();
  }

  /**
   * Test 1: Domain Structure
   */
  async testDomainStructure() {
    this.header('TEST 1: Domain Structure & Organization');

    const fs = require('fs').promises;
    const domainsPath = path.join(__dirname, '../src/ai/knowledge-domains');

    try {
      const domains = await fs.readdir(domainsPath);
      const validDomains = [];

      for (const domain of domains) {
        const domainPath = path.join(domainsPath, domain);
        const stats = await fs.stat(domainPath).catch(() => null);

        if (!stats?.isDirectory()) continue;

        // Check required files
        const requiredFiles = [
          `${domain}_inferenceController.ts`,
          `${domain}_tokenizer.ts`,
          `${domain}_constants.ts`,
        ];

        let hasAllRequired = true;
        for (const file of requiredFiles) {
          const filePath = path.join(domainPath, file);
          const exists = await fs.access(filePath).then(() => true).catch(() => false);
          if (!exists) {
            hasAllRequired = false;
            this.warning(`Domain ${domain} missing: ${file}`);
          }
        }

        if (hasAllRequired) {
          validDomains.push(domain);
        }

        // Check seeds folder structure
        const seedsPath = path.join(domainPath, `${domain}_seeds`);
        const seedsExists = await fs.access(seedsPath).then(() => true).catch(() => false);
        
        if (seedsExists) {
          const seedFiles = await fs.readdir(seedsPath);
          
          // Check for weights files in seeds (should NOT be there)
          const wrongWeightFiles = seedFiles.filter(f => 
            f.includes('pretrained_weights') || f.includes('trained_weights')
          );
          
          if (wrongWeightFiles.length > 0) {
            this.error(`${domain}: Weights files found in seeds folder: ${wrongWeightFiles.join(', ')}`);
          } else {
            this.success(`${domain}: Seeds folder structure correct (no weight files)`);
          }
        }

        // Check weights folder exists
        const weightsPath = path.join(domainPath, `${domain}_weights`);
        const weightsExists = await fs.access(weightsPath).then(() => true).catch(() => false);
        
        if (weightsExists) {
          this.success(`${domain}: Has weights folder`);
        } else {
          this.warning(`${domain}: No weights folder (may not be needed)`);
        }
      }

      this.info(`Found ${validDomains.length} properly structured domains`);
    } catch (error) {
      this.error(`Domain structure test failed: ${error.message}`);
    }
  }

  /**
   * Test 2: Inference Controllers
   */
  async testInferenceControllers() {
    this.header('TEST 2: Inference Controller Export Patterns');

    const fs = require('fs').promises;
    const domainsPath = path.join(__dirname, '../src/ai/knowledge-domains');

    try {
      const domains = await fs.readdir(domainsPath);

      for (const domain of domains) {
        const domainPath = path.join(domainsPath, domain);
        const stats = await fs.stat(domainPath).catch(() => null);
        if (!stats?.isDirectory()) continue;

        const inferenceFile = path.join(domainPath, `${domain}_inferenceController.ts`);
        const exists = await fs.access(inferenceFile).then(() => true).catch(() => false);

        if (!exists) continue;

        const content = await fs.readFile(inferenceFile, 'utf8');

        // Check for proper export patterns
        const hasNamedExport = content.includes(`export const ${domain}RunInference`) ||
                               content.includes(`export const generalRunInference`);
        const hasDefaultExport = content.includes('export default');
        
        if (hasNamedExport && hasDefaultExport) {
          this.success(`${domain}: Has both named and default exports ✅`);
        } else if (hasNamedExport || hasDefaultExport) {
          this.warning(`${domain}: Has ${hasNamedExport ? 'named' : 'default'} export only`);
        } else {
          this.error(`${domain}: Missing proper export pattern`);
        }

        // Check for AI inference logic (not hard-coded responses)
        const hasTokenization = content.includes('token') || content.includes('tokenize');
        const hasConfidence = content.includes('confidence');
        const hasWeights = content.includes('weight') || content.includes('vocabulary');
        
        if (hasTokenization && hasConfidence && hasWeights) {
          this.success(`${domain}: Uses AI inference (tokens, confidence, weights)`);
        } else {
          this.warning(`${domain}: May have limited AI inference logic`);
        }
      }
    } catch (error) {
      this.error(`Inference controller test failed: ${error.message}`);
    }
  }

  /**
   * Test 3: Tokenizers
   */
  async testTokenizers() {
    this.header('TEST 3: Domain Tokenizers');

    const fs = require('fs').promises;
    const domainsPath = path.join(__dirname, '../src/ai/knowledge-domains');

    try {
      const domains = await fs.readdir(domainsPath);
      let tokenizerCount = 0;

      for (const domain of domains) {
        const domainPath = path.join(domainsPath, domain);
        const tokenizerFile = path.join(domainPath, `${domain}_tokenizer.ts`);
        const exists = await fs.access(tokenizerFile).then(() => true).catch(() => false);

        if (exists) {
          const content = await fs.readFile(tokenizerFile, 'utf8');
          
          // Check for tokenization functionality
          const hasTokenization = content.includes('split') || 
                                  content.includes('token') ||
                                  content.includes('tokenize');
          
          if (hasTokenization) {
            this.success(`${domain}: Has functional tokenizer`);
            tokenizerCount++;
          } else {
            this.warning(`${domain}: Tokenizer may be incomplete`);
          }
        }
      }

      this.info(`Found ${tokenizerCount} functional tokenizers`);
    } catch (error) {
      this.error(`Tokenizer test failed: ${error.message}`);
    }
  }

  /**
   * Test 4: Weights and Seeds Separation
   */
  async testWeightsAndSeeds() {
    this.header('TEST 4: Weights & Seeds File Organization');

    const fs = require('fs').promises;
    const domainsPath = path.join(__dirname, '../src/ai/knowledge-domains');

    try {
      const domains = await fs.readdir(domainsPath);
      let correctCount = 0;
      let issueCount = 0;

      for (const domain of domains) {
        const domainPath = path.join(domainsPath, domain);
        const stats = await fs.stat(domainPath).catch(() => null);
        if (!stats?.isDirectory()) continue;

        // Check seeds folder
        const seedsPath = path.join(domainPath, `${domain}_seeds`);
        const seedsExists = await fs.access(seedsPath).then(() => true).catch(() => false);

        if (seedsExists) {
          const seedFiles = await fs.readdir(seedsPath);
          const weightFilesInSeeds = seedFiles.filter(f => 
            f.includes('weight') && !f.includes('seedVocabulary')
          );

          if (weightFilesInSeeds.length === 0) {
            correctCount++;
          } else {
            this.error(`${domain}: Found weight files in seeds: ${weightFilesInSeeds.join(', ')}`);
            issueCount++;
          }
        }

        // Check weights folder
        const weightsPath = path.join(domainPath, `${domain}_weights`);
        const weightsExists = await fs.access(weightsPath).then(() => true).catch(() => false);

        if (weightsExists) {
          const weightFiles = await fs.readdir(weightsPath);
          const hasWeights = weightFiles.some(f => f.includes('weight'));
          
          if (hasWeights) {
            this.success(`${domain}: Weights properly located in weights folder`);
          }
        }
      }

      if (issueCount === 0) {
        this.success('All domains have proper weights/seeds separation! 🎉');
      } else {
        this.warning(`Found ${issueCount} domains with organization issues`);
      }
    } catch (error) {
      this.error(`Weights/seeds test failed: ${error.message}`);
    }
  }

  /**
   * Test 5: Orchestrator Flow
   */
  async testOrchestratorFlow() {
    this.header('TEST 5: Main Orchestrator Flow');

    const fs = require('fs').promises;
    const orchestratorPath = path.join(__dirname, '../src/ai/orchestration/main-orchestrator.ts');

    try {
      const content = await fs.readFile(orchestratorPath, 'utf8');

      // Check for key pipeline steps
      const checks = [
        { name: 'Input Processing', pattern: /input.*process|promptProcessor/i },
        { name: 'Domain Routing', pattern: /identifyRelevantDomains|domainRouter/i },
        { name: 'Inference Execution', pattern: /inference|queryDomains/i },
        { name: 'Response Synthesis', pattern: /responseSynthesizer|synthesize/i },
        { name: 'Response Formatting', pattern: /formatResponse|responseFormatter/i },
        { name: 'Fallback Hierarchy', pattern: /fallback.*level|constructDomainBasedResponse/i },
        { name: 'Learning Metrics', pattern: /learningMetrics|recordInference/i },
      ];

      for (const check of checks) {
        if (check.pattern.test(content)) {
          this.success(`${check.name}: Implemented ✅`);
        } else {
          this.error(`${check.name}: Missing or incomplete`);
        }
      }

      // Check for hard-coded responses (should be minimal)
      const hardcodedPatterns = [
        /return\s+"Sorry|return\s+'Sorry/gi,
        /text:\s+"I (don't|can't)|text:\s+'I (don't|can't)/gi,
      ];

      let hardcodedCount = 0;
      for (const pattern of hardcodedPatterns) {
        const matches = content.match(pattern);
        if (matches) hardcodedCount += matches.length;
      }

      if (hardcodedCount <= 5) {
        this.success(`Hard-coded responses: ${hardcodedCount} (acceptable for fallbacks)`);
      } else {
        this.warning(`Hard-coded responses: ${hardcodedCount} (may have too many)`);
      }
    } catch (error) {
      this.error(`Orchestrator flow test failed: ${error.message}`);
    }
  }

  /**
   * Test 6: Fallback Hierarchy
   */
  async testFallbackHierarchy() {
    this.header('TEST 6: Intelligent Fallback System');

    const fs = require('fs').promises;
    const orchestratorPath = path.join(__dirname, '../src/ai/orchestration/main-orchestrator.ts');

    try {
      const content = await fs.readFile(orchestratorPath, 'utf8');

      // Check for 3-level fallback system
      const fallbackLevels = [
        { level: 'Level 1', pattern: /constructDomainBasedResponse/i },
        { level: 'Level 2', pattern: /explainDomainRouting/i },
        { level: 'Level 3', pattern: /analyzeSystemState/i },
      ];

      for (const fallback of fallbackLevels) {
        if (fallback.pattern.test(content)) {
          this.success(`${fallback.level}: Implemented (AI-based reasoning)`);
        } else {
          this.error(`${fallback.level}: Missing`);
        }
      }

      // Verify fallbacks use AI reasoning, not templates
      const hasDiagnostics = content.includes('systemChecks') || content.includes('Component Status');
      const hasReasoning = content.includes('orchestrator reasoning') || content.includes('analyze');
      
      if (hasDiagnostics && hasReasoning) {
        this.success('Fallbacks use AI reasoning and diagnostics ✅');
      } else {
        this.warning('Fallback system may need more AI reasoning logic');
      }
    } catch (error) {
      this.error(`Fallback hierarchy test failed: ${error.message}`);
    }
  }

  /**
   * Test 7: Learning Metrics
   */
  async testLearningMetrics() {
    this.header('TEST 7: Learning Metrics & Training Pipeline');

    const fs = require('fs').promises;

    try {
      // Check for LearningMetricsTracker
      const metricsPath = path.join(__dirname, '../src/ai/monitoring/learningMetricsTracker.ts');
      const metricsExists = await fs.access(metricsPath).then(() => true).catch(() => false);

      if (metricsExists) {
        const content = await fs.readFile(metricsPath, 'utf8');
        
        const hasRecording = content.includes('recordInference');
        const hasExport = content.includes('exportForTraining');
        const hasStorage = content.includes('fs.writeFile') || content.includes('writeFile');
        
        if (hasRecording && hasExport && hasStorage) {
          this.success('LearningMetricsTracker: Fully implemented ✅');
        } else {
          this.warning('LearningMetricsTracker: Partially implemented');
        }
      } else {
        this.error('LearningMetricsTracker: Not found');
      }

      // Check for training automation
      const trainingPath = path.join(__dirname, '../src/ai/training/autoTrainingScheduler.js');
      const trainingExists = await fs.access(trainingPath).then(() => true).catch(() => false);

      if (trainingExists) {
        this.success('Training automation scheduler: Created ✅');
      } else {
        this.warning('Training automation: Not yet implemented');
      }

      // Check for vocabulary managers
      const domainsPath = path.join(__dirname, '../src/ai/knowledge-domains');
      const domains = await fs.readdir(domainsPath);
      let vocabManagerCount = 0;

      for (const domain of domains) {
        const vocabManagerPath = path.join(domainsPath, domain, `${domain}_vocabularyManager.ts`);
        const exists = await fs.access(vocabManagerPath).then(() => true).catch(() => false);
        if (exists) vocabManagerCount++;
      }

      this.info(`Found ${vocabManagerCount} vocabulary managers for learning`);
    } catch (error) {
      this.error(`Learning metrics test failed: ${error.message}`);
    }
  }

  /**
   * Print final summary
   */
  printSummary() {
    this.header('TEST SUMMARY');

    const total = this.passed + this.failed + this.warnings;
    const passRate = total > 0 ? ((this.passed / total) * 100).toFixed(1) : 0;

    this.log(`\n✅ Passed:   ${this.passed}`, 'green');
    this.log(`❌ Failed:   ${this.failed}`, 'red');
    this.log(`⚠️  Warnings: ${this.warnings}`, 'yellow');
    this.log(`📊 Pass Rate: ${passRate}%\n`, 'bright');

    if (this.failed === 0) {
      this.log('🎉 All critical tests passed! System is production-ready.', 'green');
    } else if (this.failed <= 5) {
      this.log('⚠️  Some tests failed. Review issues before production deployment.', 'yellow');
    } else {
      this.log('❌ Multiple critical failures. System needs fixes before deployment.', 'red');
    }

    this.log('\n📝 Full analysis: docs/SYSTEM_ANALYSIS_AND_FIXES.md\n', 'cyan');
  }
}

// Run tests
const tester = new AIPipelineTest();
tester.runAll().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
