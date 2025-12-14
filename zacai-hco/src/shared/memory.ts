import { createClient, SupabaseClient } from "@supabase/supabase-js"
import type { HCOState, MemorySnapshot } from "./types"

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

let client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase credentials are not configured")
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }
  return client
}

export class TrajectoryMemory {
  private table = "hco_trajectories"
  private limit = 10

  async loadRecent(userId: string): Promise<MemorySnapshot[]> {
    const { data, error } = await getClient()
      .from(this.table)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(this.limit)

    if (error) {
      throw error
    }
    return data as MemorySnapshot[]
  }

  async save(userId: string, state: HCOState): Promise<void> {
    const payload = {
      user_id: userId,
      happiness: state.happiness,
      trajectory: state,
    }
    const { error } = await getClient().from(this.table).insert(payload)
    if (error) {
      throw error
    }
  }
}

export const trajectoryMemory = new TrajectoryMemory()
