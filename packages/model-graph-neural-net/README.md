# ZacAi Model Graph Neural Network (GNN)

## Overview
This package implements ZacAi's graph neural network (GNN) for reasoning over graph-structured data. Built in Rust/WASM, it enables advanced node/edge feature learning and graph-based inference for enterprise AI workflows.

## Key Features
- Node and edge feature learning
- Graph-based inference and reasoning
- Integration with orchestrator, memory, and agent pipelines
- Support for heterogeneous and dynamic graphs

## Architecture
- **Rust/WASM Core:** High-performance GNN implementation
- **TypeScript Bindings:** For orchestrator and UI integration
- **Flexible Layers:** Customizable for research and production

## Integration Points
- **Orchestrator:** Graph-based workflow and data analysis
- **Memory:** Graph-structured memory and recall
- **Agent Workflows:** Automated graph reasoning and analytics

## File Structure Reference
- `src/gnn.rs` – Core Rust GNN logic
- `src/bindings.ts` – WASM/TypeScript integration
- `src/layers/` – Custom and standard GNN layers

## Best Practices
- Use dynamic graphs for evolving data
- Register new layers for custom graph tasks
- Optimize for large-scale graph inference

## Further Reading
- [GNN Design](../../docs/model-graph-neural-net/Design.md)
- [Graph Memory Integration](../../docs/LLeMuR/LLeMuR.md)
