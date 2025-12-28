# System Kernel Methods

**Pure deterministic functions for the ZacAi kernel.**

Core business logic separated from kernel implementation:
- ✅ Lifecycle state machine logic
- ✅ Task scheduling algorithms
- ✅ Error recovery strategies
- ✅ Heartbeat validation
- ✅ Input validation
- ✅ **100% pure functions (no side effects)**

## Quick Start

```typescript
import * as methods from '@zacai/system-kernel-methods';

// Validate state transitions
const valid = methods.lifecycle.validateLifecycleTransition('BOOT', 'RUN');
// true

// Schedule tasks
const tasks = [
  { id: 'a', priority: 5 },
  { id: 'b', priority: 10 },
  { id: 'c', priority: 3 },
];

const sorted = methods.scheduling.prioritySort(tasks);
// [b, a, c] - highest priority first

// Classify errors
const failureType = methods.recovery.classifyFailure(
  new Error('OOM: Out of memory')
);
// 'CRITICAL'

// Check heartbeat health
const healthy = methods.heartbeat.isHeartbeatHealthy(42);
// true
```

## Modules

### Lifecycle

State machine and mode validation logic.

```typescript
import { lifecycle } from '@zacai/system-kernel-methods';

lifecycle.validateLifecycleTransition('RUN', 'SAFE');
// true

lifecycle.getValidTransitions('RUN');
// ['SAFE', 'SHUTDOWN']

lifecycle.isSafeMode('RUN');
// true

lifecycle.getModeDescription('BOOT');
// 'System initializing'
```

### Scheduling

Task prioritization and backoff algorithms.

```typescript
import { scheduling } from '@zacai/system-kernel-methods';

// Sort by priority (highest first)
scheduling.prioritySort(tasks);

// Calculate exponential backoff with jitter
const delayMs = scheduling.calculateBackoff(
  attempt = 2,
  baseMs = 100,
  maxMs = 30000,
  jitterFactor = 0.1
);
// ~375ms (2^2 * 100ms + jitter)

// Check if should retry
scheduling.shouldRetry(error, attempt = 2, maxAttempts = 3);
// true

// Estimate deadline
scheduling.estimateDeadline(priority = 8, Date.now());
// future timestamp
```

### Recovery

Error classification and recovery strategy selection.

```typescript
import { recovery } from '@zacai/system-kernel-methods';

// Classify failure type
recovery.classifyFailure(new Error('EAGAIN'));
// 'TRANSIENT'

recovery.classifyFailure(new Error('OOM'));
// 'CRITICAL'

// Select recovery strategy
recovery.selectRecoveryStrategy(
  'TRANSIENT',
  attempt = 1,
  maxAttempts = 3
);
// 'RETRY'

recovery.selectRecoveryStrategy('CRITICAL');
// 'RESTART'

// Get explanation
recovery.explainFailure(error);
// '[TRANSIENT] Connection reset - Recovery: RETRY'
```

### Heartbeat

Tick validation and health checking.

```typescript
import { heartbeat } from '@zacai/system-kernel-methods';

// Check if healthy
heartbeat.isHeartbeatHealthy(42);
// true

// Validate tick interval
heartbeat.isTickIntervalValid(
  actualIntervalMs = 1005,
  expectedIntervalMs = 1000,
  tolerancePercent = 10
);
// true

// Calculate deterministic jitter
const jitter = heartbeat.calculateHeartbeatJitter(
  tick = 42,
  maxJitterPercent = 5
);
// 0.00123... (deterministic)

// Estimate ticks per second
heartbeat.calculateTicksPerSecond(ticks = 100, elapsedMs = 1000);
// 100 TPS

// Detect drift
heartbeat.isHeartbeatDrifting(
  expectedTps = 100,
  actualTps = 75,
  driftThresholdPercent = 20
);
// true - heartbeat is drifting!
```

### Validation

Input validation helpers.

```typescript
import { validation } from '@zacai/system-kernel-methods';

validation.validateSystemMode('RUN');
// true

validation.validateTickCount(42);
// true

validation.validatePriority(5);
// true

validation.validateIntervalMs(1000);
// true

validation.validateTaskId('task-123');
// true
```

## Properties

### Pure Functions

All functions are **pure**:
- ✅ No side effects
- ✅ Deterministic (same input = same output)
- ✅ No external dependencies
- ✅ No async operations
- ✅ Fully testable

### Determinism

Functions use seeded pseudo-random for deterministic "randomness":

```typescript
// Same tick = same jitter (deterministic)
heartbeat.calculateHeartbeatJitter(42, 5);
// Always returns same value for tick 42

// Perfect for:
// - Testing
// - Debugging
// - Replay
// - Verification
```

### No Side Effects

Functions only compute and return values:

```typescript
// ✅ Pure
scheduling.prioritySort(tasks); // Returns new array

// ❌ Impure (would mutate)
tasks.sort(...); // Mutates original
```

## Testing

```typescript
import * as methods from '@zacai/system-kernel-methods';

describe('Lifecycle Methods', () => {
  it('validates BOOT -> RUN transition', () => {
    const valid = methods.lifecycle.validateLifecycleTransition('BOOT', 'RUN');
    expect(valid).toBe(true);
  });

  it('rejects invalid transitions', () => {
    const valid = methods.lifecycle.validateLifecycleTransition('SHUTDOWN', 'RUN');
    expect(valid).toBe(false);
  });
});

describe('Recovery Methods', () => {
  it('classifies OOM as critical', () => {
    const type = methods.recovery.classifyFailure(new Error('OOM'));
    expect(type).toBe('CRITICAL');
  });

  it('selects RESTART for critical failures', () => {
    const strategy = methods.recovery.selectRecoveryStrategy('CRITICAL');
    expect(strategy).toBe('RESTART');
  });
});

describe('Heartbeat Methods', () => {
  it('detects healthy heartbeat', () => {
    expect(methods.heartbeat.isHeartbeatHealthy(42)).toBe(true);
    expect(methods.heartbeat.isHeartbeatHealthy(0)).toBe(false);
  });

  it('validates tick intervals', () => {
    const valid = methods.heartbeat.isTickIntervalValid(1005, 1000, 10);
    expect(valid).toBe(true);
  });
});
```

## Determinism Verification

Verify operations are deterministic:

```typescript
import { verifyDeterminism } from '@zacai/system-kernel';

const isDeterministic = verifyDeterminism(
  () => heartbeat.calculateHeartbeatJitter(42, 5),
  runs = 100 // Run 100 times
);

expect(isDeterministic).toBe(true);
```

## Performance

- **No allocation**: Methods use only stack
- **No I/O**: Everything in-process
- **Sub-microsecond**: Most operations <1µs
- **Zero GC pressure**: No temporary objects

## See Also

- [@zacai/system-kernel](../system-kernel/) - Stateful kernel implementation
- [KERNEL_ARCHITECTURE_ASSESSMENT.md](../../KERNEL_ARCHITECTURE_ASSESSMENT.md) - Architecture details
