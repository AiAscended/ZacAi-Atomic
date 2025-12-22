# ZacAi Model Speech-to-Text (STT)

## Overview
This package provides ZacAi's speech-to-text (STT) capabilities, using a Rust/WASM pipeline for real-time, high-accuracy audio transcription. It supports a wide range of audio formats and integrates with agent and chat pipelines.

## Key Features
- Audio preprocessing and feature extraction
- Transformer/CNN encoder-decoder architecture
- CTC decoding and output
- Real-time and batch transcription modes
- Multilingual support

## Architecture
- **Rust/WASM Core:** Efficient STT pipeline
- **TypeScript Bindings:** For orchestrator and UI integration
- **Audio Modules:** Extendable for new languages and domains

## Integration Points
- **Chat/Agent Pipelines:** Real-time transcription for assistants
- **Multimodal Fusion:** Combined with vision/text for hybrid tasks
- **Orchestrator:** Automated audio analysis and processing

## File Structure Reference
- `src/stt.rs` – Core Rust STT logic
- `src/bindings.ts` – WASM/TypeScript integration
- `src/audio/` – Preprocessing and feature extraction modules

## Best Practices
- Use batch mode for large-scale transcription
- Register new language/audio modules for expanded support
- Optimize for low-latency, high-accuracy inference

## Further Reading
- [STT Design](../../docs/model-speech-to-text/Design.md)
- [Audio Integration](../../docs/model-wavenet-audio/README.md)
