import fs from "node:fs/promises"
import path from "node:path"
import { createHash } from "node:crypto"
import { MEMORY_PATHS } from "./constants"

export interface VectorRecord {
  id: string
  label: string
  embedding: number[]
  checksum: string
  metadata?: Record<string, unknown>
}

export class VectorMemoryService {
  private readonly indexPath = path.join(MEMORY_PATHS.vector, "index.json")
  private cache: VectorRecord[] | null = null

  async ensureReady(): Promise<void> {
    await fs.mkdir(MEMORY_PATHS.vector, { recursive: true })
    if (!(await this.exists(this.indexPath))) {
      await fs.writeFile(this.indexPath, JSON.stringify({ records: [] }, null, 2), "utf8")
    }
  }

  async index(record: Omit<VectorRecord, "id" | "checksum"> & { id?: string }): Promise<VectorRecord> {
    await this.ensureReady()
    const current = await this.readIndex()
    const id = record.id ?? `vector-${Date.now()}`
    const checksum = this.calculateChecksum(record.embedding)
    const payload: VectorRecord = { ...record, id, checksum }
    current.records = current.records.filter(existing => existing.id !== id)
    current.records.push(payload)
    await this.writeIndex(current.records)
    this.cache = current.records
    return payload
  }

  async search(query: number[], topK = 5): Promise<VectorRecord[]> {
    await this.ensureReady()
    const records = this.cache ?? (await this.readIndex()).records
    const scored = records
      .map(record => ({
        record,
        score: this.cosineSimilarity(query, record.embedding),
      }))
      .sort((a, b) => b.score - a.score)
    return scored.slice(0, topK).map(entry => entry.record)
  }

  private async readIndex(): Promise<{ records: VectorRecord[] }> {
    const raw = await fs.readFile(this.indexPath, "utf8")
    const parsed = JSON.parse(raw) as { records: VectorRecord[] }
    this.cache = parsed.records
    return parsed
  }

  private async writeIndex(records: VectorRecord[]): Promise<void> {
    await fs.writeFile(this.indexPath, JSON.stringify({ records }, null, 2), "utf8")
  }

  private calculateChecksum(values: number[]): string {
    return createHash("sha256").update(JSON.stringify(values)).digest("hex")
  }

  private async exists(target: string): Promise<boolean> {
    try {
      await fs.access(target)
      return true
    } catch {
      return false
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const minLength = Math.min(a.length, b.length)
    let dot = 0
    let magA = 0
    let magB = 0
    for (let i = 0; i < minLength; i += 1) {
      dot += a[i] * b[i]
      magA += a[i] * a[i]
      magB += b[i] * b[i]
    }
    if (!magA || !magB) {
      return 0
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB))
  }
}

export const vectorMemory = new VectorMemoryService()
