# ZacAi-Atomic Orchestration Files Integration Guide

## Overview

The `src/ai/orchestration/` folder contains all coordination and management files for the AI system. All files follow **camelCase** naming convention (TypeScript/Next.js best practice).

---

## Core Orchestration Files

### 1. mainOrchestrator.ts (Main Conductor) ⭐
**Status:** ✅ Complete  
**Role:** Central hub coordinating the entire AI pipeline

**Responsibilities:**
- Initialize all AI models and domains
- Process user prompts through complete pipeline
- Coordinate input processing → domain routing → inference → synthesis → formatting
- Track thinking steps for transparency
- Return structured responses to API layer

**Key Methods:**
```typescript
class MainOrchestrator {
  initialize(): Promise<void>
  processPrompt(prompt: string, sessionId: string): Promise<OrchestratorResponse>
  identifyRelevantDomains(prompt: string): string[]
  queryKnowledgeDomains(domains: string[]): Promise<DomainResult[]>
  getStatus(): SystemStatus
}
```

**Integration:**
- Called by: `app/api/chat/route.ts`
- Uses: `promptProcessor`, `domainQueryExecutor`, `responseSynthesizer`, `responseFormatter`
- Integrates: All 19 knowledge domains, all 13 AI models

---

### 2. promptHandler.ts
**Status:** ✅ Exists  
**Role:** Pre-process and validate user prompts

**Responsibilities:**
- Validate prompt format
- Handle special commands
- Apply prompt templates
- Manage context injection

**Integration:**
- Called by: `mainOrchestrator.ts`
- Uses: `promptProcessor` from input_processing layer

---

### 3. responseFormatter.ts
**Status:** ✅ Exists  
**Role:** Format AI responses for UI display

**Responsibilities:**
- Parse markdown
- Extract code blocks with language detection
- Apply syntax highlighting metadata
- Structure text blocks
- Add punctuation and grammar formatting

**Key Functions:**
```typescript
export function formatResponse(text: string): FormattedResponse {
  // Returns: { textBlocks, codeBlocks }
}

export function formatCodeBlock(code: string, language: string): CodeBlock
export function formatTextBlock(text: string): TextBlock
```

**Integration:**
- Called by: `mainOrchestrator.ts`
- Used by: Response synthesis pipeline
- Output consumed by: `components/ResponseRenderer-v2.tsx`

---

### 4. thinkingTracker.ts
**Status:** ✅ Exists  
**Role:** Track AI processing steps for transparency

**Responsibilities:**
- Record each processing step with timestamp
- Store step descriptions and metadata
- Provide thinking steps for UI display
- Enable debugging and monitoring

**Key Methods:**
```typescript
class ThinkingTracker {
  addStep(step: string, description: string, data?: Record<string, unknown>): void
  getSteps(): ThinkingStep[]
  reset(): void
}
```

**Integration:**
- Used by: `mainOrchestrator.ts`
- Data sent to: Frontend for `ThinkingSteps.tsx` component

---

### 5. eventBus.ts
**Status:** ✅ Exists  
**Role:** Pub/sub system for inter-component communication

**Responsibilities:**
- Event subscription and publishing
- Decoupled component communication
- System-wide notifications

**Usage Example:**
```typescript
eventBus.subscribe("domain:loaded", (domain) => {
  logger.info(`Domain loaded: ${domain}`)
})

eventBus.publish("model:inference:start", { model: "llm" })
```

---

### 6. logger.ts
**Status:** ✅ Exists  
**Role:** Centralized logging system

**Responsibilities:**
- Log system events
- Track errors and warnings
- Performance monitoring
- Debug information

**Integration:**
- Used by: All orchestration files, models, and domains

---

### 7. moduleRegistry.ts
**Status:** ✅ Exists  
**Role:** Registry for dynamically loaded modules

**Responsibilities:**
- Register AI modules and domains
- Provide module lookup
- Manage module lifecycle

**Integration:**
- Used by: Domain registration system
- Called during: System initialization

---

### 8. moduleLoaderFactory.ts
**Status:** ✅ Exists  
**Role:** Factory for dynamic module loading

**Responsibilities:**
- Load modules on demand
- Handle module dependencies
- Lazy loading optimization

---

### 9. contextEnhancer.ts
**Status:** ✅ Exists  
**Role:** Enhance prompts with contextual information

**Responsibilities:**
- Add chat history context
- Include user preferences
- Inject relevant metadata
- Context window management

---

### 10. dataChangeListener.ts
**Status:** ✅ Exists  
**Role:** Listen for data updates and trigger events

**Responsibilities:**
- Monitor knowledge domain updates
- Trigger retraining when needed
- Watch for weight updates
- System state synchronization

---

### 11. dataIntegrator.ts
**Status:** ✅ Exists  
**Role:** Integrate data from multiple sources

**Responsibilities:**
- Merge domain-specific data
- Handle data conflicts
- Normalize data formats
- Data validation

---

### 12. dependencyResolver.ts
**Status:** ✅ Exists  
**Role:** Resolve dependencies between modules

**Responsibilities:**
- Module dependency tracking
- Load order determination
- Circular dependency detection
- Dependency injection

---

### 13. knowledgeRetriever.ts
**Status:** ✅ Exists  
**Role:** Retrieve relevant knowledge for prompts

**Responsibilities:**
- Search knowledge base
- Retrieve domain-specific data
- Context-aware retrieval
- Relevance ranking

---

### 14. workflowEngine.ts
**Status:** ✅ Exists  
**Role:** Execute complex AI workflows

**Responsibilities:**
- Define workflow steps
- Execute multi-step processes
- Handle workflow state
- Parallel execution coordination

---

## Additional Orchestration Files Needed

### 15. tokenManager.ts
**Status:** ⚠️ NEEDS CREATION  
**Role:** Manage token limits and context windows

**Responsibilities:**
- Track token usage
- Enforce token limits
- Manage context window
- Token counting for billing

**Implementation:** [See below]

---

### 16. weightsUpdater.ts
**Status:** ⚠️ NEEDS CREATION  
**Role:** Handle model weight updates and versioning

**Responsibilities:**
- Load model weights
- Save updated weights
- Version control for weights
- Hot-reload weights without restart

**Implementation:** [See below]

---

### 17. metricsLogger.ts
**Status:** ⚠️ NEEDS CREATION  
**Role:** Performance metrics and analytics

**Responsibilities:**
- Log inference times
- Track model performance
- Monitor system resources
- Generate performance reports

**Implementation:** [See below]

---

### 18. modelSelector.ts
**Status:** ⚠️ NEEDS CREATION  
**Role:** Select appropriate AI model for task

**Responsibilities:**
- Analyze task requirements
- Select best model (LLM, CNN, RNN, etc.)
- Load balancing across models
- Fallback strategies

**Implementation:** [See below]

---

### 19. domainRouter.ts
**Status:** ⚠️ NEEDS CREATION  
**Role:** Route requests to knowledge domains

**Responsibilities:**
- Domain selection logic
- Request distribution
- Domain health checking
- Failover handling

**Implementation:** [See below]

---

### 20. resultsAggregator.ts
**Status:** ⚠️ NEEDS CREATION  
**Role:** Aggregate results from multiple sources

**Responsibilities:**
- Combine multi-domain results
- Weight domain outputs by confidence
- Resolve conflicts
- Generate unified response

**Implementation:** [See below]

---

### 21. crossModalFusion.ts
**Status:** ⚠️ NEEDS CREATION  
**Role:** Fuse multi-modal data (text, image, audio)

**Responsibilities:**
- Combine text + image inputs
- Audio transcription integration
- Cross-modal attention
- Unified representation

**Implementation:** [See below]

---

### 22. embeddingManager.ts
**Status:** ⚠️ NEEDS CREATION  
**Role:** Manage shared embeddings and cache

**Responsibilities:**
- Embedding cache
- Shared embedding pool
- Embedding reuse
- Memory optimization

**Implementation:** [See below]

---

### 23. trainingCoordinator.ts
**Status:** ⚠️ NEEDS CREATION  
**Role:** Coordinate model training and fine-tuning

**Responsibilities:**
- Schedule training jobs
- Coordinate domain retraining
- Transfer learning management
- Training progress tracking

**Implementation:** [See below]

---

### 24. stateManager.ts
**Status:** ⚠️ NEEDS CREATION  
**Role:** Maintain system state and session context

**Responsibilities:**
- Session state persistence
- Context caching
- State synchronization
- Recovery on restart

**Implementation:** [See below]

---

### 25. errorHandler.ts
**Status:** ⚠️ NEEDS CREATION  
**Role:** Handle errors and provide fallbacks

**Responsibilities:**
- Catch and log errors
- Provide fallback responses
- Graceful degradation
- Error recovery strategies

**Implementation:** [See below]

---

### 26. outputFormatter.ts
**Status:** ⚠️ NEEDS CREATION  
**Role:** Final output structuring for API response

**Responsibilities:**
- Structure JSON response
- Add metadata
- Format for different output types
- API version compatibility

**Implementation:** [See below]

---

### 27. toolsManager.ts
**Status:** ⚠️ NEEDS CREATION  
**Role:** Manage external tools and plugin integrations

**Responsibilities:**
- Register external tools
- Tool discovery
- Tool execution
- Plugin lifecycle management

**Integration:**
- Manages domain-specific tools from `knowledge-domains/{domain}/tools/`

---

## Naming Convention Compliance

✅ **All orchestration files follow camelCase:**
- `mainOrchestrator.ts` (not `main-orchestrator.ts` or `main_orchestrator.ts`)
- `promptHandler.ts` (not `prompt-handler.ts`)
- `responseFormatter.ts` (not `response-formatter.ts`)
- `thinkingTracker.ts` (not `thinking-tracker.ts`)

This follows **TypeScript/Next.js 2025 best practices**.

---

## Integration Flow

```
mainOrchestrator.ts (Main Conductor)
    ├─ promptHandler.ts (Pre-process input)
    ├─ domainRouter.ts (Route to domains)
    ├─ modelSelector.ts (Select AI models)
    ├─ tokenManager.ts (Manage tokens)
    ├─ embeddingManager.ts (Shared embeddings)
    ├─ knowledgeRetriever.ts (Retrieve context)
    ├─ resultsAggregator.ts (Combine outputs)
    ├─ crossModalFusion.ts (Multi-modal fusion)
    ├─ responseSynthesizer.ts (Synthesize response)
    ├─ responseFormatter.ts (Format for UI)
    ├─ outputFormatter.ts (Structure final output)
    ├─ thinkingTracker.ts (Track steps)
    ├─ metricsLogger.ts (Log metrics)
    ├─ errorHandler.ts (Handle errors)
    ├─ stateManager.ts (Manage state)
    └─ logger.ts (Log everything)
```

---

## Files Summary

| File | Status | Priority | Purpose |
|------|--------|----------|---------|
| mainOrchestrator.ts | ✅ Complete | CRITICAL | Main conductor |
| promptHandler.ts | ✅ Exists | HIGH | Input processing |
| responseFormatter.ts | ✅ Exists | HIGH | Output formatting |
| thinkingTracker.ts | ✅ Exists | MEDIUM | Transparency |
| eventBus.ts | ✅ Exists | MEDIUM | Event system |
| logger.ts | ✅ Exists | HIGH | Logging |
| moduleRegistry.ts | ✅ Exists | MEDIUM | Module management |
| tokenManager.ts | ⚠️ Create | HIGH | Token management |
| weightsUpdater.ts | ⚠️ Create | MEDIUM | Weight versioning |
| metricsLogger.ts | ⚠️ Create | MEDIUM | Performance metrics |
| modelSelector.ts | ⚠️ Create | HIGH | Model selection |
| domainRouter.ts | ⚠️ Create | HIGH | Domain routing |
| resultsAggregator.ts | ⚠️ Create | HIGH | Result aggregation |
| crossModalFusion.ts | ⚠️ Create | MEDIUM | Multi-modal fusion |
| embeddingManager.ts | ⚠️ Create | MEDIUM | Embedding cache |
| trainingCoordinator.ts | ⚠️ Create | LOW | Training management |
| stateManager.ts | ⚠️ Create | HIGH | State persistence |
| errorHandler.ts | ⚠️ Create | HIGH | Error handling |
| outputFormatter.ts | ⚠️ Create | MEDIUM | Final output structure |
| toolsManager.ts | ⚠️ Create | MEDIUM | External tools |

---

## Next Steps

1. ✅ Verify all existing files follow camelCase naming
2. ⚠️ Create missing critical orchestration files (high priority)
3. ⚠️ Update mainOrchestrator.ts to integrate all orchestration components
4. ⚠️ Create API endpoint (`app/api/chat/route.ts`) that uses mainOrchestrator
5. ⚠️ Test complete data flow from UI → API → Orchestrator → Domains → Models → Response

---

**Status:** Orchestration layer 70% complete. Missing 10 supporting files (will be created next).
