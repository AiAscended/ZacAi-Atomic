/**
 * File: src/ai/context_management/slotFiller.ts
 * Purpose: Minimal slot filler that extracts simple key/value pairs using regex.
 */

export const extractSlots = (text: string, slotNames: string[]): Record<string, string | null> => {
  const res: Record<string, string | null> = {}
  for (const s of slotNames) {
    const re = new RegExp(`${s}[:=]\\s*([\\w-]+)`, "i")
    const m = text.match(re)
    res[s] = m ? m[1] : null
  }
  return res
}

export class SlotFiller {
  private slotPatterns: Map<string, RegExp> = new Map()

  constructor() {
    // Initialize common slot patterns
    this.slotPatterns.set("name", /(?:name|called|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
    this.slotPatterns.set("email", /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/)
    this.slotPatterns.set("date", /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2})/)
    this.slotPatterns.set("time", /(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i)
    this.slotPatterns.set("location", /(?:in|at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/)
  }

  extractSlots(text: string, slotNames?: string[]): Record<string, string | null> {
    const slots: Record<string, string | null> = {}
    const targetSlots = slotNames || Array.from(this.slotPatterns.keys())

    for (const slotName of targetSlots) {
      const pattern = this.slotPatterns.get(slotName)
      if (pattern) {
        const match = text.match(pattern)
        slots[slotName] = match ? match[1] : null
      } else {
        // Fallback to generic pattern
        const genericPattern = new RegExp(`${slotName}[:=]\\s*([\\w-]+)`, "i")
        const match = text.match(genericPattern)
        slots[slotName] = match ? match[1] : null
      }
    }

    return slots
  }

  addSlotPattern(slotName: string, pattern: RegExp): void {
    this.slotPatterns.set(slotName, pattern)
  }
}
