/**
 * File: src/ai/core/sessionManager.ts
 * Purpose: Manages AI conversation sessions with memory and context
 * Depends on: src/ai/core/types/aiTypes.ts
 * Depended on by: src/ai/orchestrator/orchestrator.ts
 * Creator: Vercel v0 Coding Assistant
 */

import type { SessionContext, Message } from "./types/aiTypes"

/**
 * SessionManager handles creation, retrieval, and management of conversation sessions.
 * Each session maintains its own context, history, and metadata.
 *
 * Features:
 * - In-memory session storage with automatic cleanup
 * - Configurable session timeout
 * - Message history management
 * - Context preservation across requests
 */
export class SessionManager {
  private sessions: Map<string, SessionContext>
  private readonly sessionTimeout: number
  private readonly maxSessions: number

  /**
   * Creates a new SessionManager instance
   * @param sessionTimeout - Time in milliseconds before a session expires (default: 1 hour)
   * @param maxSessions - Maximum number of concurrent sessions (default: 1000)
   */
  constructor(sessionTimeout = 3600000, maxSessions = 1000) {
    this.sessions = new Map()
    this.sessionTimeout = sessionTimeout
    this.maxSessions = maxSessions

    // Start cleanup interval to remove expired sessions
    this.startCleanupInterval()
  }

  /**
   * Creates a new session with a unique identifier
   * @returns The newly created session context
   */
  public createSession(): SessionContext {
    // Enforce max sessions limit
    if (this.sessions.size >= this.maxSessions) {
      this.cleanupOldestSession()
    }

    const sessionId = this.generateSessionId()
    const now = Date.now()

    const session: SessionContext = {
      sessionId,
      messages: [],
      createdAt: now,
      lastAccessedAt: now,
      metadata: {},
    }

    this.sessions.set(sessionId, session)
    return session
  }

  /**
   * Retrieves an existing session by ID
   * @param sessionId - The unique session identifier
   * @returns The session context or null if not found
   */
  public getSession(sessionId: string): SessionContext | null {
    const session = this.sessions.get(sessionId)

    if (!session) {
      return null
    }

    // Update last accessed time
    session.lastAccessedAt = Date.now()
    return session
  }

  /**
   * Adds a message to a session's history
   * @param sessionId - The session identifier
   * @param message - The message to add
   * @returns True if successful, false if session not found
   */
  public addMessage(sessionId: string, message: Message): boolean {
    const session = this.getSession(sessionId)

    if (!session) {
      return false
    }

    session.messages.push(message)
    return true
  }

  /**
   * Retrieves all messages from a session
   * @param sessionId - The session identifier
   * @returns Array of messages or empty array if session not found
   */
  public getMessages(sessionId: string): Message[] {
    const session = this.getSession(sessionId)
    return session ? session.messages : []
  }

  /**
   * Deletes a session and its associated data
   * @param sessionId - The session identifier
   * @returns True if session was deleted, false if not found
   */
  public deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId)
  }

  /**
   * Updates session metadata
   * @param sessionId - The session identifier
   * @param metadata - Metadata object to merge with existing metadata
   * @returns True if successful, false if session not found
   */
  public updateMetadata(sessionId: string, metadata: Record<string, unknown>): boolean {
    const session = this.getSession(sessionId)

    if (!session) {
      return false
    }

    session.metadata = { ...session.metadata, ...metadata }
    return true
  }

  /**
   * Gets the total number of active sessions
   * @returns Number of active sessions
   */
  public getSessionCount(): number {
    return this.sessions.size
  }

  /**
   * Generates a unique session identifier using timestamp and random values
   * @returns A unique session ID string
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36)
    const randomPart = Math.random().toString(36).substring(2, 15)
    return `session_${timestamp}_${randomPart}`
  }

  /**
   * Starts an interval to periodically clean up expired sessions
   */
  private startCleanupInterval(): void {
    // Run cleanup every 5 minutes
    setInterval(() => {
      this.cleanupExpiredSessions()
    }, 300000)
  }

  /**
   * Removes sessions that have exceeded the timeout period
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now()
    const expiredSessions: string[] = []

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastAccessedAt > this.sessionTimeout) {
        expiredSessions.push(sessionId)
      }
    }

    expiredSessions.forEach((sessionId) => {
      this.sessions.delete(sessionId)
    })

    if (expiredSessions.length > 0) {
      console.log(`[SessionManager] Cleaned up ${expiredSessions.length} expired sessions`)
    }
  }

  /**
   * Removes the oldest session when max capacity is reached
   */
  private cleanupOldestSession(): void {
    let oldestSessionId: string | null = null
    let oldestTime = Date.now()

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastAccessedAt < oldestTime) {
        oldestTime = session.lastAccessedAt
        oldestSessionId = sessionId
      }
    }

    if (oldestSessionId) {
      this.sessions.delete(oldestSessionId)
      console.log(`[SessionManager] Removed oldest session: ${oldestSessionId}`)
    }
  }
}
