/**
 * File: src/ai/context_management/sessionManager.ts
 * Description: Manage simple sessions with TTL and storage.
 */

// generateId not needed here; use simple local ids
export interface Session {
  id: string
  createdAt: number
  lastActive: number
  data: Record<string, unknown>
}

export class SessionManager {
  private sessions = new Map<string, Session>()

  create(customId?: string, initial: Record<string, unknown> = {}): Session {
    const id = customId || `sess-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    const s: Session = { id, createdAt: Date.now(), lastActive: Date.now(), data: initial }
    this.sessions.set(id, s)
    return s
  }

  get(id: string): Session | undefined {
    const s = this.sessions.get(id)
    if (s) s.lastActive = Date.now()
    return s
  }

  destroy(id: string) {
    this.sessions.delete(id)
  }
}
