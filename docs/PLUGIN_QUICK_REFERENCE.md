# Plugin System Quick Reference

## 🚀 Quick Start

### Scan Models & Domains
```bash
npm run scan:models    # Scan AI models
npm run scan:domains   # Scan knowledge domains
npm run scan:all       # Scan everything
```

### Load at Runtime
```typescript
import { getModelLoader } from "@/ai/models/modelLoader";

const loader = getModelLoader();
await loader.loadAllModels();
await loader.loadAllDomains();
```

---

## 📁 Module Structure

### Model Template
```
src/ai/models/[model-name]/
├── seeds/                  # REQUIRED
│   ├── data.json
│   └── vocab.json
├── weights/                # REQUIRED
│   ├── pretrained/
│   └── finetuned/
├── tokenizer/              # REQUIRED
│   ├── config.json
│   └── baseTokens.json     # Copy from shared/baseTokens.template.json
├── inference/              # Recommended
│   └── engine.ts
├── training/               # Recommended
│   └── pipeline.ts
└── scripts/                # Optional
    └── train.js
```

### Domain Template
```
src/ai/knowledge-domains/[domain-name]/
├── seed_data.json          # REQUIRED
├── seed_vocab.json         # REQUIRED
├── inferenceController.ts  # REQUIRED
├── integrationAPI.ts       # REQUIRED (must export initialize, query)
├── learned_data.json       # Optional (AI-learned)
├── weights/                # Optional
├── trainingController.ts   # Optional
├── tokenizer.ts            # Optional
└── scripts/                # Optional
```

---

## 🔧 Common Tasks

### Add New Model
1. Create `src/ai/models/your-model/`
2. Add seeds/, weights/, tokenizer/ folders
3. Copy baseTokens.json from template
4. Run `npm run scan:models`
5. Restart app

### Add New Domain
1. Create `src/ai/knowledge-domains/your-domain/`
2. Add seed_data.json, seed_vocab.json
3. Create inferenceController.ts
4. Create integrationAPI.ts with initialize() and query()
5. Run `npm run scan:domains`
6. Restart app

### Enable/Disable Module
Edit registry JSON directly:
- `src/ai/models/MODEL_REGISTRY.json`
- `src/ai/knowledge-domains/DOMAIN_REGISTRY.json`

Set `enabled: true` or `enabled: false`, then restart.

### Hot-Reload Module
```typescript
await loader.reloadModel("model-id");
await loader.reloadDomain("domain-id");
```

---

## 🔍 Validation

### Validate Model
```typescript
import { ModelValidator } from "@/ai/shared/validation/moduleValidator";

const result = await ModelValidator.validateModel(id, path, manifest);
console.log(`Score: ${result.score}/100`);
console.log(`Valid: ${result.isValid}`);
```

### Health Check
```typescript
const health = await ModelValidator.healthCheck(id, path, manifest);
console.log(`Status: ${health.status}`); // healthy | degraded | unhealthy
```

---

## 📊 Registry API

### Models
```typescript
import { 
  getModelRegistry, 
  getEnabledModels, 
  getModel, 
  isModelEnabled 
} from "@/ai/models/modelRegistry";

const registry = await getModelRegistry();
const enabled = await getEnabledModels();
const model = await getModel("llm");
const isEnabled = await isModelEnabled("llm");
```

### Domains
```typescript
import { 
  getDomainRegistry, 
  getEnabledDomains, 
  getDomainManifest, 
  isDomainEnabled 
} from "@/ai/knowledge-domains/domainScanner";

const registry = await getDomainRegistry();
const enabled = await getEnabledDomains();
const domain = await getDomainManifest("mathematics");
const isEnabled = await isDomainEnabled("mathematics");
```

---

## 🎯 Base Tokens (20-40 Standard)

**Location**: `src/ai/models/shared/baseTokens.template.json`

**Categories** (41 tokens):
- Special: [PAD], [UNK], [BOS], [EOS], [MASK], [CLS], [SEP]
- Numerical: 0-9
- Punctuation: . , ! ? : ; ' " ( )
- Whitespace: space, newline, tab
- Operators: + - * / = < >
- Brackets: [ ] { }

**Copy to model**: `tokenizer/baseTokens.json`

---

## ⚠️ Troubleshooting

### Model Not Loading
```bash
# 1. Check registry
cat src/ai/models/MODEL_REGISTRY.json | grep "your-model"

# 2. Re-scan
npm run scan:models

# 3. Check validation
# See validation API above

# 4. Check logs
# Look for errors in console
```

### Domain Not Loading
```bash
# 1. Check registry
cat src/ai/knowledge-domains/DOMAIN_REGISTRY.json | grep "your-domain"

# 2. Re-scan
npm run scan:domains

# 3. Verify integrationAPI exports
grep "export" src/ai/knowledge-domains/your-domain/integrationAPI.ts
```

### Registry Out of Date
```bash
# Force refresh
npm run scan:all

# Or in code:
await getModelRegistry(true);  // forceRefresh=true
await getDomainRegistry(true);
```

---

## 📂 Folder Structure

- **src/lib/utils.ts** → UI utilities (cn() for Tailwind) ✅ Legitimate
- **src/utils/** → App-level utilities (dom, router, storage) ✅ Correct
- **src/ai/ai_utils/** → AI-specific utilities ✅ Renamed for clarity

---

## 🔗 Links

- [Full Documentation](./PLUGIN_ARCHITECTURE.md)
- [Model Registry](../src/ai/models/modelRegistry.ts)
- [Domain Scanner](../src/ai/knowledge-domains/domainScanner.ts)
- [Model Loader](../src/ai/models/modelLoader.ts)
- [Module Validator](../src/ai/shared/validation/moduleValidator.ts)
- [Base Tokens Template](../src/ai/models/shared/baseTokens.template.json)
