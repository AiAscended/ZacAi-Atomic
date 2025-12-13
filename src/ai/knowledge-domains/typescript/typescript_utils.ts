export const safeParseJSON = <T = unknown>(s: string, fallback: T): T => {
  try {
    return JSON.parse(s) as T
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[TypeScript] Failed to parse JSON, returning fallback.", error)
    }
    return fallback
  }
}

export const normalizeCode = (s: string) => s.replace(/\r\n/g, "\n").trim()

export const normalizeText = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim()
