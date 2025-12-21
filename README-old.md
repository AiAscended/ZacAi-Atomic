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