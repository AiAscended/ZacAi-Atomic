# Plugin Architecture

## Overview

ZacAi-Atomic implements a **plug-and-play modular AI system** where models and knowledge domains are self-contained, auto-discoverable modules that can be added or removed without affecting system stability.

## Architecture Principles

### 1. **Separation of Concerns**
- Core orchestrator never changes
- Only registry files update when modules are added/removed
- Models and domains are independent, self-contained units

### 2. **Auto-Discovery**
- Filesystem-based scanning automatically detects new modules
- Structure validation ensures integrity before registration
- Registry files act as single source of truth

### 3. **Dynamic Loading**
- Models and domains loaded on-demand at runtime
- Enable/disable modules without system restart
- Hot-reload support for development

### 4. **Graceful Degradation**
- Validation prevents crashes from malformed plugins
- Missing dependencies logged as warnings, not errors
- System continues with available modules if some fail

### 5. **Industry Standards (2025)**
- Modular architecture with dependency injection
- Chainable/composable model pipelines
- Hybrid orchestration (multi-model coordination)
- Web 3.0 ready (decentralized, modular)

---

## Registry System

### Model Registry
**Location**: `src/ai/models/MODEL_REGISTRY.json`

Tracks all AI models with:
- Model type (LLM, CNN, RNN, GAN, Diffusion, Multimodal)
- Version and display name
- Enabled/disabled status
- Structure validation (seeds, weights, tokenizer, inference, training)
- File paths for all components
- Metadata (base token count, creation date)

### Domain Registry
**Location**: `src/ai/knowledge-domains/DOMAIN_REGISTRY.json`

Tracks all knowledge domains with:
- Domain ID and name
- Version and description
- Enabled/disabled status
- Structure validation (seeds, weights, inference, training, integration API)
- File paths for all components
- Metadata (seed vocab size, learned data status)

---

## Module Structure

### Model Structure
```
src/ai/models/[model-name]/
├── seeds/
│   ├── data.json           # Training seed data
│   └── vocab.json          # Vocabulary/tokens
├── weights/
│   ├── pretrained/         # Pre-trained weights
│   └── finetuned/          # Fine-tuned weights
├── tokenizer/
│   ├── config.json         # Tokenizer configuration
│   └── baseTokens.json     # 20-40 foundational tokens
├── inference/
│   └── engine.ts           # Inference logic
├── training/
│   └── pipeline.ts         # Training pipeline
└── scripts/
    └── train.js            # Model-specific scripts
```

### Domain Structure
```
src/ai/knowledge-domains/[domain-name]/
├── seed_data.json          # Seed knowledge base
├── seed_vocab.json         # Domain-specific vocabulary
├── learned_data.json       # AI-learned knowledge (optional)
├── weights/
│   ├── pretrained.json     # Pre-trained weights
│   └── training_weights.json # Training weights
├── inferenceController.ts  # Query processing
├── trainingController.ts   # Learning pipeline
├── integrationAPI.ts       # Orchestrator interface
├── tokenizer.ts            # Domain tokenizer
└── scripts/
    └── train.js            # Domain-specific scripts
```

---

## Base Tokens Standard

**Location**: `src/ai/models/shared/baseTokens.template.json`

Every model should have **20-40 foundational tokens**:

### Categories (41 tokens total):
1. **Special Tokens** (7): `[PAD]`, `[UNK]`, `[BOS]`, `[EOS]`, `[MASK]`, `[CLS]`, `[SEP]`
2. **Numerical** (10): `0-9`
3. **Punctuation** (10): `. , ! ? : ; ' " ( )`
4. **Whitespace** (3): space, newline, tab
5. **Operators** (7): `+ - * / = < >`
6. **Brackets** (4): `[ ] { }`

**Why 20-40?**
- Industry standard for model interoperability
- Separate from domain-specific learned tokens
- Prevents token ID conflicts across models
- Enables model chaining and composition

---

## Scanners

### Model Scanner
**File**: `src/ai/models/modelRegistry.ts`
**CLI**: `scripts/scan-models.js`

**Features**:
- Recursively scans `src/ai/models/`
- Detects model type from folder name
- Validates structure (seeds, weights, tokenizer, inference, training)
- Counts base tokens
- Saves to `MODEL_REGISTRY.json`

**Usage**:
```bash
npm run scan:models
```

### Domain Scanner
**File**: `src/ai/knowledge-domains/domainScanner.ts`
**CLI**: `scripts/scan-domains.js`

**Features**:
- Recursively scans `src/ai/knowledge-domains/`
- Validates structure (seeds, weights, inference, training, API)
- Counts seed vocabulary size
- Checks for learned data
- Saves to `DOMAIN_REGISTRY.json`

**Usage**:
```bash
npm run scan:domains
```

---

## Model/Domain Loader

**File**: `src/ai/models/modelLoader.ts`

**Features**:
- Load models/domains on-demand from registry
- Structure validation before loading
- Enable/disable at runtime
- Hot-reload support
- Graceful error handling

**API**:
```typescript
import { getModelLoader } from "@/ai/models/modelLoader";

const loader = getModelLoader();

// Load all enabled models
await loader.loadAllModels();

// Load specific model
const model = await loader.loadModel("llm");

// Reload model (hot-reload)
await loader.reloadModel("llm");

// Load all enabled domains
await loader.loadAllDomains();

// Load specific domain
const domain = await loader.loadDomain("mathematics");
```

---

## Validation

**File**: `src/ai/shared/validation/moduleValidator.ts`

**Features**:
- Health checks for models and domains
- Structure integrity validation
- Detailed error/warning reporting
- Validation scoring (0-100)
- Prevents crashes from malformed plugins

**API**:
```typescript
import { ModelValidator, DomainValidator } from "@/ai/shared/validation/moduleValidator";

// Validate model
const result = await ModelValidator.validateModel(modelId, modelPath, manifest);
console.log(`Validation score: ${result.score}/100`);
console.log(`Errors: ${result.errors.length}`);
console.log(`Warnings: ${result.warnings.length}`);

// Health check
const health = await ModelValidator.healthCheck(modelId, modelPath, manifest);
console.log(`Status: ${health.status}`); // healthy | degraded | unhealthy
```

---

## Orchestrator Integration

The main orchestrator consumes registry files dynamically:

```typescript
import { getModelRegistry, getEnabledModels } from "@/ai/models/modelRegistry";
import { getDomainRegistry, getEnabledDomains } from "@/ai/knowledge-domains/domainScanner";
import { getModelLoader } from "@/ai/models/modelLoader";

// Initialize orchestrator
const loader = getModelLoader();
await loader.loadAllModels();
await loader.loadAllDomains();

// Get available models
const models = await getEnabledModels();

// Get available domains
const domains = await getEnabledDomains();

// Process request with loaded modules
const response = await orchestrator.process(request, {
  models: loader.getAllLoadedModels(),
  domains: loader.getAllLoadedDomains(),
});
```

---

## Adding New Models

1. Create folder: `src/ai/models/[model-name]/`
2. Add required structure:
   - `seeds/data.json` and `seeds/vocab.json`
   - `weights/` folder with pretrained/finetuned
   - `tokenizer/config.json`
   - Copy `baseTokens.json` from template
   - `inference/engine.ts`
3. Run scanner: `npm run scan:models`
4. Restart orchestrator (auto-loads from registry)

## Adding New Domains

1. Create folder: `src/ai/knowledge-domains/[domain-name]/`
2. Add required structure:
   - `seed_data.json` and `seed_vocab.json`
   - `inferenceController.ts`
   - `integrationAPI.ts` with `initialize()` and `query()`
3. Run scanner: `npm run scan:domains`
4. Restart orchestrator (auto-loads from registry)

---

## Hot-Reload

Development workflow supports hot-reload:

```typescript
// Reload specific model
await loader.reloadModel("llm");

// Reload specific domain
await loader.reloadDomain("mathematics");

// Re-scan registry
await scanAndUpdateRegistry();
await scanAndUpdateDomainRegistry();
```

---

## Folder Structure Clarification

### `src/lib/utils.ts`
- **Purpose**: UI utilities (shadcn/ui pattern)
- **Example**: `cn()` function for Tailwind class merging
- **Status**: Legitimate Next.js convention, used by 50+ components

### `src/utils/`
- **Purpose**: App-level utilities
- **Files**: `dom.ts`, `router.ts`, `storage.ts`, `utils.ts`
- **Status**: Correct Next.js naming

### `src/ai/ai_utils/`
- **Purpose**: AI-specific utilities (renamed from `src/ai/utils`)
- **Files**: `github-app-utils/` (authentication, GitHub App integration)
- **Status**: Clarified naming (parent/child prefix relationship)

---

## Best Practices

### 1. **Never Hard-Code Models/Domains**
❌ Bad:
```typescript
import { llmModel } from "@/ai/models/llm";
```

✅ Good:
```typescript
const loader = getModelLoader();
const model = await loader.loadModel("llm");
```

### 2. **Always Validate Before Loading**
```typescript
const result = await ModelValidator.validateModel(modelId, modelPath, manifest);
if (!result.isValid) {
  console.error("Validation failed:", result.errors);
  return;
}
```

### 3. **Handle Missing Dependencies Gracefully**
```typescript
try {
  await loader.loadModel("optional-model");
} catch (error) {
  console.warn("Optional model unavailable, continuing...");
}
```

### 4. **Use Health Checks**
```typescript
const health = await ModelValidator.healthCheck(modelId, modelPath, manifest);
if (health.status === "unhealthy") {
  console.error("Model unhealthy:", health.checks);
}
```

### 5. **Keep Base Tokens Consistent**
- Use 20-40 base tokens from template
- Token IDs should match across models for interoperability
- Separate base tokens from learned domain-specific tokens

---

## Testing

```bash
# Scan and validate all models
npm run scan:models

# Scan and validate all domains
npm run scan:domains

# Scan everything
npm run scan:all

# Run validation tests
npm test -- validation
```

---

## Troubleshooting

### Model Not Loading
1. Check registry: `cat src/ai/models/MODEL_REGISTRY.json`
2. Verify structure: `npm run scan:models`
3. Check validation: Run `ModelValidator.validateModel()`
4. Review logs for errors

### Domain Not Loading
1. Check registry: `cat src/ai/knowledge-domains/DOMAIN_REGISTRY.json`
2. Verify structure: `npm run scan:domains`
3. Check validation: Run `DomainValidator.validateDomain()`
4. Ensure `integrationAPI.ts` exports `initialize()` and `query()`

### Registry Out of Date
1. Re-scan: `npm run scan:all`
2. Force refresh: `await getModelRegistry(true)`
3. Clear cache and restart

---

## Future Enhancements

- [ ] WebSocket-based hot-reload notifications
- [ ] Dependency resolution between models
- [ ] Version compatibility checks
- [ ] Automatic model updates from registry
- [ ] Model marketplace integration
- [ ] Distributed model loading (microservices)
- [ ] GPU allocation management
- [ ] Model performance metrics

---

## References

- [Model Registry](../src/ai/models/modelRegistry.ts)
- [Domain Scanner](../src/ai/knowledge-domains/domainScanner.ts)
- [Model Loader](../src/ai/models/modelLoader.ts)
- [Module Validator](../src/ai/shared/validation/moduleValidator.ts)
- [Base Tokens Template](../src/ai/models/shared/baseTokens.template.json)
