# ZacAi-Atomic AI System Tests

Comprehensive test suite for the ZacAi-Atomic hybrid AI system.

## Overview

This test suite validates all critical components of the AI system:

- **Orchestration Tests**: Main orchestrator and prompt processing pipeline
- **Inference Engine Tests**: Neural network operations and forward passes
- **Domain Registry Tests**: All 23 knowledge domains
- **Multi-Modal Model Tests**: All 13+ AI model layers
- **Integration Tests**: End-to-end AI pipeline

## Test Structure

```
src/ai/tests/
├── orchestration/       # Orchestration layer tests
│   └── mainOrchestrator.test.ts
├── inference/          # Inference engine tests
│   └── inferenceEngine.test.ts
├── domains/            # Domain system tests
│   └── domainRegistry.test.ts
├── models/             # Model layer tests
│   └── multiModalLayers.test.ts
├── integration/        # End-to-end tests
│   └── endToEnd.test.ts
└── index.ts           # Test suite metadata
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific test suite
```bash
npm test src/ai/tests/orchestration/mainOrchestrator.test.ts
npm test src/ai/tests/inference/inferenceEngine.test.ts
npm test src/ai/tests/domains/domainRegistry.test.ts
npm test src/ai/tests/models/multiModalLayers.test.ts
npm test src/ai/tests/integration/endToEnd.test.ts
```

### Run with UI
```bash
npm run test:ui
```

### Run with coverage
```bash
npm run test:coverage
```

### Run from Admin Dashboard
Navigate to `/admin/tests` in the web interface to run tests and view results.

## Test Categories

### 1. Orchestration Tests (mainOrchestrator.test.ts)

Tests the main AI orchestration system:
- Initialization and domain/model availability
- Prompt processing pipeline
- Response quality and metadata
- Error handling
- Performance metrics

**Coverage**: 
- Main orchestrator
- Prompt handler
- Domain routing
- Response aggregation
- Context management

### 2. Inference Engine Tests (inferenceEngine.test.ts)

Tests neural network inference operations:
- Forward passes
- Attention mechanisms
- Domain-specific inference
- Caching
- Performance benchmarks

**Coverage**:
- Transformer architecture
- Multi-head attention
- Feed-forward networks
- Layer normalization
- Positional encoding

### 3. Domain Registry Tests (domainRegistry.test.ts)

Tests all 23 knowledge domains:
- Domain registration
- Domain configuration
- Inference execution
- Vocabulary quality
- Weight loading
- Error handling

**Domains Tested**:
- algorithms
- code_review
- data_integrity
- data_structures
- documentation
- english
- environment
- error_detection
- general_knowledge
- grammar
- internet_search
- mathematics
- nextjs
- observability
- programming
- react
- repair
- science
- security
- system
- testing
- typescript
- version_control

### 4. Multi-Modal Model Tests (multiModalLayers.test.ts)

Tests all AI model layers:
- Model registration
- Layer configuration
- Inference capabilities
- Cross-modal fusion
- Model specialization
- Architecture validation

**Models Tested**:
- Unified Transformer LLM
- Vision Transformer
- Code Transformer
- Convolutional Neural Network
- Recurrent Neural Network
- Graph Neural Network
- Diffusion Model
- Generative Adversarial Network
- Speech-to-Text
- Text-to-Speech
- WaveNet Audio Model
- Multi-Modal Fusion
- Neuro-Symbolic Reasoning

### 5. Integration Tests (endToEnd.test.ts)

Tests the complete AI pipeline:
- Full pipeline flow (input → output)
- Context management across conversations
- Multi-domain aggregation
- Real-world scenarios
- Performance requirements
- Error recovery
- Content generation

## Test Requirements

### Performance Benchmarks
- Orchestration latency: < 10 seconds
- Inference latency: < 5 seconds
- Concurrent requests: < 30 seconds for 3 queries
- Cache effectiveness: 2nd call faster than 1st

### Quality Metrics
- Domain registration: All 23 domains
- Model availability: All 13+ models
- Confidence scores: 0.0 to 1.0 range
- Response coherence: > 50 characters
- Context retention: Across session

### Error Handling
- Empty inputs: Graceful handling
- Malformed inputs: No crashes
- Domain failures: Fallback responses
- Long prompts: Truncation/handling
- Special characters: Proper escaping

## System Verification

Run the system verification script to check all components:

```bash
node scripts/verify-system-status.cjs
```

This provides:
- Domain status (23 domains)
- Model status (14 model layers)
- Test suite status (5 test suites)
- Admin page status (15 pages)

## Production Readiness

The test suite validates:
- ✅ All critical system functions operational
- ✅ Production-grade error handling
- ✅ Performance within acceptable limits
- ✅ Real-world scenario coverage
- ✅ Security and validation

## Contributing

When adding new features:
1. Add corresponding tests
2. Follow existing test patterns
3. Ensure tests pass before committing
4. Update this README if adding new test categories

## Test Infrastructure

- **Framework**: Vitest
- **Environment**: jsdom
- **Coverage**: Istanbul
- **Assertions**: Chai-compatible expect
- **Mocking**: Vitest mocking utilities

## Continuous Integration

Tests are automatically run:
- On pull request
- Before deployment
- Via admin dashboard
- On schedule (optional)

## Debugging Tests

### View detailed output
```bash
npm test -- --reporter=verbose
```

### Run single test
```bash
npm test -- -t "should process simple text query"
```

### Debug in VS Code
Use the built-in debugger with `.vscode/launch.json` configuration.

## Known Issues

- GitHub App integration tests require valid credentials
- Some performance tests may fail on slow machines
- Domain-specific tests require domain registration to complete

## Support

For issues or questions:
1. Check test output for specific error messages
2. Review the test file for expected behavior
3. Verify system status with verification script
4. Consult main documentation in `/docs`

---

**Last Updated**: November 5, 2025  
**Test Coverage**: Production-ready 2025 Hybrid AI Architecture  
**Status**: ✅ All systems operational
