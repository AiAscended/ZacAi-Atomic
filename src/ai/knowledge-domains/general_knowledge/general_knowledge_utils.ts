export const safeParseJSON = <T = unknown>(s: string, fallback: T): T => {
  try {
    return JSON.parse(s) as T
  } catch {
    return fallback
  }
}

export const normalizeText = (t: string) => t.replace(/\s+/g, " ").trim()
