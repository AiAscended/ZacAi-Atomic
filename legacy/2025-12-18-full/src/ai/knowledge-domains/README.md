# Knowledge Domains

**19 Specialized Domain Engines** | Real Inference Controllers | Confidence Scoring

> Domain-specific intelligence modules that handle specialized queries with pretrained weights, semantic analysis, and custom tokenization. Integrated with the main orchestrator for intelligent routing.

---

## 🎯 Overview

Each knowledge domain is a self-contained inference engine with:

✅ **Domain-Specific Inference** - Specialized logic for domain expertise  
✅ **Custom Tokenization** - Domain-aware token processing  
✅ **Semantic Analysis** - Topic extraction and confidence scoring  
✅ **Pretrained Weights** - Domain-specific model parameters  

---

## 📋 Available Domains (19 Total)

| Domain | Purpose | Inference Controller |
|--------|---------|---------------------|
| **mathematics** | Math calculations, proofs, equations | `mathematicsRunInference` |
| **typescript** | TypeScript code, types, interfaces | `typescriptRunInference` |
| **programming** | General programming concepts | `programmingRunInference` |
| **nextjs** | Next.js framework, App Router, RSC | `nextjsRunInference` |
| **react** | React components, hooks, patterns | `reactRunInference` |
| **english** | Grammar, writing, linguistics | `englishRunInference` |
| **testing** | Unit tests, integration tests, TDD | `testingRunInference` |
| **security** | Security vulnerabilities, best practices | `securityRunInference` |
| **api_design** | REST, GraphQL, API patterns | `apiDesignRunInference` |
| **database** | SQL, NoSQL, schema design | `databaseRunInference` |
| **devops** | CI/CD, Docker, Kubernetes | `devopsRunInference` |
| **algorithms** | Data structures, Big-O, sorting | `algorithmsRunInference` |
| **accessibility** | WCAG, ARIA, a11y patterns | `accessibilityRunInference` |
| **performance** | Optimization, profiling, metrics | `performanceRunInference` |
| **ui_ux** | Design systems, user experience | `uiUxRunInference` |
| **documentation** | Technical writing, API docs | `documentationRunInference` |
| **version_control** | Git, branching strategies | `versionControlRunInference` |
| **general_knowledge** | Fallback for general queries | `generalKnowledgeRunInference` |
| **code_review** | Code quality, best practices | `codeReviewRunInference` |

---

## 🏗️ Domain Structure

Each domain follows this atomic structure:

```
{domain}/
├── {domain}_inferenceController.ts  # Main inference logic
├── {domain}_tokenizer.ts            # Domain-specific tokenization
├── {domain}_semanticAnalyzer.ts     # Topic extraction & confidence
├── weights/
│   └── {domain}_pretrained_weights.json  # Pretrained parameters
└── README.md  # Domain-specific documentation
```

---

## 🚀 Usage

### Query Single Domain

```typescript
import { domainQueryExecutor } from '@/ai/inference/domainQueryExecutor';

const results = await domainQueryExecutor.queryDomainsByName(
  ["typescript", "programming"],
  "Explain TypeScript generics"
);

// Results:
// {
//   typescript: {
//     output: "Generics in TypeScript allow...",
//     confidence: 0.92,
//     topics: ["generics", "type-parameters"],
//     metadata: { processingTime: 45ms }
//   },
//   programming: {
//     output: "Generics are a way to...",
//     confidence: 0.78,
//     ...
//   }
// }
```

### Automatic Domain Routing

```typescript
import { mainOrchestrator } from '@/ai/orchestration/mainOrchestrator';

// Orchestrator automatically routes to relevant domains
const response = await mainOrchestrator.processPrompt(
  "How do I optimize React performance?",
  "session-123"
);

// Internally routes to: react, performance, programming domains
// Returns synthesized response with confidence scores
```

---

## 🔬 Domain Inference Flow

```
User Query
    ↓
Domain Routing (in MainOrchestrator)
    ↓
┌─────────────────────────────────────┐
│  DomainQueryExecutor                │
│  • Load domain controller dynamically
│  • Support multiple export patterns
│  • Execute inference
│  • Collect confidence & metadata
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Domain Inference Controller        │
│  1. Tokenize input (domain-specific)
│  2. Semantic analysis (topics/entities)
│  3. Apply domain logic & weights
│  4. Generate response
│  5. Calculate confidence
└─────────────────────────────────────┘
    ↓
Domain Results → ResponseSynthesizer → Final Answer
```

---

## 🧩 Example: TypeScript Domain

### Inference Controller

```typescript
// typescript/typescript_inferenceController.ts

export async function typescriptRunInference(
  inputText: string
): Promise<DomainInferenceResult> {
  // 1. Tokenize with TypeScript-aware tokenizer
  const tokens = await typescriptTokenizer.tokenize(inputText);
  
  // 2. Semantic analysis (extract TS concepts)
  const analysis = await typescriptSemanticAnalyzer.analyze(inputText);
  
  // 3. Load pretrained weights
  const weights = await loadPretrainedWeights('typescript');
  
  // 4. Apply domain-specific logic
  const output = await typescriptInference(tokens, weights, analysis);
  
  // 5. Calculate confidence based on TS keyword matches
  const confidence = calculateConfidence(analysis);
  
  return {
    output,
    confidence,  // 0.0 - 1.0
    topics: analysis.topics,  // ['generics', 'interfaces']
    metadata: { processingTime, tokenCount },
  };
}
```

### Tokenizer

```typescript
// typescript/typescript_tokenizer.ts

export const typescriptTokenizer = {
  // Recognize TS-specific syntax
  keywords: ['interface', 'type', 'generic', 'namespace', ...],
  
  tokenize(text: string): Token[] {
    // Handle TS code blocks, type annotations
    // Preserve code structure
    // Return domain-aware tokens
  }
};
```

### Semantic Analyzer

```typescript
// typescript/typescript_semanticAnalyzer.ts

export const typescriptSemanticAnalyzer = {
  analyze(text: string): SemanticAnalysis {
    return {
      topics: extractTopics(text),          // ['generics', 'utility-types']
      entities: extractEntities(text),      // Type names, interfaces
      complexity: assessComplexity(text),   // Basic/Intermediate/Advanced
      confidence: calculateConfidence(text), // Based on keyword matches
    };
  }
};
```

---

## 📊 Domain Response Format

```typescript
interface DomainInferenceResult {
  output: string;              // Generated response
  confidence: number;          // 0.0 - 1.0 (domain expertise level)
  topics: string[];            // Extracted topics
  metadata?: {
    processingTime?: number;   // Milliseconds
    tokenCount?: number;
    modelVersion?: string;
    [key: string]: any;
  };
}
```

---

## 🎛️ Integration Points

### 1. Domain Registry

```typescript
// Used by orchestrator to discover domains
export const domainRegistry = {
  typescript: true,
  programming: true,
  nextjs: true,
  // ... all 19 domains
};
```

### 2. Dynamic Loading

```typescript
// domainQueryExecutor.ts dynamically imports controllers
const controller = await import(
  `../knowledge-domains/${domain}/${domain}_inferenceController`
);

// Supports multiple export patterns:
// - Named: export { typescriptRunInference }
// - runInference: export { runInference }
// - default: export default function runInference()
```

### 3. Response Synthesis

```typescript
// responseSynthesizer.ts merges multi-domain results
const strategy = selectStrategy(llmResult, domainResults);

// Strategy 1: Prioritize substantial domain results (>50 chars, conf>0.3)
// Strategy 2: Use LLM with domain context
// Strategy 3: Fallback to LLM only
```

---

## 🧪 Testing Domains

```typescript
// Test domain inference
describe('TypeScript Domain', () => {
  it('should handle generic type queries', async () => {
    const result = await typescriptRunInference(
      "Explain TypeScript generics"
    );
    
    expect(result.confidence).toBeGreaterThan(0.7);
    expect(result.topics).toContain('generics');
  });
  
  it('should return low confidence for unrelated queries', async () => {
    const result = await typescriptRunInference("Recipe for pizza");
    expect(result.confidence).toBeLessThan(0.3);
  });
});
```

---

## 🛠️ Adding New Domains

1. **Create domain folder**:
   ```bash
   mkdir src/ai/knowledge-domains/my_domain
   ```

2. **Implement required files**:
   ```typescript
   // my_domain_inferenceController.ts
   export async function myDomainRunInference(input: string) {
     // Domain logic here
     return { output, confidence, topics, metadata };
   }
   
   // my_domain_tokenizer.ts
   export const myDomainTokenizer = {
     tokenize(text) { /* ... */ }
   };
   
   // my_domain_semanticAnalyzer.ts
   export const myDomainSemanticAnalyzer = {
     analyze(text) { /* ... */ }
   };
   ```

3. **Add to domain registry**:
   ```typescript
   // domainRegistry.ts
   export const domainRegistry = {
     // ...existing
     my_domain: true,
   };
   ```

4. **Create pretrained weights**:
   ```bash
   node scripts/generate_pretrained_weights.js my_domain
   ```

---

## 📈 Performance

| Metric | Typical Value |
|--------|--------------|
| **Inference Time** | 20-100ms per domain |
| **Confidence Range** | 0.3-0.95 (domain-dependent) |
| **Concurrent Domains** | 3-5 per query |
| **Memory** | ~50MB per domain (weights) |

---

## 🔧 Configuration

### Domain Weighting

```typescript
// mainOrchestrator.ts
const domainWeights = {
  typescript: 1.2,      // Boost TypeScript results
  programming: 1.0,     // Standard weight
  general_knowledge: 0.8, // Reduce fallback weight
};
```

### Confidence Thresholds

```typescript
// responseSynthesizer.ts
const MIN_CONFIDENCE = 0.3;  // Filter low-confidence domains
const HIGH_CONFIDENCE = 0.7;  // Prioritize high-confidence
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Domain not loading | Check export name matches pattern |
| Low confidence scores | Improve semantic analyzer keyword matching |
| Slow inference | Optimize weights, cache tokenizer |
| Wrong domain routing | Update intent classifier in orchestrator |

---

## 📚 References

- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Mixture of Experts](https://arxiv.org/abs/1701.06538) - Multi-model approach
- [Semantic Analysis](https://en.wikipedia.org/wiki/Semantic_analysis_(compilers))

---

## 🔜 Roadmap

- [ ] Domain-specific fine-tuning pipeline
- [ ] Cross-domain knowledge transfer
- [ ] Hierarchical domain relationships
- [ ] A/B testing for domain routing
- [ ] Real-time domain performance dashboard

---

**Status**: ✅ Production | **Phase 2 Complete** | 19 Domains Operational  
**Integration**: MainOrchestrator → DomainQueryExecutor → Domain Controllers → ResponseSynthesizer
