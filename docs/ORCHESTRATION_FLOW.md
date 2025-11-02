# ZacAi-Atomic Complete Orchestration Flow

## System Architecture Overview

This document details the complete request flow from user input to formatted response display.

## Request Flow Chain

```
User Input (app/page.tsx)
    ↓
mainOrchestrator.ts (src/ai/orchestration/)
    ↓
promptHandler.ts → Prepare & format prompt
    ↓
Input Processing (src/ai/input_processing/)
    ├─→ promptProcessor.ts → Extract keywords, normalize
    ├─→ tokenizer → Tokenize input
    └─→ intentClassifier → Determine intent
    ↓
Model & Domain Selection
    ├─→ modelSelector.ts → Choose appropriate AI models
    └─→ domainRouter.ts → Route to knowledge domains
    ↓
Parallel Inference Execution
    ├─→ AI Models (src/ai/models/)
    │   ├─→ unified-transformer-llm (LLM inference)
    │   ├─→ convolutional-neural-network (if images)
    │   ├─→ vision-transformer (if vision tasks)
    │   ├─→ code-transformer (if code generation)
    │   └─→ ... (other specialized models)
    │
    └─→ Knowledge Domains (src/ai/knowledge-domains/)
        ├─→ english/ → english_inferenceController.ts
        ├─→ mathematics/ → mathematics_inferenceController.ts
        ├─→ typescript/ → typescript_inferenceController.ts
        ├─→ programming/ → programming_inferenceController.ts
        └─→ ... (15 more domains)
        Each domain uses:
          - {domain}_tokenizer.ts
          - seeds/{domain}_seeds.json
          - weights/{domain}_pretrained_weights.json
          - tools/{domain}-ToolName.ts
    ↓
Results Aggregation & Synthesis
    ├─→ resultsAggregator.ts → Combine multi-model outputs
    ├─→ crossModalFusion.ts → Fuse multi-modal data
    └─→ responseSynthesizer.ts → Synthesize final response
    ↓
Output Formatting
    ├─→ responseFormatter.ts → Format text/code blocks
    ├─→ codeFormatter.ts → Syntax highlighting
    ├─→ textFormatter.ts → Clean, summarize, punctuate
    └─→ outputFormatter.ts → Structure for UI
    ↓
Response Rendering (components/)
    ├─→ ResponseRenderer.tsx → Display formatted response
    ├─→ CodeBlock.tsx → Render code with syntax highlighting
    ├─→ ThinkingSteps.tsx → Show reasoning process
    └─→ Chat UI → Display in chat window
    ↓
User sees formatted response with code blocks, thinking steps, etc.
```

## File-by-File Integration Map

### Entry Point: Next.js App

| File | Location | Purpose | Calls |
|------|----------|---------|-------|
| **page.tsx** | `app/page.tsx` | Main chat interface | MainOrchestrator.processQuery() |
| **admin/page.tsx** | `app/admin/page.tsx` | Admin dashboard | System settings, GitHub integration |

### Core Orchestration Layer

| File | Location | Purpose | Dependencies |
|------|----------|---------|--------------|
| **mainOrchestrator.ts** | `src/ai/orchestration/` | Central conductor - coordinates entire flow | promptHandler, modelSelector, domainRouter, resultsAggregator |
| **promptHandler.ts** | `src/ai/orchestration/` | Prepares prompts for models/domains | tokenManager, contextEnhancer |
| **modelSelector.ts** | `src/ai/orchestration/` | Selects which AI models to invoke | Model registry, intent classification |
| **domainRouter.ts** | `src/ai/orchestration/` | Routes requests to knowledge domains | domainRegistry, keyword matching |
| **resultsAggregator.ts** | `src/ai/orchestration/` | Combines outputs from multiple sources | responseSynthesizer |
| **crossModalFusion.ts** | `src/ai/orchestration/` | Fuses text, image, audio, code data | Multi-modal models |
| **tokenManager.ts** | `src/ai/orchestration/` | Manages tokens, chunks, context buffers | Tokenizers from models/domains |
| **embeddingManager.ts** | `src/ai/orchestration/` | Manages shared embeddings cache | Embedding models |
| **weightsUpdater.ts** | `src/ai/orchestration/` | Handles weight updates, versioning | Model weights, checkpoints |
| **stateManager.ts** | `src/ai/orchestration/` | Session state, cache, context tracking | Storage utilities |
| **errorHandler.ts** | `src/ai/orchestration/` | Error handling, fallback mechanisms | Logger |
| **metricsLogger.ts** | `src/ai/orchestration/` | Performance metrics, inference times | Monitoring system |
| **outputFormatter.ts** | `src/ai/orchestration/` | Final output structuring | responseFormatter, codeFormatter |
| **toolsManager.ts** | `src/ai/orchestration/` | External tools, APIs, plugins | Domain-specific tools |

### Input Processing

| File | Location | Purpose |
|------|----------|---------|
| **promptProcessor.ts** | `src/ai/input_processing/` | Extract keywords, normalize input |
| **intentClassifier.ts** | `src/ai/context_management/` | Determine user intent |
| **keywordExtractor.ts** | `src/ai/input_processing/` | Extract relevant keywords |

### AI Models (13 Total)

| Model | Prefix | Inference Engine | Purpose |
|-------|--------|------------------|---------|
| unified-transformer-llm | `llm-` | `llm-inferenceEngine.ts` | Text generation, understanding |
| convolutional-neural-network | `cnn-` | `cnn-inferenceEngine.ts` | Image processing |
| recurrent-neural-network | `rnn-` | `rnn-inferenceEngine.ts` | Sequential data |
| vision-transformer | `vit-` | `vit-inferenceEngine.ts` | Vision tasks |
| code-transformer | `code-` | `code-inferenceEngine.ts` | Code generation/understanding |
| ... (8 more models) | ... | ... | ... |

**Each model structure:**
```
{model-name}/
├── {prefix}-inference/
│   └── {prefix}-inferenceEngine.ts  ← Called by mainOrchestrator
├── {prefix}-model/
│   ├── {prefix}-core.ts             ← Core architecture
│   └── {prefix}-layers.ts           ← Neural network layers
├── {prefix}-weights/
│   └── {prefix}-pretrained.bin      ← Loaded by weightsUpdater
└── {prefix}-config/
    └── {prefix}-modelConfig.ts      ← Configuration
```

### Knowledge Domains (19 Total)

| Domain | Key Files | Tools |
|--------|-----------|-------|
| **english** | english_inferenceController.ts, english_tokenizer.ts | english-SpellChecker.ts, english-GrammarChecker.ts |
| **mathematics** | mathematics_inferenceController.ts, mathematics_tokenizer.ts | mathematics-Calculator.ts, mathematics-EquationSolver.ts |
| **typescript** | typescript_inferenceController.ts, typescript_tokenizer.ts | typescript-TypeChecker.ts, typescript-Linter.ts |
| **programming** | programming_inferenceController.ts, programming_tokenizer.ts | programming-CodeAnalyzer.ts |
| ... (15 more) | ... | ... |

**Each domain structure:**
```
{domain-name}/
├── {domain}_inferenceController.ts  ← Main entry point (called by domainRouter)
├── {domain}_tokenizer.ts            ← Domain-specific tokenization
├── {domain}_trainingController.ts
├── {domain}_modelWeightsLoader.ts
├── seeds/
│   └── {domain}_seeds.json          ← Training seed data
├── weights/
│   └── {domain}_pretrained_weights.json  ← Domain-specific weights
└── tools/
    └── {domain}-ToolName.ts         ← Specialized tools
```

### Output Generation & Formatting

| File | Location | Purpose |
|------|----------|---------|
| **responseSynthesizer.ts** | `src/ai/output_generation/` | Synthesizes multi-source responses |
| **responseFormatter.ts** | `src/ai/orchestration/` | Formats text and code blocks |
| **codeFormatter.ts** | `src/ai/shared/tools/codeFormatting/` | Code syntax highlighting |
| **textFormatter.ts** | `src/ai/shared/tools/textFormatting/` | Text cleaning, summarization |

### UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **ResponseRenderer.tsx** | `src/components/` | Main response display |
| **CodeBlock.tsx** | `src/components/code/` | Syntax-highlighted code display |
| **ThinkingSteps.tsx** | `src/components/` | Show AI reasoning process |
| **Chat components** | `src/components/chat/` | Chat interface elements |

## Integration Flow Example

### Example: User asks "Write a TypeScript function to sort an array"

1. **Input** (app/page.tsx):
   ```typescript
   const response = await mainOrchestrator.processQuery(userInput)
   ```

2. **mainOrchestrator.ts**:
   ```typescript
   // Extract keywords: "typescript", "function", "sort", "array"
   const processed = await promptProcessor.process(input)
   
   // Select models and domains
   const models = modelSelector.select(processed) 
   // Returns: ["code-transformer", "unified-transformer-llm"]
   
   const domains = domainRouter.route(processed)
   // Returns: ["typescript", "programming", "algorithms"]
   ```

3. **Parallel Inference**:
   ```typescript
   // AI Models
   const codeTransformerResult = await codeInferenceEngine.predict(tokens)
   const llmResult = await llmInferenceEngine.predict(tokens)
   
   // Knowledge Domains
   const typescriptResult = await typescriptInferenceController.infer(tokens)
   const programmingResult = await programmingInferenceController.infer(tokens)
   const algorithmsResult = await algorithmsInferenceController.infer(tokens)
   ```

4. **Aggregation** (resultsAggregator.ts):
   ```typescript
   const combined = aggregator.combine([
     codeTransformerResult,
     llmResult,
     typescriptResult,
     programmingResult,
     algorithmsResult
   ])
   ```

5. **Synthesis** (responseSynthesizer.ts):
   ```typescript
   const synthesized = synthesizer.synthesize(combined)
   // Merges code examples, explanations, best practices
   ```

6. **Formatting** (responseFormatter.ts, codeFormatter.ts):
   ```typescript
   const formatted = formatResponse(synthesized)
   // Separates text blocks and code blocks
   // Applies syntax highlighting to code
   // Returns: { textBlocks, codeBlocks, metadata }
   ```

7. **Rendering** (ResponseRenderer.tsx):
   ```tsx
   <ResponseRenderer response={formatted}>
     {formatted.textBlocks.map(block => <TextBlock {...block} />)}
     {formatted.codeBlocks.map(block => <CodeBlock {...block} />)}
   </ResponseRenderer>
   ```

## GitHub Integration

| Component | Location | Purpose |
|-----------|----------|---------|
| **GitHub App Utils** | `src/ai/utils/github-app-utils/` | GitHub API integration |
| **OAuth Routes** | `src/app/api/github-app/` | OAuth flow |
| **Admin Page** | `src/app/admin/integrations/github-app/` | GitHub app settings UI |

**Orchestrator can use GitHub tools:**
- Read/write files in repositories
- Create commits, branches, PRs
- Search code across repos
- Access user's entire GitHub account

## State Management

### Session State (stateManager.ts)
- Conversation context
- User preferences
- Active domains/models
- Cache management

### Metrics Tracking (metricsLogger.ts)
- Inference times per model/domain
- Token usage
- Success/failure rates
- Performance bottlenecks

## Error Handling

### Graceful Degradation (errorHandler.ts)
- Model unavailable → Fallback to LLM
- Domain inference failure → Continue with other domains
- Timeout → Return partial results
- All failures → Fallback message

## Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript paths (@/* aliases) |
| `next.config.mjs` | Next.js configuration |
| Model package.json files | Model-specific dependencies |
| Domain seed/weight files | Training data and parameters |

## Key Design Principles

1. **Atomic Modularity**: Each component is self-contained
2. **Parallel Processing**: Models and domains run concurrently
3. **Graceful Degradation**: System continues with partial results
4. **Separation of Concerns**: Clear boundaries between layers
5. **Extensibility**: Easy to add new models, domains, tools

## Next Steps

1. ✅ mainOrchestrator.ts exists - enhance to full conductor
2. ⏳ Create missing orchestration support files (11 files)
3. ⏳ Integrate old Vite chat logic into Next.js app/page.tsx
4. ⏳ Ensure all imports use correct paths
5. ⏳ Test complete flow end-to-end

---

**Status**: Architecture defined, implementation in progress
**Last Updated**: November 1, 2025
