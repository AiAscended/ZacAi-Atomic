/**
 * File: src/ai/orchestration/eventBus.ts
 * Purpose: Lightweight in-memory event bus for module communication (pub/sub).
 * Provides robust subscription management and error isolation.
 */

type Handler = (payload: unknown) => void

const handlers = new Map<string, Set<Handler>>()

export const subscribe = (topic: string, h: Handler) => {
  if (!handlers.has(topic)) handlers.set(topic, new Set())
  handlers.get(topic)!.add(h)
  return () => handlers.get(topic)!.delete(h)
}

export const publish = (topic: string, payload: unknown) => {
  const set = handlers.get(topic)
  if (!set) return
  for (const h of Array.from(set)) {
    try {
      h(payload)
    } catch (e) {
      // swallow per-subscription errors; orchestrator can listen to 'error' topic
      publish('error', { topic, error: e })
    }
  }
}

export const clearAll = () => handlers.clear()
