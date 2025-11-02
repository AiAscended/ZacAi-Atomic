# Quick Reference Guide - ZacAi-Atomic

## Model Prefixes Quick Lookup

| Model Name | Prefix | Files | Purpose |
|------------|--------|-------|---------|
| unified-transformer-llm | `llm-` | 36 | Language understanding & generation |
| convolutional-neural-network | `cnn-` | 15 | Image processing & classification |
| recurrent-neural-network | `rnn-` | 15 | Sequential data & time-series |
| vision-transformer | `vit-` | 15 | Vision tasks with transformers |
| generative-adversarial-network | `gan-` | 15 | Image generation & synthesis |
| diffusion-model | `diffusion-` | 15 | Denoising diffusion generation |
| speech-to-text | `stt-` | 15 | Audio transcription |
| text-to-speech | `tts-` | 15 | Speech synthesis |
| wavenet-audio-model | `wavenet-` | 15 | High-fidelity audio generation |
| neuro-symbolic-reasoning | `neuro-` | 15 | Hybrid neural-symbolic reasoning |
| graph-neural-network | `gnn-` | 15 | Graph-structured data processing |
| multi-modal-fusion | `multimodal-` | 15 | Multi-modal integration |
| code-transformer | `code-` | 15 | Code understanding & generation |

## Directory Structure Quick Reference

```
src/ai/
├── models/                           # 13 AI Models (~210 files)
│   ├── unified-transformer-llm/
│   │   ├── llm-config/
│   │   ├── llm-data/
│   │   ├── llm-model/
│   │   ├── llm-training/
│   │   ├── llm-inference/
│   │   ├── llm-weights/
│   │   ├── llm-tests/
│   │   ├── llm-shared/
│   │   ├── README.md
│   │   └── package.json
│   └── [12 more models with same structure]
│
└── knowledge-domains/                # 19 Domains (~420 files)
    ├── algorithms/
    │   ├── seeds/
    │   ├── weights/
    │   ├── tools/
    │   └── [21-22 core files]
    └── [18 more domains with same structure]
```

## File Location Patterns

### Finding Model Files
```bash
# Config file
src/ai/models/{model-name}/{prefix}-config/{prefix}-modelConfig.ts

# Core model
src/ai/models/{model-name}/{prefix}-model/{prefix}-core.ts

# Inference engine
src/ai/models/{model-name}/{prefix}-inference/{prefix}-inferenceEngine.ts

# Trainer
src/ai/models/{model-name}/{prefix}-training/{prefix}-trainer.ts
```

### Finding Domain Files
```bash
# Tokenizer
src/ai/knowledge-domains/{domain-name}/{domain}_tokenizer.ts

# Inference controller
src/ai/knowledge-domains/{domain-name}/{domain}_inferenceController.ts

# Tools
src/ai/knowledge-domains/{domain-name}/tools/{domain}-ToolName.ts

# Seeds
src/ai/knowledge-domains/{domain-name}/seeds/{domain}_seeds.json
```

## Import Patterns

### Importing Models
```typescript
// Import a model's inference engine
import { LLMInferenceEngine } from '@/ai/models/unified-transformer-llm/llm-inference/llm-inferenceEngine';
import { CNNInferenceEngine } from '@/ai/models/convolutional-neural-network/cnn-inference/cnn-inferenceEngine';

// Import model config
import { defaultLLMConfig } from '@/ai/models/unified-transformer-llm/llm-config/llm-modelConfig';
```

### Importing Domains
```typescript
// Import domain tokenizer
import { EnglishTokenizer } from '@/ai/knowledge-domains/english/english_tokenizer';

// Import domain tool
import { SpellChecker } from '@/ai/knowledge-domains/english/tools/english-SpellChecker';
```

## Common Commands

### Verification
```bash
# Verify all models
cd /workspaces/ZacAi-Atomic/src/ai/models
./audit_models.sh

# List all models
ls -d */ | grep -v unified-transformer-llm

# Count files in a model
find convolutional-neural-network -type f | wc -l
```

### Development
```bash
# Run Next.js development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type check
npm run type-check
```

## Model Usage Examples

### LLM Example
```typescript
import { LLMInferenceEngine } from '@/ai/models/unified-transformer-llm/llm-inference/llm-inferenceEngine';

const llm = new LLMInferenceEngine();
const response = llm.predict("Your prompt here");
```

### CNN Example
```typescript
import { CNNInferenceEngine } from '@/ai/models/convolutional-neural-network/cnn-inference/cnn-inferenceEngine';

const cnn = new CNNInferenceEngine();
const classification = cnn.predict(imageData);
```

### Multi-Modal Example
```typescript
import { MultimodalInferenceEngine } from '@/ai/models/multi-modal-fusion/multimodal-inference/multimodal-inferenceEngine';

const multimodal = new MultimodalInferenceEngine();
const result = multimodal.predict({
  text: "Describe this image",
  image: imageData,
  audio: audioData
});
```

## Knowledge Domain Usage

### English Domain
```typescript
import { EnglishTokenizer } from '@/ai/knowledge-domains/english/english_tokenizer';
import { SpellChecker } from '@/ai/knowledge-domains/english/tools/english-SpellChecker';

const tokenizer = new EnglishTokenizer();
const tokens = tokenizer.tokenize("Hello world");

const spellChecker = new SpellChecker();
const corrected = spellChecker.check("Helo wrld");
```

### Mathematics Domain
```typescript
import { MathematicsInferenceController } from '@/ai/knowledge-domains/mathematics/mathematics_inferenceController';
import { Calculator } from '@/ai/knowledge-domains/mathematics/tools/mathematics-Calculator';

const mathController = new MathematicsInferenceController();
const result = mathController.solve("2 + 2");

const calculator = new Calculator();
const answer = calculator.calculate("sqrt(16)");
```

## Configuration Files

### package.json
Location: `/workspaces/ZacAi-Atomic/package.json`
Purpose: Next.js dependencies and scripts

### tsconfig.json
Location: `/workspaces/ZacAi-Atomic/tsconfig.json`
Purpose: TypeScript configuration with path aliases

### next.config.mjs
Location: `/workspaces/ZacAi-Atomic/next.config.mjs`
Purpose: Next.js production configuration

## Documentation Files

- **MODELS_OVERVIEW.md** - Complete AI models documentation
- **IMPLEMENTATION_COMPLETE.md** - Full system status
- **Individual Model READMEs** - Per-model documentation
- **This file** - Quick reference guide

## Troubleshooting

### Import errors
- Ensure path aliases are configured in `tsconfig.json`
- Use `@/` prefix for all imports from `src/`
- Check that file names match the import statements

### Model not found
- Verify model exists: `ls src/ai/models/`
- Check prefix is correct (see table above)
- Ensure all 8 subfolders exist

### Build errors
- Run `npm install` to ensure dependencies
- Check `npm run type-check` for TypeScript errors
- Verify all imports use absolute paths with `@/`

## Key Contacts

- Project: ZacAi-Atomic
- Architecture: Atomic Modular Multi-Modal Hybrid AI System
- Framework: Next.js 14+ with TypeScript
- Status: Foundation Complete ✅

---

**Quick Start:** Run `./audit_models.sh` to verify system integrity
**Documentation:** See `MODELS_OVERVIEW.md` and `IMPLEMENTATION_COMPLETE.md`
**Models:** 13 complete | **Domains:** 19 complete | **Files:** ~630+
