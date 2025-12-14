const DEFAULT_BACKOFF = [100, 500, 2000] as const

export async function withRetry<T>(fn: () => Promise<T>, backoffs: readonly number[] = DEFAULT_BACKOFF): Promise<T> {
  let error: unknown
  for (let attempt = 0; attempt < backoffs.length; attempt++) {
    try {
      return await fn()
    } catch (err) {
      error = err
      const backoff = backoffs[attempt]
      if (attempt === backoffs.length - 1) break
      await new Promise((resolve) => setTimeout(resolve, backoff))
    }
  }
  throw error
}
