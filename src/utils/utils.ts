/**
 * General utility helpers
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const generateId = (): string => {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

type DebounceFunction = (...args: unknown[]) => void

export function debounce(func: DebounceFunction, wait: number): DebounceFunction {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: unknown[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

type ThrottleFunction = (...args: unknown[]) => void

export function throttle(func: ThrottleFunction, limit: number): ThrottleFunction {
  let inThrottle = false
  return (...args: unknown[]) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback
  }
}
