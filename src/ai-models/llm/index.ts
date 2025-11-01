/**
 * LLM (Unified Transformer) Module
 * 
 * Main entry point for the Large Language Model.
 * Exports all core components for text generation and understanding.
 */

export type { LLMConfig } from './config';
export { defaultLLMConfig } from './config';
export type { Token, TokenizerResult } from './tokenizer';
export { Tokenizer } from './tokenizer';
export type { Embedding } from './embedding';
export type { GenerationOptions, GenerationResult } from './inference';
export { Inference } from './inference';

// TODO: Export additional components when implemented
// export { TransformerBlocks } from './transformerBlocks';
// export { Encoder } from './encoder';
// export { Decoder } from './decoder';
// export { OutputHead } from './outputHead';
// export { LossFunction } from './lossFunction';
// export { Trainer } from './trainer';
