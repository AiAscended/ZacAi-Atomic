# ZacAi Model Text-to-Speech (TTS)

## Overview
This package provides ZacAi's text-to-speech (TTS) synthesis, implemented in Rust/WASM for low-latency, high-quality audio output. It supports a wide range of voices, languages, and integrates with chat and agent pipelines.

## Key Features
- Text encoding and spectrogram generation
- Neural vocoder for high-fidelity audio
- Real-time and batch synthesis modes
- Multilingual and multi-voice support

## Architecture
- **Rust/WASM Core:** Efficient TTS pipeline
- **TypeScript Bindings:** For orchestrator and UI integration
- **Voice Modules:** Extendable for new voices and languages

## Integration Points
- **Chat/Agent Pipelines:** Real-time speech synthesis for assistants
- **Multimodal Fusion:** Combined with vision/text for hybrid tasks
- **Orchestrator:** Automated audio output and processing

## File Structure Reference
- `src/tts.rs` – Core Rust TTS logic
- `src/bindings.ts` – WASM/TypeScript integration
- `src/voices/` – Voice and language modules

## Best Practices
- Use batch mode for large-scale synthesis
- Register new voices/languages for expanded support
- Optimize for low-latency, high-quality output

## Further Reading
- [TTS Design](../../docs/model-text-to-speech/Design.md)
- [Audio Integration](../../docs/model-wavenet-audio/README.md)
