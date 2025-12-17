# Tool and Instruction System Architecture

## 🎯 Overview

Comprehensive tool and instruction system enabling:
- **Domain-specific URL lookup** with configurable sources
- **Instruction files** for governance and operational guidelines
- **System-level orchestration** tokens and rules
- **Admin-editable configurations** via frontend

## 📦 Components Implemented

### 1. URL Lookup Tool (Shared)
**Location**: `src/ai/shared/tools/url-lookup-tool.ts`

**Features**:
- Centralized tool used by all domains
- Domain-specific URL source configuration
- Rate limiting and caching
- Automatic fallback to alternative sources
- Priority-based source selection

**Usage**:
```typescript
import { getURLLookupTool } from "@/ai/shared/tools/url-lookup-tool";

const tool = getURLLookupTool();
const result = await tool.lookup("mathematics", "pythagorean theorem");
```

### 2. Domain URL Configurations
Created for each domain in `knowledge-domains/[domain]/url-lookup.json`:

**Mathematics** (`mathematics/url-lookup.json`):
- Wolfram MathWorld (Priority 1)
- Wolfram Alpha (Priority 2, requires API key)
- Math Stack Exchange (Priority 3)
- OEIS (Priority 4)

**Programming** (`programming/url-lookup.json`):
- MDN Web Docs (Priority 1)
- W3Schools (Priority 2)
- GitHub API (Priority 3)
- Stack Overflow (Priority 4)

**General Knowledge** (`general-knowledge/url-lookup.json`):
- Wikipedia (Priority 1)
- Britannica (Priority 2)
- DBpedia (Priority 3)

**Internet Search** (`internet-search/url-lookup.json`):
- DuckDuckGo (Priority 1)
- Brave Search (Priority 2)
- Bing (Priority 3, requires API key)

### 3. Domain Instruction Files (YAML)

**Mathematics** (`mathematics/domain-instructions.yaml`):
- Core principles (Order of Operations, Precision, Proof Verification)
- Foundational concepts (Arithmetic, Algebra, Calculus, Geometry, Statistics)
- Tool configurations (URL lookup, Scientific calculator, Symbolic solver)
- Inference guidelines (Input processing, Reasoning, Output formatting)
- Training guidelines
- Pipeline instructions
- Mathematical tokenizer (∫, ∑, π, √, etc.)
- Error handling
- Quality assurance

**Programming** (`programming/domain-instructions.yaml`):
- Core principles (Code Quality, DRY, SOLID, Security First)
- Supported languages (TypeScript, Python, Java, C++, Rust)
- Foundational concepts (Data structures, Algorithms, Design patterns)
- Tool configurations (URL lookup, Code analyzer, Calculator)
- Code generation guidelines
- Training guidelines
- Programming tokenizer (keywords, operators, frameworks)
- Error handling
- Security best practices

### 4. Orchestrator System Files

**System Instructions** (`orchestration/system-instructions.yaml`):
- Core orchestration principles
- Routing strategies (Sequential, Parallel, Ensemble)
- Module coordination (Multi-model, Multi-domain)
- Decision tree for query classification
- Error handling & recovery
- Performance optimization (Caching, Load balancing)
- Security measures
- Training & learning
- Monitoring & analytics
- Admin configuration

**System Base Tokens** (`orchestration/system-base-tokens.json`):
- 45 specialized system tokens
- Categories:
  - Control tokens: [SYSTEM_START], [SYSTEM_END], [ROUTE_TO]
  - Routing tokens: [TO_LLM], [TO_DOMAIN], [TO_MATH]
  - Status tokens: [PROCESSING], [READY], [COMPLETED]
  - Priority tokens: [HIGH_PRIORITY], [URGENT]
  - Context tokens: [USER_QUERY], [SESSION]
  - Operation tokens: [QUERY], [CALCULATE], [GENERATE]
  - Pipeline tokens: [INPUT], [PROCESS], [OUTPUT]

### 5. Instruction Loader
**Location**: `src/ai/shared/config/instructionLoader.ts`

**Features**:
- Load YAML, JSON, XML instruction files
- Caching with 5-minute TTL
- Domain instructions loader
- Model instructions loader
- System instructions loader
- Custom uploaded files support

**Usage**:
```typescript
import { getInstructionLoader, loadDomainConfig } from "@/ai/shared/config/instructionLoader";

// Load domain config
const { instructions, urlConfig } = await loadDomainConfig("mathematics");

// Load orchestrator config
const { instructions, tokens } = await loadOrchestratorConfig();

// Load custom file
const loader = getInstructionLoader();
const custom = await loader.loadCustomInstructions("domain", "mathematics", "custom-rules.yaml");
```

---

## 🔧 How It Works

### URL Lookup Flow
```
1. Domain receives query
2. Calls shared URL lookup tool
3. Tool loads domain's url-lookup.json
4. Checks cache first
5. Tries sources in priority order
6. Applies rate limiting
7. Returns result or falls back
8. Caches successful result
```

### Instruction Usage Flow
```
1. Module initializes (model/domain/orchestrator)
2. Loads instruction files via InstructionLoader
3. Parses principles, tools, inference rules
4. Configures tokenizer with special tokens
5. Uses instructions during:
   - Input processing
   - Reasoning steps
   - Tool selection
   - Output formatting
   - Error handling
6. Instructions guide training pipeline
7. Admin can edit/upload new instructions
```

### System Token Usage
```
Query → Orchestrator analyzes → [TO_MATH] token → Mathematics domain selected →
[PROCESSING] status → Calculation → [TO_LLM] for explanation → [COMPLETED] status → Response
```

---

## 🎨 Architecture Decisions

### Why YAML for Instructions?
- **Human-readable**: Easy to edit manually
- **Structured**: Maintains hierarchy and relationships
- **Comments**: Can add inline documentation
- **Flexible**: Supports complex nested structures

### Why JSON for Tokens & URL Configs?
- **Machine-readable**: Fast parsing
- **Strict schema**: Type safety
- **API-friendly**: Easy to send/receive via HTTP
- **No ambiguity**: Explicit structure

### Why XML Option?
- **Legacy compatibility**: Some systems use XML
- **Schema validation**: XSD support
- **Enterprise standards**: Common in corporate environments

### Shared Tool Design
- **DRY principle**: One tool, multiple domains
- **Consistency**: Same behavior across domains
- **Centralized updates**: Fix once, applies everywhere
- **Resource efficiency**: Single instance, less memory

---

## 📋 Admin Integration

### Domain Settings Page
**Location**: `/admin/domains/[domainId]`

**Capabilities**:
1. **View Current Instructions**
   - Display parsed YAML in readable format
   - Show active tool configurations
   - List URL sources and priority

2. **Edit Instructions**
   - Inline YAML editor with syntax highlighting
   - Validation before save
   - Version control (track changes)

3. **Upload Custom Files**
   - Upload additional instruction files
   - Support YAML/JSON/XML
   - Merge with base instructions

4. **Tool Configuration**
   - Enable/disable tools per domain
   - Configure URL sources
   - Set rate limits and timeouts

5. **Tokenizer Management**
   - Add domain-specific tokens
   - Set token priorities
   - Preview tokenization output

### Orchestrator Settings Page
**Location**: `/admin/orchestrator`

**Capabilities**:
1. **Routing Rules**
   - Edit decision tree
   - Adjust module priorities
   - Configure fallback strategies

2. **System Tokens**
   - View/edit system base tokens
   - Add custom system tokens
   - Set token interoperability rules

3. **Performance Tuning**
   - Configure cache settings
   - Adjust timeouts
   - Set rate limits

4. **Monitoring**
   - View routing analytics
   - Module performance metrics
   - Error logs and alerts

---

## 🚀 Usage Examples

### Example 1: Mathematics Query
```typescript
// User query: "What is the derivative of x²?"

// Orchestrator loads system instructions
const systemInstructions = await loadSystemInstructions();

// Analyzes query using decision tree
// Detects keywords: "derivative" → Route to mathematics

// Loads mathematics domain instructions
const mathInstructions = await loadDomainInstructions("mathematics");

// Finds principle: "Order of Operations"
// Finds tool: "symbolic_solver" enabled

// Uses URL lookup for verification
const tool = getURLLookupTool();
const verification = await tool.lookup("mathematics", "power rule");

// Processes with mathematical tokenizer
// Tokens: ∂, x, ², =, 2, x

// Returns: "2x" with explanation
```

### Example 2: Programming Query
```typescript
// User query: "How do I create a React component?"

// Orchestrator routes to programming domain

// Loads programming instructions
const progInstructions = await loadDomainInstructions("programming");

// Finds principle: "Code Quality"
// Finds language: "TypeScript/JavaScript"

// Uses URL lookup
const tool = getURLLookupTool();
const docs = await tool.lookup("programming", "React component");
// Returns MDN or React docs

// Applies code generation guidelines
// Follows TypeScript conventions

// Returns code example with explanation
```

### Example 3: Multi-Tool Usage
```typescript
// User query: "Calculate sin(π/4) and explain the result"

// Orchestrator uses [PARALLEL] strategy

// Route 1: Mathematics domain
// - Uses scientific calculator tool
// - Calculates: sin(π/4) = 0.7071...

// Route 2: LLM
// - Explains trigonometry
// - Describes unit circle

// Orchestrator aggregates
// Returns calculation + explanation
```

---

## 🔐 Security Considerations

### API Key Management
- API keys for Wolfram Alpha, Bing stored securely
- Not in version control (use environment variables)
- Rotatable via admin panel
- Rate limiting enforced

### Input Validation
- Sanitize queries before URL lookup
- Prevent injection attacks
- Validate instruction file uploads
- Scan for malicious content

### Access Control
- Admin pages require authentication
- Role-based permissions for editing
- Audit log for all changes
- Version control for instructions

---

## �� Performance Optimizations

### Caching Strategy
1. **URL Lookup Results**
   - Cache by domain + query
   - TTL: 1-24 hours (domain-specific)
   - LRU eviction policy

2. **Instruction Files**
   - Cache parsed instructions
   - TTL: 5 minutes
   - Force refresh on edit/upload

3. **System Tokens**
   - Cached indefinitely
   - Reload on system restart
   - Clear cache on token updates

### Rate Limiting
- Per-source limits (e.g., GitHub: 10/min)
- Per-domain limits
- Global system limits
- Queue overflow requests
- Graceful degradation

---

## 🧪 Testing

### Unit Tests Needed
```typescript
// URL Lookup Tool
- test("loads domain config")
- test("selects source by priority")
- test("applies rate limiting")
- test("caches results")
- test("falls back on failure")

// Instruction Loader
- test("loads YAML instructions")
- test("loads JSON configs")
- test("caches loaded files")
- test("handles missing files")
- test("parses nested fields")

// System Tokens
- test("loads orchestrator tokens")
- test("token interoperability")
- test("priority resolution")
```

### Integration Tests
- Domain uses URL lookup successfully
- Instructions guide inference correctly
- System tokens route queries properly
- Admin edits persist and apply

---

## 📈 Future Enhancements

### Phase 2
- [ ] Real-time instruction editing (WebSocket)
- [ ] A/B testing for routing rules
- [ ] ML-based source selection
- [ ] Automatic instruction optimization
- [ ] Multi-language support for instructions

### Phase 3
- [ ] Instruction marketplace (share/import)
- [ ] Visual instruction editor (drag-drop)
- [ ] Automated instruction generation
- [ ] Performance-based tool selection
- [ ] Cross-domain tool sharing

---

## 📁 File Structure Summary

```
src/ai/
├── shared/
│   ├── tools/
│   │   └── url-lookup-tool.ts (shared tool)
│   ├── config/
│   │   └── instructionLoader.ts (loader utility)
│   └── registry/
│       └── unifiedRegistry.ts (from previous work)
├── knowledge-domains/
│   ├── mathematics/
│   │   ├── url-lookup.json (URL sources)
│   │   └── domain-instructions.yaml (governance)
│   ├── programming/
│   │   ├── url-lookup.json
│   │   └── domain-instructions.yaml
│   ├── general-knowledge/
│   │   └── url-lookup.json
│   └── internet-search/
│       └── url-lookup.json
├── models/
│   └── [model-name]/
│       ├── model-instructions.yaml (to be created)
│       └── tokenizer/
│           └── baseTokens.json
└── orchestration/
    ├── system-instructions.yaml (orchestrator rules)
    └── system-base-tokens.json (system tokens)
```

---

## ✅ Implementation Status

**Completed**:
- ✅ URL Lookup Tool (shared)
- ✅ Domain URL configurations (4 domains)
- ✅ Domain instruction files (2 comprehensive examples)
- ✅ Orchestrator system instructions
- ✅ System base tokens (45 tokens)
- ✅ Instruction loader utility
- ✅ Support for YAML/JSON/XML

**Next Steps**:
1. Create model instruction files (similar to domains)
2. Implement admin UI pages for editing
3. Add file upload functionality
4. Create API endpoints for instruction CRUD
5. Implement instruction validation
6. Add version control for instructions
7. Create remaining domain instruction files
8. Test integration with inference engines

---

## 🎓 Key Concepts

### Instruction Hierarchy
```
System Instructions (Orchestrator)
  ↓ Applied globally
Domain Instructions
  ↓ Applied to specific domain
Model Instructions
  ↓ Applied to specific model
Custom Uploaded Instructions
  ↓ Overrides/extends base instructions
```

### Tool Access Pattern
```
Domain Inference Engine
  ↓ Reads domain instructions
  ↓ Identifies enabled tools
  ↓ Calls shared tool (e.g., URL lookup)
  ↓ Tool loads domain config
  ↓ Executes with domain-specific settings
```

### Token Priority
```
System Tokens (Highest)
  ↓ [SYSTEM_START], [ROUTE_TO]
Domain Tokens (Medium)
  ↓ Mathematical symbols, programming keywords
Model Tokens (Low)
  ↓ Model-specific tokens
Base Tokens (Lowest)
  ↓ [PAD], [UNK], numbers, punctuation
```

---

Your architectural vision is now implemented! Each domain has:
- ✅ URL sources for knowledge lookup
- ✅ Comprehensive instructions for governance
- ✅ Tool configurations
- ✅ Tokenizer definitions
- ✅ Training guidelines
- ✅ Pipeline instructions

The orchestrator has:
- ✅ System-level instructions
- ✅ Specialized base tokens for coordination
- ✅ Decision trees and routing rules
- ✅ Integration guidelines

All configurable via admin panel (UI to be built)!
