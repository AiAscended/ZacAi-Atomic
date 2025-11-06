# ZacAi-Hybrid-LLM v0.0.2

**Advanced Hybrid AI System with Knowledge Domains, Memory Management, and Learning Capabilities**

---

## 🚀 Overview

ZacAi-Hybrid-LLM v0.0.2 is a comprehensive AI orchestration system built with Next.js 15.5.6 and TypeScript. It combines traditional neural network approaches with knowledge-based reasoning, featuring a unique hybrid architecture that mimics human cognition.

### Key Features

- ✅ **23 Knowledge Domains** - Specialized expertise across algorithms, programming, mathematics, security, and more
- ✅ **13 AI Models** - Complete neural network implementations including transformers, CNNs, GANs, and more
- ✅ **220+ Seed Vocabulary Files** - Rich metadata knowledge base with binary indexing for O(1) lookups
- ✅ **Hybrid Knowledge System** - Combines trained weights (unconscious) with seed lookups (conscious reference)
- ✅ **Learning & Memory Management** - Real-time vocabulary acquisition with session-based memory
- ✅ **Date-Stamped Training** - Automated weight versioning with training run timestamps
- ✅ **GitHub Backup Integration** - Automated backup to multiple repository types
- ✅ **Complete Separation of Concerns** - Every component fully isolated with proper prefixing

---

## 📊 System Architecture

### Hybrid Knowledge Approach

The system mimics human cognition with two complementary knowledge systems:

1. **Trained Weights** (Unconscious/Fast)
   - Automatic pattern recognition
   - Neural network parameters
   - Fast inference

2. **Seed Lookups** (Conscious/Deliberate)
   - Explainable references
   - Rich metadata (60+ fields per entry)
   - Verifiable knowledge sources

### Component Structure

```
ZacAi-Hybrid-LLM/
├── src/ai/
│   ├── knowledge-domains/     # 23 specialized domains
│   │   ├── {domain}/
│   │   │   ├── {domain}_seeds/
│   │   │   ├── {domain}_weights/
│   │   │   ├── {domain}_tools/
│   │   │   ├── {domain}_instructions.yml
│   │   │   └── url-lookup.json
│   │   
│   ├── models/                # 13 AI models
│   │   ├── {model}/
│   │   │   ├── {model}_seeds/
│   │   │   ├── {model}_weights/
│   │   │   ├── {model}_pretrained_weights/
│   │   │   ├── {model}_config/
│   │   │   ├── {model}_data/
│   │   │   ├── {model}_inference/
│   │   │   ├── {model}_model/
│   │   │   ├── {model}_training/
│   │   │   ├── {model}_instructions.yml
│   │   │   └── {model}_config.json
│   │
│   ├── shared/                # Shared utilities
│   │   ├── seeds/             # Binary indexing system
│   │   ├── memory/            # Learning & memory
│   │   ├── weights/           # Weight management
│   │   └── vocabulary/        # Shared vocabularies
│   │
│   └── orchestration/         # Main orchestrator
│       └── mainOrchestrator.ts
```

---

## 🌍 Knowledge Domains (23)

Each domain has specialized knowledge, vocabulary, and reasoning capabilities:

| Domain | Purpose | Seed Files |
|--------|---------|------------|
| **algorithms** | Algorithm design and analysis | 5 |
| **code_review** | Code quality and best practices | 5 |
| **data_integrity** | Data validation and verification | 4 |
| **data_structures** | Data organization patterns | 5 |
| **documentation** | Technical writing | 5 |
| **english** | Language processing | 5 |
| **environment** | Environment configuration | 5 |
| **error_detection** | Bug identification | 5 |
| **general_knowledge** | Broad knowledge base | 6 |
| **grammar** | Grammar rules and syntax | 12 |
| **internet_search** | Web search capabilities | 5 |
| **mathematics** | Mathematical reasoning | 25 |
| **nextjs** | Next.js framework | 42 |
| **observability** | System monitoring | 5 |
| **programming** | Programming concepts | 16 |
| **react** | React library | 1 |
| **repair** | System repair | 5 |
| **science** | Scientific knowledge | 5 |
| **security** | Security best practices | 10 |
| **system** | System operations | 14 |
| **testing** | Test strategies | 5 |
| **typescript** | TypeScript language | 5 |
| **version_control** | Git and versioning | 5 |

---

## 🤖 AI Models (13)

Complete neural network implementations with training pipelines:

1. **code-transformer** - Code generation and transformation
2. **convolutional-neural-network** - Image processing
3. **diffusion-model** - Generative modeling
4. **generative-adversarial-network** - Adversarial learning
5. **graph-neural-network** - Graph-based reasoning
6. **multi-modal-fusion** - Cross-modal understanding
7. **neuro-symbolic-reasoning** - Symbolic + neural hybrid
8. **recurrent-neural-network** - Sequential data processing
9. **speech-to-text** - Audio transcription
10. **text-to-speech** - Speech synthesis
11. **unified-transformer-llm** - Main language model
12. **vision-transformer** - Vision understanding
13. **wavenet-audio-model** - Audio generation

---

## 📚 Key Systems

### 1. Binary Indexing System

Fast O(1) seed lookups with 4-byte indices:
- Format: `[domain_id(1), file_id(1), entry_id(2)]`
- Capacity: 4.2 billion entries (255 domains × 255 files × 65,535 entries)
- Hash-based lookups for instant access

### 2. Learning & Memory Management

Real-time knowledge acquisition:
- **Session Management** - Unique session IDs with chat history
- **Vocabulary Learning** - Automatic capture of unknown words
- **Date-Stamped Storage** - All learned data timestamped (DD-MM-YY format)
- **Domain-Specific Learning** - Knowledge organized by domain/model

### 3. Weight Management

Comprehensive weight versioning:
- **Pretrained Weights** - Basic task-specific functionality
- **Trained Weights** - Date-stamped training runs (e.g., `_trained_weights_02-11-25.json`)
- **Weight History** - Complete training lineage
- **Automatic Loading** - Smart weight discovery and loading

### 4. GitHub Backup Integration

Automated backup to multiple repositories:
- **backup** - Daily automated backups
- **data_library** - Learned vocabulary and training data
- **stable** - Stable releases
- **enhanced** - Enhanced versions with new features
- **experimental** - Experimental branches

---

## 🔧 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/AiAscended/ZacAi-Hybrid-LLM-v0.0.2.git
cd ZacAi-Hybrid-LLM-v0.0.2

# Install dependencies
npm install

# Run development server
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```env
# GitHub Integration (optional)
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_BACKUP_ENABLED=true

# AI Configuration
AI_INFERENCE_ENDPOINT=http://localhost:3000/api/inference
SEED_REGISTRY_PRELOAD=true
```

---

## 📖 Usage

### Basic Inference

```typescript
import { mainOrchestrator } from '@/ai/orchestration/mainOrchestrator';

const result = await mainOrchestrator.processPrompt(
  "Explain how binary search works",
  { sessionId: "user-session-123" }
);

console.log(result.response);
```

### Seed Lookup

```typescript
import { lookupSeed, searchSeeds } from '@/ai/shared/seeds/seedLookup';

// Direct lookup
const concept = lookupSeed('async', 'programming');

// Search across domains
const results = searchSeeds('neural network', { limit: 10 });
```

### Learning New Concepts

```typescript
import { learningMemoryManager } from '@/ai/shared/learningMemoryManager';

// Learn from URL lookup
await learningMemoryManager.learnFromUrlLookup({
  term: 'quantum computing',
  definition: 'Computing using quantum mechanical phenomena',
  source: 'https://example.com/quantum',
  domain: 'science'
});

// Get session history
const history = learningMemoryManager.getSessionHistory(sessionId);
```

---

## 🎯 Architecture Highlights

### Complete Separation of Concerns

Every component is fully isolated:
- All folders prefixed with parent name
- All files prefixed with component name
- No cross-domain dependencies (except through orchestrator)
- Clear module boundaries

### Naming Convention

- **Domains:** `{domain}_seeds/`, `{domain}_weights/`, `{domain}_tools/`
- **Models:** `{model}_config/`, `{model}_data/`, `{model}_inference/`
- **Files:** `{component}_{description}_{date}.json`

### Weight Versioning

Training runs automatically create date-stamped weight files:
```
mathematics_trained_weights_02-11-25.json
mathematics_trained_weights_15-12-25.json
mathematics_trained_weights_03-01-26.json
```

---

## 📊 Statistics

| Metric | Count |
|--------|-------|
| Knowledge Domains | 23 |
| AI Models | 13 |
| Seed Vocabulary Files | 220+ |
| Total Files Created | 277+ |
| Cleanup Operations | 262 |
| Legacy Folders Removed | 51 |
| Folders Renamed | 110 |

---

## 🚀 What's New in v0.0.2

### Major Features
- ✅ Complete structural reorganization with proper prefixing
- ✅ Learning and memory management system
- ✅ Date-stamped weight versioning
- ✅ GitHub backup integration
- ✅ Binary indexing for seed lookups
- ✅ Session-based memory with chat history
- ✅ Real-time vocabulary acquisition
- ✅ Automated cleanup and organization scripts

### System Improvements
- 🔧 Zero legacy folders remaining
- 🔧 100% consistent naming conventions
- 🔧 Complete separation of concerns
- 🔧 Proper TypeScript types throughout
- 🔧 Comprehensive error handling
- 🔧 Detailed logging and monitoring

---

## 📝 Documentation

- **[System Complete](./docs/SYSTEM_COMPLETE.md)** - Full completion report
- **[Cleanup Complete](./docs/CLEANUP_COMPLETE.md)** - Cleanup and organization
- **[Seed System Architecture](./docs/SEED_SYSTEM_ARCHITECTURE.md)** - Binary indexing design
- **[Quick Start](./docs/QUICKSTART.md)** - Getting started guide

---

## 🔮 Roadmap

### v0.0.3 (Planned)
- [ ] Real-time training pipeline
- [ ] Advanced weight pruning
- [ ] Multi-GPU support
- [ ] Enhanced session management
- [ ] Web UI for system monitoring

### v0.1.0 (Future)
- [ ] Plugin system for custom domains
- [ ] Cloud deployment support
- [ ] API rate limiting
- [ ] Advanced caching strategies
- [ ] Performance optimization

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- OpenAI for inspiration on hybrid AI systems
- The broader AI/ML community for research and tools

---

## 📞 Contact

- **Author:** AiAscended
- **Repository:** [ZacAi-Hybrid-LLM-v0.0.2](https://github.com/AiAscended/ZacAi-Hybrid-LLM-v0.0.2)
- **Issues:** [GitHub Issues](https://github.com/AiAscended/ZacAi-Hybrid-LLM-v0.0.2/issues)

---

## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

**Built with ❤️ by AiAscended | Version 0.0.2 | Last Updated: November 2, 2025**
