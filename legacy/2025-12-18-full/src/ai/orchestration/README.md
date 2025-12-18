# Orchestration

**Central AI Pipeline** | 7-Step Processing | Multi-Domain Coordination

> The orchestration layer coordinates all AI subsystems, routing queries through input processing, domain inference, LLM reasoning, and response synthesis. Includes learning metrics tracking.

---

## 🎯 Overview

The orchestration system is the **brain** of ZacAi-Atomic, managing:

✅ **Pipeline Coordination** - 7-step prompt→response flow  
✅ **Domain Routing** - Intelligent multi-domain query execution  
✅ **LLM Integration** - Unified transformer inference  
✅ **Response Synthesis** - Multi-source merging with confidence  
✅ **Metrics Tracking** - Complete learning feedback loop  

---

## 🏗️ Architecture

```
User Query
    ↓
┌────────────────────────────────────────┐
│  PromptHandler                         │
│  • Validation, sanitization           │
│  • Rate limiting, error handling      │
└────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────┐
│  MainOrchestrator                      │
│  ┌──────────────────────────────────┐ │
│  │ Step 1: Math Detection           │ │
│  │ Step 2: Input Processing         │ │
│  │ Step 3: Domain Routing           │ │
│  │ Step 4: Domain Inference (19)    │ │
│  │ Step 5: LLM Inference            │ │
│  │ Step 6: Response Synthesis       │ │
│  │ Step 7: Metrics Recording        │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────┐
│  ResponseFormatter                     │
│  • Markdown rendering                 │
│  • Code highlighting                  │
│  • Thinking steps transparency        │
└────────────────────────────────────────┘
    ↓
Final Response to User
```

---

## 📁 Module Structure

```
orchestration/
├── mainOrchestrator.ts          # ⭐ CENTRAL COORDINATOR
├── promptHandler.ts             # Request validation & preprocessing
├── responseFormatter.ts         # Output formatting
├── thinkingTracker.ts           # Transparency tracking
└── README.md
```

---

## 🚀 Usage

### Basic Orchestration

```typescript
import { mainOrchestrator } from '@/ai/orchestration/mainOrchestrator';

const response = await mainOrchestrator.processPrompt(
  "Explain TypeScript generics",
  "session-123"
);

console.log(response);
// {
//   text: "TypeScript generics allow...",
//   confidence: 0.88,
//   domains: ["typescript", "programming"],
//   metadata: {
//     thinkingSteps: [...],
//     processingTime: 234ms,
//     domainsUsed: 2,
//     llmUsed: true
//   }
// }
```

### With Thinking Steps

```typescript
const response = await mainOrchestrator.processPrompt(
  prompt,
  sessionId,
  { includeThinkingSteps: true }
);

response.metadata.thinkingSteps.forEach(step => {
  console.log(`[${step.phase}] ${step.description} (${step.duration}ms)`);
});
// [Input] Detected language: English (12ms)
// [Domain] Routing to: typescript, programming (5ms)
// [Inference] Domain inference complete (45ms)
// [LLM] Generated response (178ms)
// [Synthesis] Merged domain + LLM outputs (8ms)
```

---

## 🔬 7-Step Pipeline

### Step 1: Math Detection

```typescript
// Detect if query contains math expressions
const hasMath = /\d+[\+\-\*\/\^]\d+|equation|calculate|solve/.test(prompt);
if (hasMath) {
  thinkingTracker.addStep('math_detection', 'Math query detected');
  // Route to mathematics domain with higher priority
}
```

### Step 2: Input Processing

```typescript
// Clean and normalize input
const processedInput = await inputProcessor.process(prompt);
// • Remove extra whitespace
// • Normalize Unicode
// • Detect language
// • Extract entities
```

### Step 3: Domain Routing

```typescript
// Determine relevant domains based on query
const relevantDomains = await domainRouter.route(processedInput);
// Uses intent classification, keyword matching, ML scoring

// Example: "How to use React hooks in Next.js?"
// → ['react', 'nextjs', 'programming']
```

### Step 4: Domain Inference

```typescript
// Execute inference on selected domains in parallel
const domainResults = await domainQueryExecutor.queryDomainsByName(
  relevantDomains,
  processedInput
);

// Results filtered by confidence (>0.3)
// {
//   react: { output: "...", confidence: 0.92 },
//   nextjs: { output: "...", confidence: 0.85 },
//   programming: { output: "...", confidence: 0.78 }
// }
```

### Step 5: LLM Inference

```typescript
// Generate response using unified transformer
const llmResult = await llmInferenceEngine.generate(
  processedInput,
  {
    maxNewTokens: 150,
    temperature: 0.8,
    topK: 50,
    topP: 0.9,
  }
);

// Context includes domain results for enhanced reasoning
```

### Step 6: Response Synthesis

```typescript
// Merge domain + LLM results intelligently
const finalResponse = await responseSynthesizer.synthesize(
  llmResult,
  domainResults,
  processedInput
);

// 3 strategies:
// 1. Prioritize high-confidence domain results
// 2. Use LLM with domain context
// 3. Fallback to LLM only
```

### Step 7: Metrics Recording

```typescript
// Record for continuous learning
await learningMetricsTracker.recordInference({
  prompt: processedInput,
  response: finalResponse.text,
  confidence: finalResponse.confidence,
  domains: relevantDomains,
  models: ['unified-transformer-llm'],
  processingTime: Date.now() - startTime,
  metadata: {
    thinkingSteps: thinkingTracker.getSteps(),
    domainResults,
  },
});

// Metrics stored in data/learning/learnt.json
// Used by TrainingCoordinator for continuous improvement
```

---

## 🧩 Component Details

### MainOrchestrator

**File**: `mainOrchestrator.ts` (~500 lines)  
**Purpose**: Central pipeline coordinator

```typescript
class MainOrchestrator {
  async processPrompt(
    prompt: string, 
    sessionId: string, 
    options?: OrchestratorOptions
  ): Promise<OrchestratorResponse> {
    // 7-step pipeline implementation
    // Thinking tracker integration
    // Error handling & fallbacks
    // Metrics recording
  }
  
  async shutdown(): Promise<void> {
    // Flush metrics to disk
    // Cleanup resources
  }
}
```

**Key Features**:
- Math expression detection
- Multi-domain parallel execution
- Confidence-based filtering (>0.3)
- Graceful error handling
- Process exit handlers (SIGINT, SIGTERM)

### PromptHandler

**File**: `promptHandler.ts` (~200 lines)  
**Purpose**: Request validation & preprocessing

```typescript
class PromptHandler {
  async handlePrompt(
    prompt: string,
    sessionId?: string
  ): Promise<HandledPrompt> {
    // Input validation
    // Length limits (10-5000 chars)
    // Sanitization (XSS prevention)
    // Rate limiting (per session)
    // Error recovery
  }
}
```

**Validation Rules**:
- Minimum length: 10 characters
- Maximum length: 5000 characters
- Block malicious patterns
- Enforce rate limits (10 req/min per session)

### ResponseSynthesizer

**File**: `responseSynthesizer.ts` (~300 lines)  
**Purpose**: Multi-source response merging

```typescript
class ResponseSynthesizer {
  async synthesize(
    llmResult: string,
    domainResults: DomainResults,
    originalPrompt: string
  ): Promise<SynthesizedResponse> {
    // Select best strategy
    // Merge sources intelligently
    // Calculate final confidence
    // Format for user display
  }
}
```

**Synthesis Strategies**:

1. **Domain Expert** (confidence: 0.85)
   - Use when domain has high-confidence result (>0.7)
   - Domain output > 50 characters
   - Example: Math calculations, code formatting

2. **Hybrid** (confidence: 0.75)
   - Combine LLM reasoning + domain facts
   - Multiple domains with moderate confidence (0.3-0.7)
   - Example: Complex multi-domain queries

3. **LLM Only** (confidence: 0.6)
   - Fallback when no strong domain results
   - General conversation, creative tasks
   - Example: "Tell me a joke"

### ThinkingTracker

**File**: `thinkingTracker.ts` (~150 lines)  
**Purpose**: Pipeline transparency & debugging

```typescript
class ThinkingTracker {
  addStep(phase: string, description: string): void {
    // Record processing step with timestamp
  }
  
  getSteps(): ThinkingStep[] {
    // Return all steps with durations
  }
  
  clear(): void {
    // Reset for new request
  }
}

interface ThinkingStep {
  phase: string;           // 'input', 'domain', 'llm', 'synthesis'
  description: string;     // Human-readable step description
  startTime: number;
  duration?: number;       // Milliseconds
}
```

---

## 📊 Response Format

```typescript
interface OrchestratorResponse {
  text: string;                    // Final response text
  confidence: number;              // 0.0-1.0 overall confidence
  domains: string[];               // Domains used
  metadata: {
    thinkingSteps?: ThinkingStep[];
    processingTime: number;        // Total milliseconds
    domainsUsed: number;
    llmUsed: boolean;
    domainResults?: DomainResults;
    synthesisStrategy?: 'domain' | 'hybrid' | 'llm';
  };
}
```

---

## 🔧 Configuration

### LLM Config

```typescript
// mainOrchestrator.ts
const llmConfig = {
  numLayers: 12,
  numHeads: 12,
  embeddingDim: 768,
  hiddenDim: 3072,  // Added in Phase 1
  vocabSize: 50257,
  maxSequenceLength: 2048,
  dropoutRate: 0.1,
};
```

### Domain Routing

```typescript
// Confidence threshold for domain results
const MIN_DOMAIN_CONFIDENCE = 0.3;

// Max domains to query in parallel
const MAX_CONCURRENT_DOMAINS = 5;

// Domain priority weights
const domainWeights = {
  typescript: 1.2,
  programming: 1.0,
  general_knowledge: 0.8,
};
```

---

## 🧪 Testing

```typescript
describe('MainOrchestrator', () => {
  it('should route to correct domains', async () => {
    const response = await orchestrator.processPrompt(
      "Explain TypeScript interfaces",
      "test-session"
    );
    
    expect(response.domains).toContain('typescript');
    expect(response.confidence).toBeGreaterThan(0.7);
  });
  
  it('should handle math queries', async () => {
    const response = await orchestrator.processPrompt(
      "Calculate 15 * 23",
      "test-session"
    );
    
    expect(response.domains).toContain('mathematics');
    expect(response.text).toContain('345');
  });
});
```

---

## 📈 Performance

| Metric | Value | Notes |
|--------|-------|-------|
| **Total Latency** | 200-500ms | Depends on domains |
| **Domain Inference** | 20-100ms each | Parallel execution |
| **LLM Inference** | 100-300ms | Main bottleneck |
| **Synthesis** | 5-20ms | Fast merging |
| **Metrics Recording** | 1-5ms | Cached, flushed later |

---

## 🛠️ Maintenance

### Metrics Flushing

```typescript
// Automatic flush on process exit
process.on('SIGINT', async () => {
  await orchestrator.shutdown();  // Flushes metrics to disk
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await orchestrator.shutdown();
  process.exit(0);
});
```

### Error Recovery

```typescript
// Graceful degradation on domain failures
try {
  domainResults = await queryDomains(relevantDomains, input);
} catch (error) {
  console.error('Domain inference failed:', error);
  // Continue with LLM only
}
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Slow responses | Check domain inference times, reduce concurrent domains |
| Wrong domain routing | Update intent classifier, adjust domain weights |
| Low confidence scores | Improve domain semantic analyzers |
| Memory leaks | Ensure metrics are flushed, check ThinkingTracker cleanup |

---

## 📚 References

- [Orchestration Patterns](https://martinfowler.com/articles/patterns-of-distributed-systems/orchestration.html)
- [Pipeline Pattern](https://en.wikipedia.org/wiki/Pipeline_(software))
- [Chain of Responsibility](https://refactoring.guru/design-patterns/chain-of-responsibility)

---

## 🔜 Roadmap

- [ ] Dynamic domain routing with ML
- [ ] A/B testing for synthesis strategies
- [ ] Caching layer for repeated queries
- [ ] Streaming responses (Server-Sent Events)
- [ ] Multi-turn conversation context
- [ ] Real-time performance dashboard

---

**Status**: ✅ Production | **All 3 Phases Complete**  
**Flow**: User → PromptHandler → MainOrchestrator → (Domains + LLM) → ResponseSynthesizer → User  
**Metrics**: Every inference recorded for continuous learning
