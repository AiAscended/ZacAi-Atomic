import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { HCOState } from "./types"
import { MEMORY_DEFAULT_TABLE } from "@/config/hcoConstants"

export class SupabaseMemoryStore {
  private client: SupabaseClient | null
  private buffer: HCOState[] = []
  private table: string

  constructor(table = process.env.SUPABASE_HCO_TABLE ?? MEMORY_DEFAULT_TABLE) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    this.client = url && key ? createClient(url, key) : null
    this.table = table
  }

  async recordTrajectory(state: HCOState): Promise<void> {
    this.buffer = [state, ...this.buffer].slice(0, 10)
    if (!this.client) {
      return
    }

    await this.client.from(this.table).insert({
      input: state.input,
      phase: state.phase,
      atomic_facts: state.atomicFacts,
      hypotheses: state.hypotheses,
      validations: state.validations,
      happiness: state.happiness,
      memory: state.memory,
      created_at: new Date().toISOString(),
    })
  }

  async getRecentTrajectories(): Promise<HCOState[]> {
    if (!this.client) {
      return this.buffer
    }

    const { data, error } = await this.client
      .from(this.table)
      .select("input, phase, atomic_facts, hypotheses, validations, happiness, memory")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error || !data) {
      return this.buffer
    }

    return data.map((row) => ({
      input: row.input as string,
      phase: row.phase as HCOState["phase"],
      atomicFacts: (row.atomic_facts ?? []) as HCOState["atomicFacts"],
      hypotheses: (row.hypotheses ?? []) as HCOState["hypotheses"],
      validations: (row.validations ?? []) as HCOState["validations"],
      happiness: (row.happiness as number) ?? 0,
      memory: (row.memory as Record<string, unknown>) ?? {},
    }))
  }
}
