# System Kernel

**Stateful control plane for the ZacAi system.**

Production-grade kernel providing:
- ✅ Deterministic lifecycle management (BOOT → RUN → SAFE → SHUTDOWN)
- ✅ Task scheduler with priority and retry logic
- ✅ Heartbeat (clock) for tick-based execution
- ✅ Recovery system for error handling
- ✅ Enterprise logging and monitoring
- ✅ Type-safe state machine

## Quick Start

```typescript
import { SystemKernel } from '@zacai/system-kernel';

// Create and boot kernel
const kernel = new SystemKernel({
  tickIntervalMs: 1000,
  enableLogging: true,
});

kernel.boot();

// Enqueue tasks to run each tick
kernel.enqueueTask(async () => {
  console.log('Running on tick:', kernel.getState().tick);
});

// Listen to events
kernel.on('CYCLE', ({ tick, duration }) => {
  console.log(`Cycle ${tick} completed in ${duration}ms`);
});

// Shutdown gracefully
await kernel.shutdown();
```

## Architecture

### Components

**KernelState**
- Immutable state snapshots
- Strict mode transitions
- Health tracking

**SystemClock**
- Heartbeat generator
- Tick-based execution
- Event emission

**KernelScheduler**
- Priority-based task queuing
- Retry logic
- Deterministic execution

**KernelRecovery**
- Error classification
- Recovery strategies
- Fail-safe handling

**SystemKernel**
- Orchestrates all components
- Event system
- Lifecycle management

## See Also

- [@zacai/system-kernel-methods](../system-kernel-methods/) - Pure deterministic functions
- [KERNEL_ARCHITECTURE_ASSESSMENT.md](../../KERNEL_ARCHITECTURE_ASSESSMENT.md) - Architecture details
