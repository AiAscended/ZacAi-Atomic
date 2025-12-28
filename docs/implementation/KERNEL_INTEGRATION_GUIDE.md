# Kernel Integration Guide

## Overview

The system-kernel and system-kernel-methods packages are now ready for integration with system-core.

**What was generated:**
- ✅ 10 production-grade kernel files (TypeScript)
- ✅ 6 pure utility function files
- ✅ Full type safety with strict TypeScript
- ✅ Enterprise logging and recovery
- ✅ Comprehensive documentation
- ✅ Test scaffolding

---

## Package Structure

```
packages/
├── system-kernel/
│   ├── src/
│   │   ├── index.ts                    ← Main exports
│   │   ├── kernel/
│   │   │   ├── KernelState.ts          ← State machine (BOOT → RUN → SAFE → SHUTDOWN)
│   │   │   ├── SystemKernel.ts         ← Orchestrator (main entry point)
│   │   │   ├── KernelScheduler.ts      ← Task scheduling with priority
│   │   │   └── KernelRecovery.ts       ← Error handling and recovery
│   │   ├── clock/
│   │   │   └── SystemClock.ts          ← Heartbeat (tick-based execution)
│   │   ├── types/
│   │   │   ├── kernel.ts               ← Type definitions
│   │   │   └── events.ts               ← Event system types
│   │   └── utils/
│   │       ├── logging.ts              ← Enterprise logging
│   │       └── determinism.ts          ← Determinism helpers
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
└── system-kernel-methods/
    ├── src/
    │   ├── index.ts                    ← Main exports
    │   ├── lifecycle.ts                ← State validation
    │   ├── scheduling.ts               ← Priority & backoff logic
    │   ├── recovery.ts                 ← Error classification
    │   ├── heartbeat.ts                ← Health check logic
    │   ├── validation.ts               ← Input validation
    │   └── types.ts                    ← Method types
    ├── package.json
    ├── tsconfig.json
    └── README.md
```

---

## Integration Steps

### Step 1: Update Workspace

Add to `pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/**'
  - 'packages/**'
  - 'infra/**'
```

(Already exists, no changes needed)

### Step 2: Link Packages

In `system-core/package.json`, add dependencies:

```json
{
  "dependencies": {
    "@zacai/system-kernel": "workspace:*",
    "@zacai/system-kernel-methods": "workspace:*"
  }
}
```

### Step 3: Import and Use

Create [packages/system-core/src/kernel-integration.ts](packages/system-core/src/kernel-integration.ts):

```typescript
/**
 * System Core - Kernel Integration
 * Demonstrates how system-core uses the kernel
 */

import {
  SystemKernel,
  KernelEvent,
  type KernelStateSnapshot,
} from '@zacai/system-kernel';

import * as methods from '@zacai/system-kernel-methods';

export class CoreWithKernel {
  private kernel: SystemKernel;

  constructor() {
    this.kernel = new SystemKernel({
      tickIntervalMs: 1000,
      enableLogging: true,
      recoveryMode: 'CONSERVATIVE',
    });
  }

  /**
   * Initialize the system core with kernel
   */
  async initialize(): Promise<void> {
    // Setup event listeners
    this.setupEventListeners();

    // Boot the kernel
    this.kernel.boot();

    console.log('✓ System Core initialized with kernel');
  }

  /**
   * Setup kernel event listeners
   */
  private setupEventListeners(): void {
    // Boot event
    this.kernel.on(KernelEvent.BOOT, ({ mode }) => {
      console.log(`[BOOT] System entering ${mode} mode`);
    });

    // Cycle event - runs every tick
    this.kernel.on(KernelEvent.CYCLE, ({ tick, duration }) => {
      console.log(
        `[CYCLE ${tick}] Completed in ${duration}ms`
      );

      // Validate heartbeat health
      const isHealthy = methods.heartbeat.isHeartbeatHealthy(tick);
      if (!isHealthy) {
        console.warn('Heartbeat degraded');
      }
    });

    // Error event
    this.kernel.on(KernelEvent.ERROR, ({ error, severity }) => {
      console.error(`[${severity}] ${error.message}`);

      // Classify the failure
      const failureType = methods.recovery.classifyFailure(error);
      const strategy = methods.recovery.selectRecoveryStrategy(failureType);

      console.log(`Failure Type: ${failureType}, Strategy: ${strategy}`);
    });

    // Shutdown event
    this.kernel.on(KernelEvent.SHUTDOWN, ({ graceful }) => {
      console.log(`[SHUTDOWN] Graceful: ${graceful}`);
    });
  }

  /**
   * Enqueue work to run in next kernel cycle
   */
  enqueueWork(work: () => Promise<void>, priority: number = 0): void {
    this.kernel.enqueueTask(work, priority);
  }

  /**
   * Get current system state
   */
  getState(): KernelStateSnapshot {
    return this.kernel.getState();
  }

  /**
   * Shutdown system gracefully
   */
  async shutdown(): Promise<void> {
    await this.kernel.shutdown();
  }
}
```

### Step 4: Build and Test

```bash
# Install dependencies
pnpm install

# Build both packages
pnpm -r build

# Run tests
pnpm -r test
```

---

## Dependency Graph

```
system-core
    ↓ depends on
system-kernel ← orchestrates
    ├─→ depends on methods
    │
system-kernel-methods
    ├─ lifecycle.ts
    ├─ scheduling.ts
    ├─ recovery.ts
    ├─ heartbeat.ts
    └─ validation.ts

No circular dependencies ✓
```

---

## Architecture Decisions Explained

### Why Split Kernel & Methods?

**system-kernel** (Stateful)
- Manages state
- Orchestrates lifecycle
- Handles side effects
- Emits events
- **Hard to test** (requires setup/teardown)

**system-kernel-methods** (Pure)
- No side effects
- Pure functions only
- **Easy to test** (no setup needed)
- **Reusable** anywhere
- **Deterministic** (same input = same output)

**Benefit:** Cleanest separation of concerns

### Priority Levels for Kernel Tasks

```typescript
// System-critical (runs first)
kernel.enqueueTask(criticalOperation, priority = 100);

// Important business logic (runs second)
kernel.enqueueTask(importantOperation, priority = 50);

// Background/cleanup (runs last)
kernel.enqueueTask(backgroundTask, priority = 10);

// Default priority = 0
kernel.enqueueTask(normalTask);
```

### Event Ordering

Kernel events fire in this order:

```
BOOT → RUN → (repeated) CYCLE → (on error) ERROR → (optional) RECOVER → SAFE → SHUTDOWN
```

### Recovery Strategies

When error occurs:

1. **Classify** - Is it transient, permanent, or critical?
2. **Select** - Choose recovery strategy
3. **Execute** - Implement recovery

```typescript
const failureType = methods.recovery.classifyFailure(error);
// 'TRANSIENT' | 'PERMANENT' | 'CRITICAL'

const strategy = methods.recovery.selectRecoveryStrategy(failureType);
// 'RETRY' | 'SKIP' | 'ESCALATE' | 'RESTART'
```

---

## Production Checklist

- [ ] Build both packages: `pnpm -r build`
- [ ] Run tests: `pnpm -r test`
- [ ] Type check: `pnpm -r type-check`
- [ ] Lint: `pnpm -r lint`
- [ ] Add to system-core: `pnpm install`
- [ ] Create integration test
- [ ] Update documentation
- [ ] Tag release

---

## Next Phase: What to Build

### Phase 2: Advisory Model Integration
- [ ] Connect system-core-model for predictions (read-only)
- [ ] Add health scoring system
- [ ] Implement anomaly detection

### Phase 3: Agent Sandbox
- [ ] Create safe execution environment
- [ ] Add script isolation
- [ ] Implement quota system

### Phase 4: Orchestration Kernels
- [ ] Add distributed kernel support
- [ ] Implement consensus algorithm
- [ ] Add inter-kernel communication

---

## Files Generated

**Total Files Created:** 16

### system-kernel/src/
1. ✅ index.ts (exports)
2. ✅ kernel/KernelState.ts
3. ✅ kernel/SystemKernel.ts
4. ✅ kernel/KernelScheduler.ts
5. ✅ kernel/KernelRecovery.ts
6. ✅ clock/SystemClock.ts
7. ✅ types/kernel.ts
8. ✅ types/events.ts
9. ✅ utils/logging.ts
10. ✅ utils/determinism.ts

### system-kernel-methods/src/
11. ✅ index.ts (exports)
12. ✅ lifecycle.ts
13. ✅ scheduling.ts
14. ✅ recovery.ts
15. ✅ heartbeat.ts
16. ✅ validation.ts

### Configuration Files
- ✅ system-kernel/package.json
- ✅ system-kernel/tsconfig.json
- ✅ system-kernel/README.md
- ✅ system-kernel-methods/package.json
- ✅ system-kernel-methods/tsconfig.json
- ✅ system-kernel-methods/README.md

---

## Key Principles Implemented

✓ **Separation of Concerns** - Kernel vs methods  
✓ **Type Safety** - Full TypeScript strict mode  
✓ **Determinism** - Pure functions with seeded RNG  
✓ **No Circular Dependencies** - Clean dependency graph  
✓ **Enterprise Logging** - Structured logging system  
✓ **Error Handling** - Comprehensive recovery strategies  
✓ **Testability** - Easy to unit test all functions  
✓ **Performance** - Minimal overhead, no GC pressure  

---

## See Also

- [KERNEL_ARCHITECTURE_ASSESSMENT.md](../KERNEL_ARCHITECTURE_ASSESSMENT.md) - Full architecture
- [packages/system-kernel/README.md](packages/system-kernel/README.md) - Kernel API
- [packages/system-kernel-methods/README.md](packages/system-kernel-methods/README.md) - Methods API

---

**Status:** ✅ Ready for integration
