# ZacAi-Atomic System Data Flow Documentation

## Complete Request-Response Pipeline

This document traces the complete data flow from user input to response display across the entire ZacAi-Atomic hybrid AI system.

---

## 📊 High-Level Flow Diagram

```
User Input (Browser)
    ↓
app/page.tsx (Chat UI Component)
    ↓
app/api/chat/route.ts (API Endpoint)
    ↓
ai/orchestration/mainOrchestrator.ts (Main Conductor)
    ↓
┌─────────────────────────────────────────────────┐
│         INPUT PROCESSING LAYER                  │
├─────────────────────────────────────────────────┤
│  ai/input_processing/promptProcessor.ts         │
│  - Clean & normalize prompt                     │
│  - Extract keywords                             │
│  - Decompose into subtasks                      │
│  - Tokenize for models                          │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│         DOMAIN ROUTING LAYER                    │
├─────────────────────────────────────────────────┤
│  mainOrchestrator.identifyRelevantDomains()     │
│  - Keyword matching                             │
│  - Context analysis                             │
│  - Route to knowledge domains                   │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│         KNOWLEDGE DOMAIN INFERENCE              │
├─────────────────────────────────────────────────┤
│  ai/knowledge-domains/{domain}/                 │
│    ├─ {domain}_tokenizer.ts                     │
│    ├─ {domain}_inferenceController.ts           │
│    ├─ seeds/{domain}_seeds.json                 │
│    ├─ weights/{domain}_pretrained_weights.json  │
│    └─ tools/{domain}-SpecificTool.ts            │
│                                                  │
│  Each domain processes independently:           │
│  1. Tokenize with domain-specific tokenizer     │
│  2. Load domain weights & seeds                 │
│  3. Run inference with domain model             │
│  4. Use domain-specific tools                   │
│  5. Return domain-specific result               │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│         AI MODEL INFERENCE                      │
├─────────────────────────────────────────────────┤
│  ai/models/unified-transformer-llm/             │
│    ├─ llm-inference/llm-inferenceEngine.ts      │
│    ├─ llm-model/llm-tokenizer.ts                │
│    ├─ llm-model/llm-transformerBlocks.ts        │
│    └─ llm-weights/pretrained.bin                │
│                                                  │
│  LLM Processing:                                │
│  1. Tokenize enriched prompt                    │
│  2. Load model weights                          │
│  3. Run transformer inference                   │
│  4. Generate response tokens                    │
│  5. Decode to text                              │
│                                                  │
│  Other models (when needed):                    │
│  - CNN: Image understanding                     │
│  - RNN: Sequential data                         │
│  - ViT: Vision tasks                            │
│  - Multi-Modal: Cross-modal fusion              │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│         RESPONSE SYNTHESIS                      │
├─────────────────────────────────────────────────┤
│  ai/output_generation/responseSynthesizer.ts    │
│  - Combine LLM output                           │
│  - Merge domain-specific results                │
│  - Resolve conflicts                            │
│  - Calculate confidence scores                  │
│  - Generate sources list                        │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│         RESPONSE FORMATTING                     │
├─────────────────────────────────────────────────┤
│  ai/orchestration/responseFormatter.ts          │
│  - Parse markdown                               │
│  - Extract code blocks                          │
│  - Syntax highlighting metadata                 │
│  - Format text blocks                           │
│  - Add punctuation/grammar                      │
│  - Structure for UI display                     │
└─────────────────────────────────────────────────┘
    ↓
app/api/chat/route.ts (Return JSON Response)
    ↓
app/page.tsx (Update UI State)
    ↓
components/ResponseRenderer-v2.tsx (Display Response)
    ├─ components/code/CodeBlock.tsx (Syntax Highlighted Code)
    └─ components/ThinkingSteps.tsx (Show Processing Steps)
    ↓
User sees formatted response in browser
```

---

## 🗂️ Detailed File-by-File Flow

### 1. Entry Point: User Interface

**File:** `src/app/page.tsx`
- **Role:** Chat UI component (React)
- **Function:** Capture user input, display messages
- **Key Actions:**
  - User types prompt in textarea
  - `handleSubmit()` triggered on Enter or button click
  - Calls `/api/chat` endpoint with prompt
  - Receives response and updates message state
  - Renders response with `ResponseRenderer`

**Key Code:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  const res = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ action: "chat", message: userInput, sessionId }),
  })
  const data = await res.json()
  setMessages([...prev, { role: "assistant", ...data }])
}
```

---

### 2. API Gateway

**File:** `src/app/api/chat/route.ts`
- **Role:** Next.js API route handler
- **Function:** Bridge between frontend and AI orchestration
- **Key Actions:**
  - Receive POST request from frontend
  - Extract prompt and session ID
  - Call `mainOrchestrator.processPrompt()`
  - Return formatted JSON response

**Key Code:**
```typescript
import { mainOrchestrator } from "@/ai/orchestration/mainOrchestrator"

export async function POST(request: Request) {
  const { message, sessionId } = await request.json()
  
  const response = await mainOrchestrator.processPrompt(
    message,
    sessionId,
    context
  )
  
  return NextResponse.json(response)
}
```

---

### 3. Main Orchestrator (Conductor)

**File:** `src/ai/orchestration/mainOrchestrator.ts`
- **Role:** Central coordination hub
- **Function:** Orchestrate entire AI pipeline
- **Key Actions:**
  1. **Input Processing:** Clean and tokenize prompt
  2. **Domain Selection:** Route to relevant knowledge domains
  3. **Domain Inference:** Query specialized inference engines
  4. **LLM Inference:** Generate response with LLM
  5. **Response Synthesis:** Merge multi-source results
  6. **Response Formatting:** Prepare for UI display

**Key Methods:**
```typescript
class MainOrchestrator {
  async processPrompt(prompt: string, sessionId: string): Promise<OrchestratorResponse> {
    // Step 1: Input processing
    const cleaned = this.promptProcessor.process(prompt)
    const subtasks = await this.promptProcessor.decomposeSubtasks(cleaned)
    
    // Step 2: Domain routing
    const domains = this.identifyRelevantDomains(cleaned, subtasks)
    
    // Step 3: Domain inference
    const domainResults = await this.queryKnowledgeDomains(domains, subtasks)
    
    // Step 4: LLM inference
    const enrichedPrompt = this.buildEnrichedPrompt(cleaned, domainResults)
    const llmResponse = await this.llmInferenceEngine.predict(enrichedPrompt)
    
    // Step 5: Synthesis
    const synthesized = this.responseSynthesizer.synthesize({
      llmOutput: llmResponse,
      domainOutputs: domainResults,
    })
    
    // Step 6: Formatting
    const formatted = formatResponse(synthesized.text)
    
    return { text, metadata, domains, confidence, contentBlocks }
  }
}
```

**Dependencies:**
- `PromptProcessor` (input processing)
- `DomainQueryExecutor` (domain inference)
- `ResponseSynthesizer` (output merging)
- `LLMInferenceEngine` (model inference)

---

### 4. Input Processing Layer

**File:** `src/ai/input_processing/promptProcessor.ts`
- **Role:** Clean and prepare user input
- **Function:**
  - Remove noise (extra spaces, special chars)
  - Normalize text
  - Extract keywords
  - Tokenize for downstream processing
  - Decompose complex prompts into subtasks

**Key Methods:**
```typescript
class PromptProcessor {
  process(rawPrompt: string): string {
    // Clean, normalize, remove noise
  }
  
  async decomposeSubtasks(prompt: string): Promise<string[]> {
    // Break complex queries into subtasks
  }
  
  extractKeywords(prompt: string): string[] {
    // Extract meaningful keywords for routing
  }
}
```

---

### 5. Domain Routing

**File:** `src/ai/orchestration/mainOrchestrator.ts` (method)
- **Role:** Identify relevant knowledge domains
- **Function:** Keyword matching and context analysis
- **Logic:**
  - Match prompt keywords to domain patterns
  - Score domain relevance
  - Return top N domains
  - Always include "general" as fallback

**Example:**
```typescript
private identifyRelevantDomains(prompt: string): string[] {
  const domainKeywords = {
    mathematics: ["math", "calculate", "equation"],
    typescript: ["typescript", "type", "interface"],
    react: ["react", "component", "jsx"],
    nextjs: ["next.js", "app router", "server component"],
  }
  
  // Match keywords and return relevant domains
}
```

---

### 6. Knowledge Domain Inference

**Location:** `src/ai/knowledge-domains/{domain}/`

Each domain (19 total) has this structure:

**Files:**
- `{domain}_tokenizer.ts` - Domain-specific tokenization
- `{domain}_inferenceController.ts` - Inference orchestration
- `{domain}_modelArchitecture.ts` - Neural network layers
- `{domain}_modelWeightsLoader.ts` - Load pretrained weights
- `seeds/{domain}_seeds.json` - Training seed data
- `weights/{domain}_pretrained_weights.json` - Model weights
- `tools/{domain}-ToolName.ts` - Domain-specific utilities

**Inference Flow:**
```typescript
// In {domain}_inferenceController.ts
class DomainInferenceController {
  async infer(input: string): Promise<string> {
    // 1. Tokenize with domain tokenizer
    const tokens = this.tokenizer.tokenize(input)
    
    // 2. Load domain weights
    const weights = this.weightsLoader.load()
    
    // 3. Run domain-specific model
    const output = this.model.forward(tokens, weights)
    
    // 4. Use domain tools if needed
    const enhanced = this.tools.enhance(output)
    
    // 5. Return result
    return enhanced
  }
}
```

**Examples:**

**English Domain:**
- Tokenizer: Word-level, handles grammar
- Tools: SpellChecker, GrammarChecker
- Output: Grammar-corrected text

**Mathematics Domain:**
- Tokenizer: Math expression parser
- Tools: Calculator, EquationSolver
- Output: Solved equations with steps

**TypeScript Domain:**
- Tokenizer: Code-aware tokenizer
- Tools: TypeChecker, CodeFormatter
- Output: Type-safe code suggestions

---

### 7. AI Model Inference

**Location:** `src/ai/models/unified-transformer-llm/`

**Key Files:**
- `llm-inference/llm-inferenceEngine.ts` - Main inference API
- `llm-model/llm-tokenizer.ts` - Tokenization
- `llm-model/llm-embedding.ts` - Token embeddings
- `llm-model/llm-transformerBlocks.ts` - Attention layers
- `llm-model/llm-decoder.ts` - Token generation
- `llm-weights/pretrained.bin` - Model parameters

**Inference Process:**
```typescript
class LLMInferenceEngine {
  async predict(prompt: string): Promise<string> {
    // 1. Tokenize
    const tokens = this.tokenizer.encode(prompt)
    
    // 2. Embed
    const embeddings = this.embedding.embed(tokens)
    
    // 3. Transformer forward pass
    const hidden = this.encoder.forward(embeddings)
    
    // 4. Decode
    const outputTokens = this.decoder.generate(hidden)
    
    // 5. Detokenize
    return this.tokenizer.decode(outputTokens)
  }
}
```

**Other Models (when needed):**
- **CNN:** Image classification, feature extraction
- **RNN:** Sequential data, time-series
- **ViT:** Vision transformer for images
- **Multi-Modal:** Fusion of text + image + audio

---

### 8. Response Synthesis

**File:** `src/ai/output_generation/responseSynthesizer.ts`
- **Role:** Merge multi-source outputs
- **Function:**
  - Combine LLM output
  - Integrate domain-specific results
  - Resolve conflicts between sources
  - Calculate confidence scores
  - Generate source citations

**Logic:**
```typescript
class ResponseSynthesizer {
  synthesize(inputs: {
    llmOutput: string
    domainOutputs: Array<{ domain: string; result: string }>
    originalPrompt: string
  }): SynthesizedResponse {
    // 1. Parse LLM output
    let finalText = inputs.llmOutput
    
    // 2. Enrich with domain knowledge
    for (const { domain, result } of inputs.domainOutputs) {
      finalText = this.mergeDomainResult(finalText, result, domain)
    }
    
    // 3. Calculate confidence
    const confidence = this.calculateConfidence(finalText, inputs)
    
    // 4. Generate sources
    const sources = inputs.domainOutputs.map(d => d.domain)
    
    return { text: finalText, confidence, sources }
  }
}
```

---

### 9. Response Formatting

**File:** `src/ai/orchestration/responseFormatter.ts`
- **Role:** Format response for UI display
- **Function:**
  - Parse markdown
  - Extract code blocks with language
  - Add syntax highlighting metadata
  - Format text blocks
  - Structure for React components

**Key Features:**
```typescript
function formatResponse(text: string): FormattedResponse {
  const textBlocks: TextBlock[] = []
  const codeBlocks: CodeBlock[] = []
  
  // Parse markdown code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  
  let match
  while ((match = codeBlockRegex.exec(text)) !== null) {
    codeBlocks.push({
      id: generateId(),
      language: match[1] || "text",
      code: match[2],
    })
  }
  
  // Extract text blocks (non-code)
  const textParts = text.split(/```[\s\S]*?```/)
  textBlocks = textParts.map(content => ({
    id: generateId(),
    content: content.trim(),
  }))
  
  return { textBlocks, codeBlocks }
}
```

---

### 10. UI Rendering

**File:** `src/components/ResponseRenderer-v2.tsx`
- **Role:** Display formatted AI response
- **Function:**
  - Render text blocks with markdown
  - Render code blocks with syntax highlighting
  - Show thinking steps (expandable)
  - Display confidence scores
  - Show source citations

**Components Used:**
- `CodeBlock.tsx` - Syntax-highlighted code
- `ThinkingSteps.tsx` - Processing step visualization
- `MarkdownRenderer.tsx` - Markdown text rendering

---

## 🔧 Supporting Utilities

### Event Bus
**File:** `src/ai/orchestration/eventBus.ts`
- Pub/sub system for inter-component communication

### Logger
**File:** `src/ai/orchestration/logger.ts`
- Centralized logging for debugging

### Thinking Tracker
**File:** `src/ai/orchestration/thinkingTracker.ts`
- Track processing steps for transparency

### Token Manager
**File:** `src/ai/orchestration/tokenManager.ts`
- Manage token limits and context windows

### Weights Updater
**File:** `src/ai/orchestration/weightsUpdater.ts`
- Handle model weight versioning and updates

### Metrics Logger
**File:** `src/ai/orchestration/metricsLogger.ts`
- Performance monitoring and analytics

---

## 🎯 Integration Points

### Knowledge Domain Registry
**File:** `src/ai/knowledge-domains/domainRegistry.ts`
- Central registry for all 19 knowledge domains
- Provides `getDomain()` and `listDomains()` APIs

### Domain Registration
**Files:** `src/ai/knowledge-domains/{domain}/{domain}_domainRegistrar.ts`
- Each domain self-registers on import
- Provides domain metadata and APIs

### GitHub Integration
**Location:** `src/ai/utils/github-app-utils/`
- GitHub App authentication
- Repository access (read/write)
- Commit and file operations
- Webhook handling

**Admin UI:** `src/app/admin/integrations/github-app/page.tsx`

---

## 📊 Data Structures

### Message Interface (UI)
```typescript
interface Message {
  id: string
  role: "user" | "assistant" | "error"
  content: string
  contentBlocks?: {
    textBlocks: Array<{ id: string; content: string }>
    codeBlocks: Array<{ id: string; language: string; code: string }>
  }
  thinkingSteps?: Array<{
    step: string
    description: string
    timestamp: number
  }>
}
```

### OrchestratorResponse Interface
```typescript
interface OrchestratorResponse {
  text: string
  metadata: {
    thinkingSteps?: ThinkingStep[]
    processingTime?: number
    tokensUsed?: number
    modelsInvoked?: string[]
    domainsQueried?: string[]
  }
  domains: string[]
  confidence: number
  sources?: string[]
  contentBlocks?: {
    textBlocks: TextBlock[]
    codeBlocks: CodeBlock[]
  }
}
```

---

## 🚀 Initialization Sequence

```
1. App Start (src/app/page.tsx)
   ↓
2. Call /api/chat with action="initialize"
   ↓
3. API route calls mainOrchestrator.initialize()
   ↓
4. MainOrchestrator initialization:
   - Initialize LLM (load weights)
   - Load all 19 knowledge domains
   - Register domain inference controllers
   - Initialize specialized models (CNN, RNN, etc.)
   - Verify configurations
   ↓
5. Return sessionId to frontend
   ↓
6. UI ready for chat
```

---

## 🔄 Request-Response Cycle (Summary)

1. **User Input** → Browser textarea
2. **HTTP POST** → `/api/chat` endpoint
3. **Main Orchestrator** → Coordinates pipeline
4. **Input Processing** → Clean, tokenize, extract keywords
5. **Domain Routing** → Select relevant knowledge domains
6. **Domain Inference** → Parallel domain-specific processing
7. **LLM Inference** → Generate response with enriched context
8. **Response Synthesis** → Merge LLM + domain outputs
9. **Response Formatting** → Parse, structure for UI
10. **HTTP Response** → JSON back to frontend
11. **UI Render** → Display with syntax highlighting
12. **User Views** → Formatted response in chat

---

## 📁 File Path Reference

| Component | File Path |
|-----------|-----------|
| Chat UI | `src/app/page.tsx` |
| API Gateway | `src/app/api/chat/route.ts` |
| Main Orchestrator | `src/ai/orchestration/mainOrchestrator.ts` |
| Prompt Processor | `src/ai/input_processing/promptProcessor.ts` |
| Domain Registry | `src/ai/knowledge-domains/domainRegistry.ts` |
| LLM Engine | `src/ai/models/unified-transformer-llm/llm-inference/llm-inferenceEngine.ts` |
| Response Synthesizer | `src/ai/output_generation/responseSynthesizer.ts` |
| Response Formatter | `src/ai/orchestration/responseFormatter.ts` |
| Response Renderer | `src/components/ResponseRenderer-v2.tsx` |
| Code Block Component | `src/components/code/CodeBlock.tsx` |
| Thinking Steps Component | `src/components/ThinkingSteps.tsx` |
| GitHub Utils | `src/ai/utils/github-app-utils/` |
| GitHub Admin UI | `src/app/admin/integrations/github-app/page.tsx` |

---

## ✅ System Status

- **Knowledge Domains:** 19 complete
- **AI Models:** 13 complete
- **Orchestration Files:** All camelCase naming
- **Data Flow:** Fully documented
- **Integration:** End-to-end connected

**Ready for production implementation!**
